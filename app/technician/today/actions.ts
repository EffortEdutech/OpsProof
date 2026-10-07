"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/current-user";
import { canAccessTechnician } from "@/lib/permissions/roles";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type FindingSeverity = Database["public"]["Enums"]["finding_severity"];

const severities = new Set<FindingSeverity>(["OBSERVATION", "LOW", "MEDIUM", "HIGH", "CRITICAL"]);

function value(formData: FormData, name: string) {
  const entry = formData.get(name);
  const text = typeof entry === "string" ? entry.trim() : "";
  return text.length > 0 ? text : null;
}

function nextPath(formData: FormData) {
  const next = value(formData, "next");
  return next?.startsWith("/technician/") ? next : "/technician/today";
}

function severityValue(formData: FormData) {
  const severity = value(formData, "severity");
  return severity && severities.has(severity as FindingSeverity) ? (severity as FindingSeverity) : "OBSERVATION";
}

export async function startJob(formData: FormData) {
  const profile = await requireProfile();

  if (!canAccessTechnician(profile.role)) {
    redirect("/dashboard");
  }

  const jobId = value(formData, "job_id");

  if (!jobId) {
    redirect("/technician/today?error=missing-job");
  }

  const redirectTo = nextPath(formData);
  const supabase = await createClient();
  const { error } = await supabase.rpc("start_maintenance_job", { p_job_id: jobId });

  if (error) {
    redirect(`/technician/today?error=${encodeURIComponent(error.code ?? "start-failed")}`);
  }

  revalidatePath("/technician/today");
  revalidatePath(`/technician/jobs/${jobId}`);
  revalidatePath("/maintenance");
  revalidatePath("/dashboard");
  redirect(`${redirectTo}?started=1`);
}

export async function submitJob(formData: FormData) {
  const profile = await requireProfile();

  if (!canAccessTechnician(profile.role)) {
    redirect("/dashboard");
  }

  const jobId = value(formData, "job_id");

  if (!jobId) {
    redirect("/technician/today?error=missing-job");
  }

  const redirectTo = nextPath(formData);
  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_job", { p_job_id: jobId });

  if (error) {
    redirect(`/technician/today?error=${encodeURIComponent(error.code ?? "submit-failed")}`);
  }

  revalidatePath("/technician/today");
  revalidatePath(`/technician/jobs/${jobId}`);
  revalidatePath("/maintenance");
  revalidatePath("/reports");
  revalidatePath("/dashboard");
  redirect(`${redirectTo}?submitted=1`);
}

export async function addFinding(formData: FormData) {
  const profile = await requireProfile();

  if (!canAccessTechnician(profile.role)) {
    redirect("/dashboard");
  }

  const jobId = value(formData, "job_id");
  const title = value(formData, "title");
  const equipmentId = value(formData, "equipment_id");

  if (!jobId || !title) {
    redirect("/technician/today?error=missing-finding");
  }

  const redirectTo = nextPath(formData);
  const supabase = await createClient();
  const { data: job, error: jobError } = await supabase
    .from("maintenance_jobs")
    .select("id,organisation_id")
    .eq("id", jobId)
    .eq("assigned_technician_id", profile.id)
    .eq("status", "IN_PROGRESS")
    .single();

  if (jobError || !job) {
    redirect("/technician/today?error=job-not-started");
  }

  if (equipmentId) {
    const { data: assignedAsset, error: equipmentError } = await supabase
      .from("job_equipment")
      .select("id")
      .eq("job_id", job.id)
      .eq("equipment_id", equipmentId)
      .maybeSingle();

    if (equipmentError || !assignedAsset) {
      redirect(`${redirectTo}?error=equipment-not-assigned`);
    }
  }

  const { error } = await supabase.from("findings").insert({
    organisation_id: job.organisation_id,
    job_id: job.id,
    equipment_id: equipmentId,
    title,
    severity: severityValue(formData),
    description: value(formData, "description"),
    recommendation: value(formData, "recommendation"),
    created_by: profile.id
  });

  if (error) {
    redirect(`/technician/today?error=${encodeURIComponent(error.code ?? "finding-failed")}`);
  }

  revalidatePath("/technician/today");
  revalidatePath(`/technician/jobs/${jobId}`);
  redirect(`${redirectTo}?finding=1`);
}

