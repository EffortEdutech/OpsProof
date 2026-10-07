import { redirect } from "next/navigation";
import Link from "next/link";
import { addFinding, startJob, submitJob } from "@/app/technician/today/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { PageHeader } from "@/components/ui/page-header";
import { requireProfile } from "@/lib/auth/current-user";
import { canAccessTechnician } from "@/lib/permissions/roles";
import { createClient } from "@/lib/supabase/server";

type TechnicianTodayPageProps = {
  searchParams?: Promise<{
    error?: string;
    finding?: string;
    started?: string;
    submitted?: string;
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
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled"
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

export default async function TechnicianTodayPage({ searchParams }: TechnicianTodayPageProps) {
  const profile = await requireProfile();

  if (!canAccessTechnician(profile.role)) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const supabase = await createClient();
  const [{ data: jobs, error: jobsError }, { data: findings, error: findingsError }] = await Promise.all([
    supabase
      .from("maintenance_jobs")
      .select("id,job_number,scheduled_date,status,clients(name),sites(name)")
      .in("status", ["SCHEDULED", "IN_PROGRESS", "SUBMITTED"])
      .order("scheduled_date", { ascending: true }),
    supabase
      .from("findings")
      .select("id,title,severity,status,created_at,maintenance_jobs(id,job_number)")
      .order("created_at", { ascending: false })
  ]);

  const inProgressJobs = jobs?.filter((job) => job.status === "IN_PROGRESS") ?? [];
  const findingsByJobId = new Map<string, number>();

  findings?.forEach((finding) => {
    const jobId = finding.maintenance_jobs?.id;
    const job = jobs?.find((item) => item.id === jobId);

    if (job) {
      findingsByJobId.set(job.id, (findingsByJobId.get(job.id) ?? 0) + 1);
    }
  });

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <PageHeader title="Today" description="Start assigned jobs and capture field findings." />
      {params?.started ? (
        <Card role="status" style={{ borderColor: "#9cc9a8", color: "#22543d" }}>
          Job started.
        </Card>
      ) : null}
      {params?.finding ? (
        <Card role="status" style={{ borderColor: "#9cc9a8", color: "#22543d" }}>
          Finding captured.
        </Card>
      ) : null}
      {params?.submitted ? (
        <Card role="status" style={{ borderColor: "#9cc9a8", color: "#22543d" }}>
          Job submitted for management review.
        </Card>
      ) : null}
      {params?.error ? (
        <Card role="alert" style={{ borderColor: "#f0b4ae", color: "#8a1f17" }}>
          {params.error === "job-not-started" ? "Start the job before capturing findings." : "Field action failed."}
        </Card>
      ) : null}
      {jobsError ? (
        <EmptyState title="Jobs unavailable" message="The job queue could not be loaded." />
      ) : jobs && jobs.length > 0 ? (
        <Card style={{ padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Job</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Client</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Site</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Scheduled</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Status</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Findings</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                    <Link href={`/technician/jobs/${job.id}`}>
                      <strong>{job.job_number}</strong>
                    </Link>
                  </td>
                  <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>{job.clients?.name ?? "Not set"}</td>
                  <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>{job.sites?.name ?? "Not set"}</td>
                  <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>{job.scheduled_date}</td>
                  <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                    <StatusBadge>{jobStatusLabel[job.status] ?? job.status}</StatusBadge>
                  </td>
                  <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>{findingsByJobId.get(job.id) ?? 0}</td>
                  <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                    {job.status === "SCHEDULED" ? (
                      <form action={startJob}>
                        <input name="job_id" type="hidden" value={job.id} />
                        <input name="next" type="hidden" value="/technician/today" />
                        <Button type="submit">Start</Button>
                      </form>
                    ) : null}
                    {job.status === "IN_PROGRESS" ? (
                      <form action={submitJob}>
                        <input name="job_id" type="hidden" value={job.id} />
                        <input name="next" type="hidden" value="/technician/today" />
                        <Button type="submit" variant="secondary">
                          Submit
                        </Button>
                      </form>
                    ) : null}
                    {job.status === "SUBMITTED" ? (
                      "Submitted"
                    ) : null}
                    {job.status !== "SCHEDULED" && job.status !== "IN_PROGRESS" && job.status !== "SUBMITTED" ? (
                      "Open"
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <EmptyState title="No assigned jobs" message="Scheduled and in-progress jobs will appear here." />
      )}
      <Card>
        <form action={addFinding} style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            <input name="next" type="hidden" value="/technician/today" />
            <select aria-label="In-progress job" disabled={inProgressJobs.length === 0} name="job_id" required style={fieldStyle}>
              <option value="">{inProgressJobs.length > 0 ? "Select in-progress job" : "Start a job first"}</option>
              {inProgressJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.job_number} - {job.clients?.name ?? "Client"} / {job.sites?.name ?? "Site"}
                </option>
              ))}
            </select>
            <input aria-label="Finding title" disabled={inProgressJobs.length === 0} name="title" placeholder="Finding title" required style={fieldStyle} />
            <select aria-label="Severity" disabled={inProgressJobs.length === 0} name="severity" style={fieldStyle}>
              <option value="OBSERVATION">Observation</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <input aria-label="Description" disabled={inProgressJobs.length === 0} name="description" placeholder="Description" style={fieldStyle} />
            <input aria-label="Recommendation" disabled={inProgressJobs.length === 0} name="recommendation" placeholder="Recommendation" style={fieldStyle} />
          </div>
          <div>
            <Button disabled={inProgressJobs.length === 0} type="submit">
              Capture Finding
            </Button>
          </div>
          {inProgressJobs.length === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
              Start a scheduled job before capturing findings. Submitted jobs are locked for management review.
            </div>
          ) : null}
        </form>
      </Card>
      {findingsError ? (
        <EmptyState title="Findings unavailable" message="Captured findings could not be loaded." />
      ) : findings && findings.length > 0 ? (
        <Card style={{ padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Finding</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Job</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Severity</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((finding) => (
                <tr key={finding.id}>
                  <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                    <strong>{finding.title}</strong>
                  </td>
                  <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                    {finding.maintenance_jobs?.id ? (
                      <Link href={`/technician/jobs/${finding.maintenance_jobs.id}`}>
                        {finding.maintenance_jobs.job_number}
                      </Link>
                    ) : (
                      "Not set"
                    )}
                  </td>
                  <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>{finding.severity}</td>
                  <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>{finding.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}
    </div>
  );
}
