"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/current-user";
import { canAccessManagement } from "@/lib/permissions/roles";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type MaintenanceFrequency = Database["public"]["Enums"]["maintenance_frequency"];

const frequencies = new Set<MaintenanceFrequency>(["MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY", "CUSTOM"]);

function value(formData: FormData, name: string) {
  const entry = formData.get(name);
  const text = typeof entry === "string" ? entry.trim() : "";
  return text.length > 0 ? text : null;
}

function frequencyValue(formData: FormData) {
  const frequency = value(formData, "frequency");
  return frequency && frequencies.has(frequency as MaintenanceFrequency) ? (frequency as MaintenanceFrequency) : null;
}

export async function createPlanAndJob(formData: FormData) {
  const profile = await requireProfile();

  if (!canAccessManagement(profile.role)) {
    redirect("/dashboard");
  }

  const clientId = value(formData, "client_id");
  const siteId = value(formData, "site_id");
  const name = value(formData, "name");
  const frequency = frequencyValue(formData);
  const startDate = value(formData, "start_date");
  const scheduledDate = value(formData, "scheduled_date") ?? startDate;
  const intervalDays = value(formData, "interval_days");
  const technicianId = value(formData, "assigned_technician_id");
  const equipmentId = value(formData, "equipment_id");

  if (!clientId || !siteId || !name || !frequency || !startDate || !scheduledDate) {
    redirect("/maintenance?error=missing-required");
  }

  const supabase = await createClient();
  let buildingId: string | null = null;

  if (equipmentId) {
    const { data: equipment, error: equipmentError } = await supabase
      .from("equipment")
      .select("id,building_id,buildings!inner(site_id)")
      .eq("id", equipmentId)
      .eq("organisation_id", profile.organisation_id)
      .eq("status", "ACTIVE")
      .maybeSingle();

    const equipmentSiteId = Array.isArray(equipment?.buildings)
      ? equipment?.buildings[0]?.site_id
      : equipment?.buildings?.site_id;

    if (equipmentError || !equipment || equipmentSiteId !== siteId) {
      redirect("/maintenance?error=equipment-site-mismatch");
    }

    buildingId = equipment.building_id;
  }

  const { data: plan, error: planError } = await supabase
    .from("maintenance_plans")
    .insert({
      organisation_id: profile.organisation_id,
      client_id: clientId,
      site_id: siteId,
      name,
      frequency,
      interval_days: frequency === "CUSTOM" && intervalDays ? Number(intervalDays) : null,
      start_date: startDate
    })
    .select("id")
    .single();

  if (planError || !plan) {
    redirect(`/maintenance?error=${encodeURIComponent(planError?.code ?? "plan-create-failed")}`);
  }

  const notes = value(formData, "notes");
  const jobArgs = {
    p_maintenance_plan_id: plan.id,
    p_client_id: clientId,
    p_site_id: siteId,
    p_building_id: buildingId,
    p_scheduled_date: scheduledDate,
    ...(technicianId ? { p_assigned_technician_id: technicianId } : {}),
    ...(notes ? { p_notes: notes } : {})
  } as unknown as Database["public"]["Functions"]["create_maintenance_job"]["Args"];

  const { data: job, error: jobError } = await supabase.rpc("create_maintenance_job", jobArgs);

  if (jobError || !job) {
    redirect(`/maintenance?error=${encodeURIComponent(jobError.code ?? "job-create-failed")}`);
  }

  if (equipmentId) {
    const { error: jobEquipmentError } = await supabase.from("job_equipment").insert({
      organisation_id: profile.organisation_id,
      job_id: job.id,
      equipment_id: equipmentId
    });

    if (jobEquipmentError) {
      redirect(`/maintenance?error=${encodeURIComponent(jobEquipmentError.code ?? "job-equipment-create-failed")}`);
    }
  }

  revalidatePath("/maintenance");
  revalidatePath("/dashboard");
  redirect("/maintenance?created=1");
}

export async function startJobReview(formData: FormData) {
  const profile = await requireProfile();

  if (!canAccessManagement(profile.role)) {
    redirect("/dashboard");
  }

  const jobId = value(formData, "job_id");

  if (!jobId) {
    redirect("/maintenance?error=missing-job");
  }

  const supabase = await createClient();
  const { data: assignedAssets, error: assignedAssetsError } = await supabase
    .from("job_equipment")
    .select("id,status")
    .eq("job_id", jobId);

  if (assignedAssetsError) {
    redirect(`/maintenance?error=${encodeURIComponent(assignedAssetsError.code ?? "asset-check-failed")}`);
  }

  const hasIncompleteChecklist = (assignedAssets ?? []).some((asset) => asset.status !== "COMPLETED");

  if (hasIncompleteChecklist) {
    redirect("/maintenance?error=incomplete-checklists");
  }

  const { data: reviewedJob, error } = await supabase
    .from("maintenance_jobs")
    .update({
      status: "UNDER_REVIEW",
      supervisor_id: profile.id
    })
    .eq("id", jobId)
    .eq("status", "SUBMITTED")
    .select("id")
    .maybeSingle();

  if (error || !reviewedJob) {
    redirect(`/maintenance?error=${encodeURIComponent(error?.code ?? "review-start-failed")}`);
  }

  revalidatePath("/maintenance");
  revalidatePath("/reports");
  revalidatePath("/dashboard");
  redirect("/maintenance?review=1");
}

export async function closeJobFromIssuedReport(formData: FormData) {
  const profile = await requireProfile();

  if (!canAccessManagement(profile.role)) {
    redirect("/dashboard");
  }

  const jobId = value(formData, "job_id");

  if (!jobId) {
    redirect("/maintenance?error=missing-job");
  }

  const supabase = await createClient();
  const { count: issuedReportCount, error: reportError } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("job_id", jobId)
    .eq("status", "ISSUED");

  if (reportError) {
    redirect(`/maintenance?error=${encodeURIComponent(reportError.code ?? "report-check-failed")}`);
  }

  if ((issuedReportCount ?? 0) === 0) {
    redirect("/maintenance?error=missing-issued-report");
  }

  const { data: completedJob, error } = await supabase
    .from("maintenance_jobs")
    .update({
      status: "COMPLETED",
      completed_at: new Date().toISOString()
    })
    .eq("id", jobId)
    .neq("status", "COMPLETED")
    .select("id")
    .maybeSingle();

  if (error || !completedJob) {
    redirect(`/maintenance?error=${encodeURIComponent(error?.code ?? "job-close-failed")}`);
  }

  revalidatePath("/maintenance");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/client/dashboard");
  redirect("/maintenance?closed=1");
}