export async function startAssetInspection(formData: FormData) {
  const profile = await requireProfile();

  if (!canAccessTechnician(profile.role)) {
    redirect("/dashboard");
  }

  const jobEquipmentId = value(formData, "job_equipment_id");
  const redirectTo = nextPath(formData);

  if (!jobEquipmentId) {
    redirect(`${redirectTo}?error=missing-asset`);
  }

  const supabase = await createClient();
  const { data: assignedAsset, error: assetError } = await supabase
    .from("job_equipment")
    .select("id,job_id,organisation_id,equipment(equipment_type_id),maintenance_jobs(assigned_technician_id,status)")
    .eq("id", jobEquipmentId)
    .maybeSingle();

  const assignedToCurrentUser = Array.isArray(assignedAsset?.maintenance_jobs)
    ? assignedAsset?.maintenance_jobs[0]?.assigned_technician_id === profile.id
    : assignedAsset?.maintenance_jobs?.assigned_technician_id === profile.id;
  const jobStatus = Array.isArray(assignedAsset?.maintenance_jobs)
    ? assignedAsset?.maintenance_jobs[0]?.status
    : assignedAsset?.maintenance_jobs?.status;
  const equipmentTypeId = Array.isArray(assignedAsset?.equipment)
    ? assignedAsset?.equipment[0]?.equipment_type_id
    : assignedAsset?.equipment?.equipment_type_id;

  if (assetError || !assignedAsset || !assignedToCurrentUser || jobStatus !== "IN_PROGRESS" || !equipmentTypeId) {
    redirect(`${redirectTo}?error=inspection-not-ready`);
  }

  const { data: template, error: templateError } = await supabase
    .from("inspection_templates")
    .select("id")
    .eq("equipment_type_id", equipmentTypeId)
    .eq("status", "ACTIVE")
    .or(`organisation_id.is.null,organisation_id.eq.${profile.organisation_id}`)
    .order("organisation_id", { ascending: false, nullsFirst: false })
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (templateError || !template) {
    redirect(`${redirectTo}?error=missing-template`);
  }

  const { data: inspection, error: inspectionError } = await supabase
    .from("inspections")
    .upsert(
      {
        organisation_id: assignedAsset.organisation_id,
        job_id: assignedAsset.job_id,
        job_equipment_id: assignedAsset.id,
        template_id: template.id,
        technician_id: profile.id,
        status: "IN_PROGRESS",
        started_at: new Date().toISOString()
      },
      { onConflict: "job_equipment_id" }
    )
    .select("id")
    .single();

  if (inspectionError || !inspection) {
    redirect(`${redirectTo}?error=${encodeURIComponent(inspectionError?.code ?? "inspection-start-failed")}`);
  }

  const { error: statusError } = await supabase
    .from("job_equipment")
    .update({ status: "IN_PROGRESS" })
    .eq("id", assignedAsset.id);

  if (statusError) {
    redirect(`${redirectTo}?error=${encodeURIComponent(statusError.code ?? "asset-status-failed")}`);
  }

  revalidatePath("/technician/today");
  revalidatePath(`/technician/jobs/${assignedAsset.job_id}`);
  redirect(`${redirectTo}?inspection=1`);
}

export async function completeAssetInspection(formData: FormData) {
  const profile = await requireProfile();

  if (!canAccessTechnician(profile.role)) {
    redirect("/dashboard");
  }

  const inspectionId = value(formData, "inspection_id");
  const jobEquipmentId = value(formData, "job_equipment_id");
  const jobId = value(formData, "job_id");
  const redirectTo = nextPath(formData);

  if (!inspectionId || !jobEquipmentId || !jobId) {
    redirect(`${redirectTo}?error=missing-inspection`);
  }

  const supabase = await createClient();
  const { error: inspectionError } = await supabase.rpc("submit_inspection", { p_inspection_id: inspectionId });

  if (inspectionError) {
    redirect(`${redirectTo}?error=${encodeURIComponent(inspectionError.code ?? "inspection-complete-failed")}`);
  }

  const { error: statusError } = await supabase
    .from("job_equipment")
    .update({ status: "COMPLETED" })
    .eq("id", jobEquipmentId);

  if (statusError) {
    redirect(`${redirectTo}?error=${encodeURIComponent(statusError.code ?? "asset-complete-failed")}`);
  }

  revalidatePath("/technician/today");
  revalidatePath(`/technician/jobs/${jobId}`);
  redirect(`${redirectTo}?inspectionCompleted=1`);
}
