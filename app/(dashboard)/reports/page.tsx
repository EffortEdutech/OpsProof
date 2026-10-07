import { redirect } from "next/navigation";
import Link from "next/link";
import { generateReportShell, issueReport, reviewReport } from "@/app/(dashboard)/reports/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { requireProfile } from "@/lib/auth/current-user";
import { formatDate } from "@/lib/format/date";
import { canAccessManagement } from "@/lib/permissions/roles";
import { createClient } from "@/lib/supabase/server";

type ReportsPageProps = {
  searchParams?: Promise<{
    created?: string;
    issued?: string;
    error?: string;
    reviewed?: string;
  }>;
};

const fieldStyle = {
  minHeight: 44,
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: 12
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

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const profile = await requireProfile();

  if (!canAccessManagement(profile.role)) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const supabase = await createClient();
  const [{ data: jobs }, { data: reports, error: reportsError }] = await Promise.all([
    supabase
      .from("maintenance_jobs")
      .select("id,job_number,scheduled_date,clients(name),sites(name)")
      .eq("status", "UNDER_REVIEW")
      .order("scheduled_date", { ascending: false }),
    supabase
      .from("reports")
      .select("id,job_id,report_number,title,status,generated_at,maintenance_jobs(job_number,clients(name),sites(name))")
      .order("created_at", { ascending: false })
  ]);
  const reportJobIds = reports?.map((report) => report.job_id).filter(Boolean) ?? [];
  const { data: findings, error: findingsError } =
    reportJobIds.length > 0
      ? await supabase
          .from("findings")
          .select("id,job_id,title,severity,status")
          .in("job_id", reportJobIds)
          .order("created_at", { ascending: false })
      : { data: [], error: null };

  const findingsByJobId = new Map<string, NonNullable<typeof findings>>();

  findings?.forEach((finding) => {
    const current = findingsByJobId.get(finding.job_id) ?? [];
    findingsByJobId.set(finding.job_id, [...current, finding]);
  });

  const reportedJobIds = new Set(reports?.filter((report) => report.status !== "VOID").map((report) => report.job_id) ?? []);
  const reportableJobs = jobs?.filter((job) => !reportedJobIds.has(job.id)) ?? [];
  const hasJobs = reportableJobs.length > 0;

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <PageHeader title="Reports" description="Generate report records from completed maintenance evidence." />
      {params?.created ? (
        <Card role="status" style={{ borderColor: "#9cc9a8", color: "#22543d" }}>
          Report shell generated.
        </Card>
      ) : null}
      {params?.reviewed ? (
        <Card role="status" style={{ borderColor: "#9cc9a8", color: "#22543d" }}>
          Report reviewed.
        </Card>
      ) : null}
      {params?.issued ? (
        <Card role="status" style={{ borderColor: "#9cc9a8", color: "#22543d" }}>
          Report issued.
        </Card>
      ) : null}
      {params?.error ? (
        <ErrorState
          title="Report not generated"
          message={
            params.error === "missing-job"
              ? "Choose a submitted maintenance job."
              : params.error === "job-not-under-review"
                ? "Start management review before generating a report."
                : params.error === "report-exists"
                  ? "That job already has a report."
                  : "The report shell could not be created."
          }
        />
      ) : null}
      <Card>
        <form action={generateReportShell} style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            <select aria-label="Maintenance job" disabled={!hasJobs} name="job_id" required style={fieldStyle}>
              <option value="">{hasJobs ? "Select job under review" : "No reviewed jobs ready for report"}</option>
              {reportableJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.job_number} - {job.clients?.name ?? "Client"} / {job.sites?.name ?? "Site"}
                </option>
              ))}
            </select>
            <input aria-label="Report title" disabled={!hasJobs} name="title" placeholder="Report title" style={fieldStyle} />
          </div>
          <div>
            <Button disabled={!hasJobs} type="submit">
              Generate Report Shell
            </Button>
          </div>
        </form>
      </Card>
      {reportsError ? (
        <ErrorState title="Reports unavailable" message="The report list could not be loaded." />
      ) : findingsError ? (
        <ErrorState title="Evidence unavailable" message="Captured findings could not be loaded." />
      ) : reports && reports.length > 0 ? (
        <Card style={{ padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Report</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Title</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Job</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Client</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Site</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Evidence</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Generated</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Status</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => {
                const reportFindings = findingsByJobId.get(report.job_id) ?? [];
                const evidenceSummary =
                  reportFindings.length > 0
                    ? `${reportFindings.length} finding${reportFindings.length === 1 ? "" : "s"}: ${reportFindings
                        .slice(0, 2)
                        .map((finding) => `${finding.title} - ${finding.severity} - ${finding.status}`)
                        .join("; ")}${reportFindings.length > 2 ? `; +${reportFindings.length - 2} more` : ""}`
                    : "No findings";

                return (
                  <tr key={report.id}>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      <Link href={`/reports/${report.id}`}>
                        <strong>{report.report_number}</strong>
                      </Link>
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      {report.title ?? "Not set"}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      {report.maintenance_jobs?.job_number ?? "Not set"}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      {report.maintenance_jobs?.clients?.name ?? "Not set"}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      {report.maintenance_jobs?.sites?.name ?? "Not set"}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      {evidenceSummary}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                      {formatDate(report.generated_at)}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      <StatusBadge>{reportStatusLabel[report.status] ?? report.status}</StatusBadge>
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
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
                          <Button type="submit">Issue</Button>
                        </form>
                      ) : null}
                      {report.status === "ISSUED" ? "Issued" : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ) : (
        <EmptyState title="No reports yet" message="Generate the first report shell from a maintenance job." />
      )}
    </div>
  );
}
