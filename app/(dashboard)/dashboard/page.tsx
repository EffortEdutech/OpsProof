import { EmptyState } from "@/components/ui/states";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { count: clientCount } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true });
  const { count: siteCount } = await supabase
    .from("sites")
    .select("id", { count: "exact", head: true });
  const { count: scheduledJobCount } = await supabase
    .from("maintenance_jobs")
    .select("id", { count: "exact", head: true })
    .eq("status", "SCHEDULED");
  const { count: submittedJobCount } = await supabase
    .from("maintenance_jobs")
    .select("id", { count: "exact", head: true })
    .eq("status", "SUBMITTED");
  const { count: underReviewJobCount } = await supabase
    .from("maintenance_jobs")
    .select("id", { count: "exact", head: true })
    .eq("status", "UNDER_REVIEW");
  const { count: reportCount } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true });

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <PageHeader title="Dashboard" description="Management attention queues will appear here." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem" }}>
        <Card>
          <div style={{ color: "var(--muted)" }}>Clients</div>
          <strong style={{ display: "block", fontSize: "2rem", marginTop: 8 }}>{clientCount ?? 0}</strong>
        </Card>
        <Card>
          <div style={{ color: "var(--muted)" }}>Sites</div>
          <strong style={{ display: "block", fontSize: "2rem", marginTop: 8 }}>{siteCount ?? 0}</strong>
        </Card>
        <Card>
          <div style={{ color: "var(--muted)" }}>Scheduled Jobs</div>
          <strong style={{ display: "block", fontSize: "2rem", marginTop: 8 }}>{scheduledJobCount ?? 0}</strong>
        </Card>
        <Card>
          <div style={{ color: "var(--muted)" }}>Awaiting Review</div>
          <strong style={{ display: "block", fontSize: "2rem", marginTop: 8 }}>{submittedJobCount ?? 0}</strong>
        </Card>
        <Card>
          <div style={{ color: "var(--muted)" }}>Ready for Report</div>
          <strong style={{ display: "block", fontSize: "2rem", marginTop: 8 }}>{underReviewJobCount ?? 0}</strong>
        </Card>
        <Card>
          <div style={{ color: "var(--muted)" }}>Reports</div>
          <strong style={{ display: "block", fontSize: "2rem", marginTop: 8 }}>{reportCount ?? 0}</strong>
        </Card>
      </div>
      <EmptyState
        title="Phase 0 shell"
        message="Domain KPIs start after the foundation, RLS, and feature slices are verified."
      />
    </div>
  );
}
