import { EmptyState } from "@/components/ui/states";
import { PageHeader } from "@/components/ui/page-header";

export default function TechnicianTodayPage() {
  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <PageHeader title="Today" description="Assigned jobs will download here for offline work." />
      <EmptyState title="No downloaded jobs" message="The offline job queue arrives in the technician slice." />
    </div>
  );
}
