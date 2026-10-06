import { redirect } from "next/navigation";
import { TechnicianShell } from "@/components/layout/technician-shell";
import { requireProfile, requireUser } from "@/lib/auth/current-user";

export default async function TechnicianLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireProfile();
  const user = await requireUser();

  if (profile.role !== "TECHNICIAN") {
    redirect("/dashboard");
  }

  return <TechnicianShell currentUser={{ email: user.email ?? null, profile }}>{children}</TechnicianShell>;
}
