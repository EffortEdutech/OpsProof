import { EmptyState } from "@/components/ui/states";
import { PageHeader } from "@/components/ui/page-header";

export default function DashboardPage() {
  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <PageHeader title="Dashboard" description="Management attention queues will appear here." />
      <EmptyState
        title="Phase 0 shell"
        message="Domain KPIs start after the foundation, RLS, and feature slices are verified."
      />
    </div>
  );
}
