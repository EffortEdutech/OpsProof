import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { issueReport, reviewReport } from "@/app/(dashboard)/reports/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PrintButton } from "@/components/ui/print-button";
import { EmptyState } from "@/components/ui/states";
import { requireProfile } from "@/lib/auth/current-user";
import { formatDate } from "@/lib/format/date";
import { canAccessManagement } from "@/lib/permissions/roles";
import { createClient } from "@/lib/supabase/server";

type ReportDetailPageProps = {
  params: Promise<{
    reportId: string;
  }>;
};

const reportStatusLabel = {
  DRAFT: "Draft",
  GENERATED: "Generated",
  REVIEWED: "Reviewed",
  ISSUED: "Issued",
  VOID: "Void"
};

function StatusBadge({ children }: { children: string }) {
  return (
    <span
      style={{
        background: "#eef2f6",
        border: "1px solid var(--border)",
        borderRadius: 999,
        display: "inline-block",
        fontSize: "0.8125rem",
        fontWeight: 600,
        padding: "4px 10px",
        whiteSpace: "nowrap"
      }}
    >
      {children}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>{label}</div>
      <strong style={{ display: "block", marginTop: 4 }}>{value}</strong>
    </div>
  );
}

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const profile = await requireProfile();

  if (!canAccessManagement(profile.role)) {
    redirect("/dashboard");
  }

  const { reportId } = await params;
  const supabase = await createClient();
  const { data: report, error } = await supabase
    .from("reports")
    .select("id,job_id,report_number,title,status,generated_at,issued_at,maintenance_jobs(job_number,scheduled_date,clients(name),sites(name))")
    .eq("id", reportId)
    .single();

  if (error || !report) {
    notFound();
  }

  const { data: findings, error: findingsError } = await supabase
    .from("findings")
    .select("id,title,severity,status,description,recommendation,created_at")
    .eq("job_id", report.job_id)
    .order("created_at", { ascending: false });

  return (
    <div className="print-sheet" style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
        <div>
          <Link className="no-print" href="/reports" style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
            Back to reports
          </Link>
          <h1 style={{ margin: "0.5rem 0 0", fontSize: "1.75rem" }}>{report.report_number}</h1>
          <div style={{ color: "var(--muted)", marginTop: 4 }}>{report.title ?? "Untitled report"}</div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <div className="no-print">
            <PrintButton />
          </div>
          <StatusBadge>{reportStatusLabel[report.status] ?? report.status}</StatusBadge>
        </div>
      </div>

      <Card className="print-section">
        <div className="print-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          <Field label="Client" value={report.maintenance_jobs?.clients?.name ?? "Not set"} />
          <Field label="Site" value={report.maintenance_jobs?.sites?.name ?? "Not set"} />
          <Field label="Job" value={report.maintenance_jobs?.job_number ?? "Not set"} />
          <Field label="Scheduled" value={report.maintenance_jobs?.scheduled_date ?? "Not set"} />
          <Field label="Generated" value={formatDate(report.generated_at)} />
          <Field label="Issued" value={formatDate(report.issued_at)} />
          <Field label="Findings" value={`${findings?.length ?? 0}`} />
          <Field label="Type" value="Maintenance" />
        </div>
      </Card>

      <Card className="no-print">
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>Report action</h2>
        {report.status === "GENERATED" ? (
          <form action={reviewReport}>
            <input name="report_id" type="hidden" value={report.id} />
            <Button type="submit" variant="secondary">
              Mark Reviewed
            </Button>
          </form>
        ) : null}
        {report.status === "REVIEWED" ? (
          <form action={issueReport}>
            <input name="report_id" type="hidden" value={report.id} />
            <Button type="submit">Issue Report</Button>
          </form>
        ) : null}
        {report.status === "ISSUED" ? <div>Issued reports are visible to the scoped client portal.</div> : null}
        {report.status !== "GENERATED" && report.status !== "REVIEWED" && report.status !== "ISSUED" ? (
          <div style={{ color: "var(--muted)" }}>No action is available for this report state.</div>
        ) : null}
      </Card>

      <Card className="print-section">
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>Evidence included</h2>
        {findingsError ? (
          <EmptyState title="Evidence unavailable" message="Captured findings could not be loaded." />
        ) : findings && findings.length > 0 ? (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {findings.map((finding) => (
              <div key={finding.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <strong>{finding.title}</strong>
                  <StatusBadge>{finding.severity}</StatusBadge>
                </div>
                <div style={{ color: "var(--muted)", marginTop: 4 }}>{finding.status} / {formatDate(finding.created_at)}</div>
                {finding.description ? <div style={{ marginTop: 8 }}>{finding.description}</div> : null}
                {finding.recommendation ? <div style={{ color: "var(--muted)", marginTop: 8 }}>Recommendation: {finding.recommendation}</div> : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No findings included" message="This report was generated without field findings." />
        )}
      </Card>
    </div>
  );
}
