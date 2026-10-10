import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ChecklistResults } from "@/components/ui/checklist-results";
import { PrintButton } from "@/components/ui/print-button";
import { EmptyState } from "@/components/ui/states";
import { StatusBadge } from "@/components/ui/status-badge";
import { SummaryField } from "@/components/ui/summary-field";
import { requireProfile } from "@/lib/auth/current-user";
import { formatDate } from "@/lib/format/date";
import { canAccessClientPortal } from "@/lib/permissions/roles";
import { fetchIssuedReportData } from "@/lib/reports/issued-report-data";
import { createClient } from "@/lib/supabase/server";

type ClientReportPageProps = {
  params: Promise<{
    reportId: string;
  }>;
};

export default async function ClientReportPage({ params }: ClientReportPageProps) {
  const profile = await requireProfile();

  if (!canAccessClientPortal(profile.role)) {
    redirect("/dashboard");
  }

  const { reportId } = await params;
  const supabase = await createClient();
  const { data: reportData, error } = await fetchIssuedReportData(supabase, reportId, { issuedOnly: true });

  if (error || !reportData) {
    notFound();
  }

  return (
    <div className="print-sheet" style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
        <div>
          <Link className="no-print" href="/client/dashboard" style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
            Back to client dashboard
          </Link>
          <h1 style={{ margin: "0.5rem 0 0", fontSize: "1.75rem" }}>{reportData.report.reportNumber}</h1>
          <div style={{ color: "var(--muted)", marginTop: 4 }}>{reportData.report.title ?? "Maintenance report"}</div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <div className="no-print">
            <PrintButton />
          </div>
          <StatusBadge>Issued</StatusBadge>
        </div>
      </div>

      <Card className="print-section">
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>1. Report summary</h2>
        <div className="print-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          <SummaryField label="Job" value={reportData.job.jobNumber} />
          <SummaryField label="Site" value={reportData.site.name} />
          <SummaryField label="Scheduled" value={reportData.job.scheduledDate} />
          <SummaryField label="Issued" value={formatDate(reportData.report.issuedAt)} />
          <SummaryField label="Findings" value={`${reportData.summary.findingCount}`} />
          <SummaryField
            label="Checklist"
            value={`${reportData.summary.checklistResultCount} result${reportData.summary.checklistResultCount === 1 ? "" : "s"}`}
          />
        </div>
      </Card>

      <Card className="print-section">
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>2. Field evidence</h2>
        {reportData.loadErrors.findings ? (
          <EmptyState title="Evidence unavailable" message="Report evidence could not be loaded." />
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
          <EmptyState title="No findings included" message="This issued report has no field findings attached." />
        )}
      </Card>

      <Card className="print-section">
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>3. Checklist evidence</h2>
        {reportData.loadErrors.inspections || reportData.loadErrors.templateItems || reportData.loadErrors.inspectionResults ? (
          <EmptyState title="Checklist unavailable" message="Structured checklist results could not be loaded." />
        ) : (
          <ChecklistResults
            emptyTitle="No checklist results"
            emptyMessage="This issued report has no structured checklist results attached."
            groups={reportData.checklistGroups}
          />
        )}
      </Card>
    </div>
  );
}
