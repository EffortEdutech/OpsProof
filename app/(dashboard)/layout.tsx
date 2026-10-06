import { redirect } from "next/navigation";
import { ManagementShell } from "@/components/layout/management-shell";
import { requireProfile } from "@/lib/auth/current-user";
import { canAccessManagement, canAccessClientPortal } from "@/lib/permissions/roles";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireProfile();

  if (!canAccessManagement(profile.role)) {
    if (canAccessClientPortal(profile.role)) {
      redirect("/client/dashboard");
    }

    redirect("/login");
  }

  return <ManagementShell>{children}</ManagementShell>;
}
