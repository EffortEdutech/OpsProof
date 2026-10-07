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

  const supabase = await createClient();
  const { error } = await supabase.rpc("start_maintenance_job", { p_job_id: jobId });

  if (error) {
    redirect(`/technician/today?error=${encodeURIComponent(error.code ?? "start-failed")}`);
  }

  revalidatePath("/technician/today");
  revalidatePath("/maintenance");
  revalidatePath("/dashboard");
  redirect("/technician/today?started=1");
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

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_job", { p_job_id: jobId });

  if (error) {
    redirect(`/technician/today?error=${encodeURIComponent(error.code ?? "submit-failed")}`);
  }

  revalidatePath("/technician/today");
  revalidatePath("/maintenance");
  revalidatePath("/reports");
  revalidatePath("/dashboard");
  redirect("/technician/today?submitted=1");
}

export async function addFinding(formData: FormData) {
  const profile = await requireProfile();

  if (!canAccessTechnician(profile.role)) {
    redirect("/dashboard");
  }

  const jobId = value(formData, "job_id");
  const title = value(formData, "title");

  if (!jobId || !title) {
    redirect("/technician/today?error=missing-finding");
  }

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

  const { error } = await supabase.from("findings").insert({
    organisation_id: job.organisation_id,
    job_id: job.id,
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
  redirect("/technician/today?finding=1");
}
