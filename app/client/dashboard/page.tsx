import { EmptyState } from "@/components/ui/states";
import { PageHeader } from "@/components/ui/page-header";

export default function ClientDashboardPage() {
  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <PageHeader title="Client Dashboard" description="Issued reports and evidence will appear here." />
      <EmptyState title="No issued reports loaded" message="Client data stays read-only and RLS-scoped." />
    </div>
  );
}
