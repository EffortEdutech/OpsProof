"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getSafeNext(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = getSafeNext(formData.get("next"));

  if (!email || !password) {
    redirect(`/login?next=${encodeURIComponent(next)}&error=missing`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?next=${encodeURIComponent(next)}&error=invalid`);
  }

  redirect(next);
}
