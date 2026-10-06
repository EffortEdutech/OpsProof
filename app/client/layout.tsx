import { redirect } from "next/navigation";
import { ClientShell } from "@/components/layout/client-shell";
import { requireProfile, requireUser } from "@/lib/auth/current-user";
import { canAccessClientPortal } from "@/lib/permissions/roles";

export default async function ClientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireProfile();
  const user = await requireUser();

  if (!canAccessClientPortal(profile.role)) {
    redirect("/dashboard");
  }

  return <ClientShell currentUser={{ email: user.email ?? null, profile }}>{children}</ClientShell>;
}
