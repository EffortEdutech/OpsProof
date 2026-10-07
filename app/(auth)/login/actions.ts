"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/supabase/types";

function getRoleHome(role: AppRole | null | undefined) {
  if (role === "CLIENT") {
    return "/client/dashboard";
  }

  if (role === "TECHNICIAN") {
    return "/technician/today";
  }

  return "/dashboard";
}

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

  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).eq("active", true).maybeSingle()
    : { data: null };

  redirect(next === "/dashboard" ? getRoleHome(profile?.role) : next);
}
