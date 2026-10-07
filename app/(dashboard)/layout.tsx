import { redirect } from "next/navigation";
import { ManagementShell } from "@/components/layout/management-shell";
import { requireProfile, requireUser } from "@/lib/auth/current-user";
import { canAccessManagement, canAccessClientPortal, canAccessTechnician } from "@/lib/permissions/roles";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireProfile();
  const user = await requireUser();

  if (!canAccessManagement(profile.role)) {
    if (canAccessClientPortal(profile.role)) {
      redirect("/client/dashboard");
    }

    if (canAccessTechnician(profile.role)) {
      redirect("/technician/today");
    }

    redirect("/login");
  }

  return <ManagementShell currentUser={{ email: user.email ?? null, profile }}>{children}</ManagementShell>;
}
