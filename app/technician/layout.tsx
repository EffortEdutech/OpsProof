import { TechnicianShell } from "@/components/layout/technician-shell";

export default function TechnicianLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <TechnicianShell>{children}</TechnicianShell>;
}
