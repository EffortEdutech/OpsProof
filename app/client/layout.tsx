import { ClientShell } from "@/components/layout/client-shell";

export default function ClientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ClientShell>{children}</ClientShell>;
}
