import { EmptyState } from "@/components/ui/states";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

function MetricCard({ label, value, note }: { label: string; value: number | null; note?: string }) {
  return (
    <Card>
      <div style={{ color: "var(--muted)" }}>{label}</div>
      <strong style={{ display: "block", fontSize: "2rem", marginTop: 8 }}>{value ?? 0}</strong>
      {note ? <div style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: 6 }}>{note}</div> : null}
    </Card>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const [
    { count: clientCount },
    { count: siteCount },
    { count: scheduledJobCount },
    { count: inProgressJobCount },
    { count: submittedJobCount },
    { count: underReviewJobCount },
    { count: completedJobCount },
    { count: generatedReportCount },
    { count: reviewedReportCount },
    { count: issuedReportCount },
    { count: checklistResultCount }
  ] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("sites").select("id", { count: "exact", head: true }),
    supabase.from("maintenance_jobs").select("id", { count: "exact", head: true }).eq("status", "SCHEDULED"),
    supabase.from("maintenance_jobs").select("id", { count: "exact", head: true }).eq("status", "IN_PROGRESS"),
    supabase.from("maintenance_jobs").select("id", { count: "exact", head: true }).eq("status", "SUBMITTED"),
    supabase.from("maintenance_jobs").select("id", { count: "exact", head: true }).eq("status", "UNDER_REVIEW"),
    supabase.from("maintenance_jobs").select("id", { count: "exact", head: true }).eq("status", "COMPLETED"),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "GENERATED"),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "REVIEWED"),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "ISSUED"),
    supabase.from("inspection_results").select("id", { count: "exact", head: true })
  ]);

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <PageHeader title="Dashboard" description="Management queues for jobs, reports, and client delivery." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        <MetricCard label="Scheduled Jobs" value={scheduledJobCount} note="Assigned or ready to start" />
        <MetricCard label="In Progress" value={inProgressJobCount} note="Active technician work" />
        <MetricCard label="Awaiting Review" value={submittedJobCount} note="Submitted from field" />
        <MetricCard label="Ready for Report" value={underReviewJobCount} note="Management review started" />
        <MetricCard label="Completed Jobs" value={completedJobCount} note="Closed after issue" />
        <MetricCard label="Issued Reports" value={issuedReportCount} note="Visible to clients" />
        <MetricCard label="Checklist Results" value={checklistResultCount} note="Structured inspection evidence" />
        <MetricCard label="Generated Reports" value={generatedReportCount} note="Needs report review" />
        <MetricCard label="Reviewed Reports" value={reviewedReportCount} note="Ready to issue" />
        <MetricCard label="Clients" value={clientCount} note={`${siteCount ?? 0} active site${siteCount === 1 ? "" : "s"}`} />
      </div>
      <EmptyState
        title="Golden path verified"
        message="Create and assign jobs, capture technician evidence, issue reports, and deliver client-scoped report access."
      />
    </div>
  );
}
