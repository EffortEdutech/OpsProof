import { redirect } from "next/navigation";
import Link from "next/link";
import { closeJobFromIssuedReport, createPlanAndJob, startJobReview } from "@/app/(dashboard)/maintenance/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { requireProfile } from "@/lib/auth/current-user";
import { formatDate } from "@/lib/format/date";
import { canAccessManagement } from "@/lib/permissions/roles";
import { createClient } from "@/lib/supabase/server";

type MaintenancePageProps = {
  searchParams?: Promise<{
    created?: string;
    closed?: string;
    error?: string;
    review?: string;
  }>;
};

const fieldStyle = {
  minHeight: 44,
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: 12
};

const jobStatusLabel = {
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In progress",
  SUBMITTED: "Awaiting review",
  UNDER_REVIEW: "Ready for report",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled"
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

export default async function MaintenancePage({ searchParams }: MaintenancePageProps) {
  const profile = await requireProfile();

  if (!canAccessManagement(profile.role)) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const supabase = await createClient();
  const [
    { data: clients },
    { data: sites },
    { data: technicians },
    { data: jobs, error: jobsError },
    { data: reports, error: reportsError }
  ] = await Promise.all([
    supabase.from("clients").select("id,name").eq("active", true).order("name", { ascending: true }),
    supabase.from("sites").select("id,name,client_id").eq("active", true).order("name", { ascending: true }),
    supabase
      .from("profiles")
      .select("id,full_name")
      .eq("role", "TECHNICIAN")
      .eq("active", true)
      .order("full_name", { ascending: true }),
    supabase
      .from("maintenance_jobs")
      .select("id,job_number,scheduled_date,completed_at,status,assigned_technician_id,clients(name),sites(name),maintenance_plans(name,frequency)")
      .order("scheduled_date", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("reports")
      .select("id,job_id,report_number,status,issued_at")
      .order("created_at", { ascending: false })
  ]);
  const jobIds = jobs?.map((job) => job.id) ?? [];
  const { data: findings, error: findingsError } =
    jobIds.length > 0
      ? await supabase
          .from("findings")
          .select("id,job_id,severity,status")
          .in("job_id", jobIds)
      : { data: [], error: null };

  const hasSetup = Boolean(clients?.length && sites?.length);
  const techniciansById = new Map(technicians?.map((technician) => [technician.id, technician.full_name]) ?? []);
  const findingsByJobId = new Map<string, NonNullable<typeof findings>>();
  const reportsByJobId = new Map<string, NonNullable<typeof reports>[number]>();

  findings?.forEach((finding) => {
    const current = findingsByJobId.get(finding.job_id) ?? [];
    findingsByJobId.set(finding.job_id, [...current, finding]);
  });

  reports?.forEach((report) => {
    if (!reportsByJobId.has(report.job_id) && report.status !== "VOID") {
      reportsByJobId.set(report.job_id, report);
    }
  });

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <PageHeader title="Maintenance" description="Create the first plan and scheduled job for a client site." />
      {params?.created ? (
        <Card role="status" style={{ borderColor: "#9cc9a8", color: "#22543d" }}>
          Maintenance plan and job created.
        </Card>
      ) : null}
      {params?.review ? (
        <Card role="status" style={{ borderColor: "#9cc9a8", color: "#22543d" }}>
          Job moved under management review.
        </Card>
      ) : null}
      {params?.closed ? (
        <Card role="status" style={{ borderColor: "#9cc9a8", color: "#22543d" }}>
          Job closed from issued report.
        </Card>
      ) : null}
      {params?.error ? (
        <ErrorState
          title="Maintenance job not saved"
          message={
            params.error === "missing-required"
              ? "Choose a client, site, frequency, and dates."
              : params.error === "missing-job"
                ? "Choose a submitted job to review."
                : params.error === "missing-issued-report"
                  ? "Only jobs with issued reports can be closed this way."
                : "The maintenance job could not be saved."
          }
        />
      ) : null}
      <Card>
        <form action={createPlanAndJob} style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
            <select aria-label="Client" disabled={!hasSetup} name="client_id" required style={fieldStyle}>
              <option value="">{hasSetup ? "Select client" : "Create a client and site first"}</option>
              {clients?.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <select aria-label="Site" disabled={!hasSetup} name="site_id" required style={fieldStyle}>
              <option value="">{hasSetup ? "Select site" : "Create a site first"}</option>
              {sites?.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
            <input aria-label="Plan name" disabled={!hasSetup} name="name" placeholder="Plan name" required style={fieldStyle} />
            <select aria-label="Frequency" disabled={!hasSetup} name="frequency" required style={fieldStyle}>
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="HALF_YEARLY">Half yearly</option>
              <option value="YEARLY">Yearly</option>
              <option value="CUSTOM">Custom</option>
            </select>
            <select aria-label="Assigned technician" disabled={!hasSetup} name="assigned_technician_id" style={fieldStyle}>
              <option value="">Unassigned</option>
              {technicians?.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.full_name}
                </option>
              ))}
            </select>
            <input aria-label="Custom interval days" disabled={!hasSetup} min={1} name="interval_days" placeholder="Custom interval days" style={fieldStyle} type="number" />
            <input aria-label="Plan start date" disabled={!hasSetup} name="start_date" required style={fieldStyle} type="date" />
            <input aria-label="First scheduled date" disabled={!hasSetup} name="scheduled_date" required style={fieldStyle} type="date" />
            <input aria-label="Notes" disabled={!hasSetup} name="notes" placeholder="Notes" style={fieldStyle} />
          </div>
          <div>
            <Button disabled={!hasSetup} type="submit">
              Create Plan and Job
            </Button>
          </div>
        </form>
      </Card>
      {jobsError || reportsError || findingsError ? (
        <ErrorState title="Jobs unavailable" message="The maintenance job list could not be loaded." />
      ) : jobs && jobs.length > 0 ? (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Job</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Client</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Site</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Assigned</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Plan</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Frequency</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Scheduled</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Completed</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Status</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Evidence</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Review</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Report</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const report = reportsByJobId.get(job.id);
                const jobFindings = findingsByJobId.get(job.id) ?? [];
                const criticalFindings = jobFindings.filter((finding) => finding.severity === "CRITICAL").length;

                return (
                  <tr key={job.id}>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      <Link href={`/maintenance/${job.id}`}>
                        <strong>{job.job_number}</strong>
                      </Link>
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>{job.clients?.name ?? "Not set"}</td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>{job.sites?.name ?? "Not set"}</td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      {job.assigned_technician_id ? techniciansById.get(job.assigned_technician_id) ?? "Assigned" : "Unassigned"}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      {job.maintenance_plans?.name ?? "Ad hoc"}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      {job.maintenance_plans?.frequency ?? "Not set"}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{job.scheduled_date}</td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{formatDate(job.completed_at)}</td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      <StatusBadge>{jobStatusLabel[job.status] ?? job.status}</StatusBadge>
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      {jobFindings.length > 0 ? (
                        <div style={{ display: "grid", gap: 4 }}>
                          <strong>{jobFindings.length} finding{jobFindings.length === 1 ? "" : "s"}</strong>
                          {criticalFindings > 0 ? <span style={{ color: "#8a1f17" }}>{criticalFindings} critical</span> : null}
                        </div>
                      ) : (
                        "No findings"
                      )}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      {job.status === "SUBMITTED" ? (
                        <div style={{ display: "grid", gap: 8 }}>
                          <span>Submitted for review</span>
                          <form action={startJobReview}>
                            <input name="job_id" type="hidden" value={job.id} />
                            <Button type="submit" variant="secondary">
                              Start Review
                            </Button>
                          </form>
                        </div>
                      ) : null}
                      {job.status === "UNDER_REVIEW" ? "Ready for report generation" : null}
                      {job.status === "COMPLETED" ? "Closed" : null}
                      {report?.status === "ISSUED" && job.status !== "COMPLETED" ? (
                        <form action={closeJobFromIssuedReport}>
                          <input name="job_id" type="hidden" value={job.id} />
                          <Button type="submit" variant="secondary">
                            Close Job
                          </Button>
                        </form>
                      ) : null}
                      {job.status !== "SUBMITTED" && job.status !== "UNDER_REVIEW" && job.status !== "COMPLETED" && report?.status !== "ISSUED" ? "Not ready" : null}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      {report ? (
                        <div style={{ display: "grid", gap: 4 }}>
                          <strong>{report.report_number}</strong>
                          <span style={{ color: "var(--muted)" }}>{reportStatusLabel[report.status] ?? report.status} {report.issued_at ? `- ${formatDate(report.issued_at)}` : ""}</span>
                        </div>
                      ) : (
                        "No report"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ) : (
        <EmptyState title="No jobs yet" message="Create the first maintenance plan and scheduled job." />
      )}
    </div>
  );
}
