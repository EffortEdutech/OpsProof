"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/current-user";
import { canAccessManagement } from "@/lib/permissions/roles";
import { createClient } from "@/lib/supabase/server";

function value(formData: FormData, name: string) {
  const entry = formData.get(name);
  const text = typeof entry === "string" ? entry.trim() : "";
  return text.length > 0 ? text : null;
}

export async function createSiteRecord(formData: FormData) {
  const profile = await requireProfile();

  if (!canAccessManagement(profile.role)) {
    redirect("/dashboard");
  }

  const clientId = value(formData, "client_id");
  const name = value(formData, "name");

  if (!clientId || !name) {
    redirect("/sites?error=missing-required");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("sites").insert({
    organisation_id: profile.organisation_id,
    client_id: clientId,
    name,
    site_code: value(formData, "site_code"),
    address: value(formData, "address"),
    city: value(formData, "city"),
    state: value(formData, "state"),
    postcode: value(formData, "postcode"),
    country: value(formData, "country") ?? "Malaysia"
  });

  if (error) {
    redirect(`/sites?error=${encodeURIComponent(error.code ?? "create-failed")}`);
  }

  revalidatePath("/sites");
  revalidatePath("/dashboard");
  redirect("/sites?created=1");
}
