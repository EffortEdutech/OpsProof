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
  const { data: jobEquipment, error: jobEquipmentError } =
    reportJobIds.length > 0
      ? await supabase
          .from("job_equipment")
          .select("id,job_id")
          .in("job_id", reportJobIds)
      : { data: [], error: null };
  const jobEquipmentIds = jobEquipment?.map((asset) => asset.id) ?? [];
  const { data: inspections, error: inspectionsError } =
    jobEquipmentIds.length > 0
      ? await supabase
          .from("inspections")
          .select("id,job_id,job_equipment_id")
          .in("job_equipment_id", jobEquipmentIds)
      : { data: [], error: null };
  const inspectionIds = inspections?.map((inspection) => inspection.id) ?? [];
  const { data: inspectionResults, error: resultsError } =
    inspectionIds.length > 0
      ? await supabase
          .from("inspection_results")
          .select("id,inspection_id,result_status")
          .in("inspection_id", inspectionIds)
      : { data: [], error: null };

  const findingsByJobId = new Map<string, NonNullable<typeof findings>>();
  const inspectionJobIdById = new Map(inspections?.map((inspection) => [inspection.id, inspection.job_id]) ?? []);
  const checklistResultCountByJobId = new Map<string, number>();

  findings?.forEach((finding) => {
    const current = findingsByJobId.get(finding.job_id) ?? [];
    findingsByJobId.set(finding.job_id, [...current, finding]);
  });

  inspectionResults?.forEach((result) => {
    const jobId = inspectionJobIdById.get(result.inspection_id);

    if (jobId) {
      checklistResultCountByJobId.set(jobId, (checklistResultCountByJobId.get(jobId) ?? 0) + 1);
    }
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
      ) : findingsError || jobEquipmentError || inspectionsError || resultsError ? (
        <ErrorState title="Evidence unavailable" message="Captured findings could not be loaded." />
      ) : reports && reports.length > 0 ? (
        <Card className="table-scroll" style={{ padding: 0 }}>
          <table className="data-table">
            <colgroup>
              <col style={{ width: 150 }} />
              <col style={{ width: 210 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 230 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 130 }} />
            </colgroup>
            <thead>
              <tr>
                <th>Report</th>
                <th>Title</th>
                <th>Job</th>
                <th>Client</th>
                <th>Site</th>
                <th>Evidence</th>
                <th>Generated</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => {
                const reportFindings = findingsByJobId.get(report.job_id) ?? [];
                const checklistResultCount = checklistResultCountByJobId.get(report.job_id) ?? 0;
                const evidenceParts = [];

                if (reportFindings.length > 0) {
                  evidenceParts.push(
                    `${reportFindings.length} finding${reportFindings.length === 1 ? "" : "s"}: ${reportFindings
                      .slice(0, 2)
                      .map((finding) => `${finding.title} - ${finding.severity} - ${finding.status}`)
                      .join("; ")}${reportFindings.length > 2 ? `; +${reportFindings.length - 2} more` : ""}`
                  );
                }

                if (checklistResultCount > 0) {
                  evidenceParts.push(`${checklistResultCount} checklist result${checklistResultCount === 1 ? "" : "s"}`);
                }

                const evidenceSummary =
                  evidenceParts.length > 0 ? evidenceParts.join(" / ") : "No evidence";

                return (
                  <tr key={report.id}>
                    <td>
                      <Link href={`/reports/${report.id}`}>
                        <strong>{report.report_number}</strong>
                      </Link>
                    </td>
                    <td>
                      {report.title ?? "Not set"}
                    </td>
                    <td>
                      {report.maintenance_jobs?.job_number ?? "Not set"}
                    </td>
                    <td>
                      {report.maintenance_jobs?.clients?.name ?? "Not set"}
                    </td>
                    <td>
                      {report.maintenance_jobs?.sites?.name ?? "Not set"}
                    </td>
                    <td>
                      {evidenceSummary}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {formatDate(report.generated_at)}
                    </td>
                    <td>
                      <StatusBadge>{reportStatusLabel[report.status] ?? report.status}</StatusBadge>
                    </td>
                    <td>
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
