import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { issueReport, reviewReport } from "@/app/(dashboard)/reports/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChecklistResults } from "@/components/ui/checklist-results";
import { PrintButton } from "@/components/ui/print-button";
import { EmptyState } from "@/components/ui/states";
import { StatusBadge } from "@/components/ui/status-badge";
import { SummaryField } from "@/components/ui/summary-field";
import { requireProfile } from "@/lib/auth/current-user";
import { formatDate } from "@/lib/format/date";
import { canAccessManagement } from "@/lib/permissions/roles";
import { fetchIssuedReportData } from "@/lib/reports/issued-report-data";
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

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const profile = await requireProfile();

  if (!canAccessManagement(profile.role)) {
    redirect("/dashboard");
  }

  const { reportId } = await params;
  const supabase = await createClient();
  const { data: reportData, error } = await fetchIssuedReportData(supabase, reportId);

  if (error || !reportData) {
    notFound();
  }

  return (
    <div className="print-sheet" style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
        <div>
          <Link className="no-print" href="/reports" style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
            Back to reports
          </Link>
          <h1 style={{ margin: "0.5rem 0 0", fontSize: "1.75rem" }}>{reportData.report.reportNumber}</h1>
          <div style={{ color: "var(--muted)", marginTop: 4 }}>{reportData.report.title ?? "Untitled report"}</div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <div className="no-print">
            <PrintButton />
          </div>
          <StatusBadge>{reportStatusLabel[reportData.report.status] ?? reportData.report.status}</StatusBadge>
        </div>
      </div>

      <Card className="print-section">
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>1. Report summary</h2>
        <div className="print-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          <SummaryField label="Client" value={reportData.client.name} />
          <SummaryField label="Site" value={reportData.site.name} />
          <SummaryField label="Job" value={reportData.job.jobNumber} />
          <SummaryField label="Scheduled" value={reportData.job.scheduledDate} />
          <SummaryField label="Generated" value={formatDate(reportData.report.generatedAt)} />
          <SummaryField label="Issued" value={formatDate(reportData.report.issuedAt)} />
          <SummaryField label="Findings" value={`${reportData.summary.findingCount}`} />
          <SummaryField
            label="Checklist"
            value={`${reportData.summary.checklistResultCount} result${reportData.summary.checklistResultCount === 1 ? "" : "s"}`}
          />
          <SummaryField label="Type" value="Maintenance" />
        </div>
      </Card>

      <Card className="print-section">
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>2. Field evidence</h2>
        {reportData.loadErrors.findings ? (
          <EmptyState title="Evidence unavailable" message="Captured findings could not be loaded." />
        ) : reportData.findings.length > 0 ? (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {reportData.findings.map((finding) => (
              <div key={finding.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <strong>{finding.title}</strong>
                  <StatusBadge>{finding.severity}</StatusBadge>
                </div>
                <div style={{ color: "var(--muted)", marginTop: 4 }}>{finding.status} / {formatDate(finding.createdAt)}</div>
                {finding.description ? <div style={{ marginTop: 8 }}>{finding.description}</div> : null}
                {finding.recommendation ? <div style={{ color: "var(--muted)", marginTop: 8 }}>Recommendation: {finding.recommendation}</div> : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No findings included" message="This report was generated without field findings." />
        )}
      </Card>

      <Card className="print-section">
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>3. Checklist evidence</h2>
        {reportData.loadErrors.inspections || reportData.loadErrors.templateItems || reportData.loadErrors.inspectionResults ? (
          <EmptyState title="Checklist unavailable" message="Structured checklist results could not be loaded." />
        ) : (
          <ChecklistResults
            emptyTitle="No checklist results"
            emptyMessage="This report has no structured checklist results attached."
            groups={reportData.checklistGroups}
          />
        )}
      </Card>

      <Card className="no-print">
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>4. Report action</h2>
        {reportData.report.status === "GENERATED" ? (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
              Mark reviewed after confirming the field evidence and checklist evidence above.
            </div>
            <form action={reviewReport}>
              <input name="report_id" type="hidden" value={reportData.report.id} />
              <Button type="submit" variant="secondary">
                Mark Reviewed
              </Button>
            </form>
          </div>
        ) : null}
        {reportData.report.status === "REVIEWED" ? (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
              Issue this report to make it visible in the client portal. Issuing also closes the maintenance job.
            </div>
            <form action={issueReport}>
              <input name="report_id" type="hidden" value={reportData.report.id} />
              <Button type="submit">Issue Report</Button>
            </form>
          </div>
        ) : null}
        {reportData.report.status === "ISSUED" ? (
          <div>Issued reports are visible to the scoped client portal. The maintenance job is closed after issue.</div>
        ) : null}
        {reportData.report.status !== "GENERATED" && reportData.report.status !== "REVIEWED" && reportData.report.status !== "ISSUED" ? (
          <div style={{ color: "var(--muted)" }}>No action is available for this report state.</div>
        ) : null}
      </Card>
    </div>
  );
}
