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

  if (!clientId || !siteId || !name || !frequency || !startDate || !scheduledDate) {
    redirect("/maintenance?error=missing-required");
  }

  const supabase = await createClient();
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
    p_building_id: null,
    p_scheduled_date: scheduledDate,
    ...(notes ? { p_notes: notes } : {})
  } as unknown as Database["public"]["Functions"]["create_maintenance_job"]["Args"];

  const { error: jobError } = await supabase.rpc("create_maintenance_job", jobArgs);

  if (jobError) {
    redirect(`/maintenance?error=${encodeURIComponent(jobError.code ?? "job-create-failed")}`);
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
