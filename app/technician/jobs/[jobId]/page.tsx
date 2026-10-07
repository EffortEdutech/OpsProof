import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { addFinding, startJob, submitJob } from "@/app/technician/today/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { requireProfile } from "@/lib/auth/current-user";
import { formatDate } from "@/lib/format/date";
import { canAccessTechnician } from "@/lib/permissions/roles";
import { createClient } from "@/lib/supabase/server";

type TechnicianJobPageProps = {
  params: Promise<{
    jobId: string;
  }>;
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>{label}</div>
      <strong style={{ display: "block", marginTop: 4 }}>{value}</strong>
    </div>
  );
}

export default async function TechnicianJobPage({ params, searchParams }: TechnicianJobPageProps) {
  const profile = await requireProfile();

  if (!canAccessTechnician(profile.role)) {
    redirect("/dashboard");
  }

  const { jobId } = await params;
  const query = await searchParams;
  const next = `/technician/jobs/${jobId}`;
  const supabase = await createClient();
  const { data: job, error: jobError } = await supabase
    .from("maintenance_jobs")
    .select("id,job_number,scheduled_date,status,notes,clients(name),sites(name),maintenance_plans(name,frequency)")
    .eq("id", jobId)
    .eq("assigned_technician_id", profile.id)
    .single();

  if (jobError || !job) {
    notFound();
  }

  const { data: findings, error: findingsError } = await supabase
    .from("findings")
    .select("id,title,severity,status,description,recommendation,created_at")
    .eq("job_id", job.id)
    .order("created_at", { ascending: false });

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
        <div>
          <Link href="/technician/today" style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
            Back to today
          </Link>
          <h1 style={{ margin: "0.5rem 0 0", fontSize: "1.75rem" }}>{job.job_number}</h1>
          <div style={{ color: "var(--muted)", marginTop: 4 }}>
            {job.clients?.name ?? "Client not set"} / {job.sites?.name ?? "Site not set"}
          </div>
        </div>
        <StatusBadge>{jobStatusLabel[job.status] ?? job.status}</StatusBadge>
      </div>

      {query?.started ? (
        <Card role="status" style={{ borderColor: "#9cc9a8", color: "#22543d" }}>
          Job started.
        </Card>
      ) : null}
      {query?.finding ? (
        <Card role="status" style={{ borderColor: "#9cc9a8", color: "#22543d" }}>
          Finding captured.
        </Card>
      ) : null}
      {query?.submitted ? (
        <Card role="status" style={{ borderColor: "#9cc9a8", color: "#22543d" }}>
          Job submitted for management review.
        </Card>
      ) : null}
      {query?.error ? (
        <Card role="alert" style={{ borderColor: "#f0b4ae", color: "#8a1f17" }}>
          {query.error === "job-not-started" ? "Start the job before capturing findings." : "Field action failed."}
        </Card>
      ) : null}

      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "1rem" }}>
          <Field label="Scheduled" value={job.scheduled_date} />
          <Field label="Plan" value={job.maintenance_plans?.name ?? "Ad hoc"} />
          <Field label="Frequency" value={job.maintenance_plans?.frequency ?? "Not set"} />
          <Field label="Findings" value={`${findings?.length ?? 0}`} />
        </div>
      </Card>

      <Card>
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>Field action</h2>
        {job.status === "SCHEDULED" ? (
          <form action={startJob}>
            <input name="job_id" type="hidden" value={job.id} />
            <input name="next" type="hidden" value={next} />
            <Button type="submit">Start Job</Button>
          </form>
        ) : null}
        {job.status === "IN_PROGRESS" ? (
          <form action={submitJob}>
            <input name="job_id" type="hidden" value={job.id} />
            <input name="next" type="hidden" value={next} />
            <Button type="submit" variant="secondary">
              Submit for Review
            </Button>
          </form>
        ) : null}
        {job.status === "SUBMITTED" ? <div>Submitted jobs are locked for management review.</div> : null}
      </Card>

      <Card>
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>Capture finding</h2>
        <form action={addFinding} style={{ display: "grid", gap: "1rem" }}>
          <input name="job_id" type="hidden" value={job.id} />
          <input name="next" type="hidden" value={next} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
            <input aria-label="Finding title" disabled={job.status !== "IN_PROGRESS"} name="title" placeholder="Finding title" required style={fieldStyle} />
            <select aria-label="Severity" disabled={job.status !== "IN_PROGRESS"} name="severity" style={fieldStyle}>
              <option value="OBSERVATION">Observation</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <input aria-label="Description" disabled={job.status !== "IN_PROGRESS"} name="description" placeholder="Description" style={fieldStyle} />
            <input aria-label="Recommendation" disabled={job.status !== "IN_PROGRESS"} name="recommendation" placeholder="Recommendation" style={fieldStyle} />
          </div>
          <div>
            <Button disabled={job.status !== "IN_PROGRESS"} type="submit">
              Capture Finding
            </Button>
          </div>
          {job.status !== "IN_PROGRESS" ? (
            <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
              Start this job before capturing findings.
            </div>
          ) : null}
        </form>
      </Card>

      <Card>
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>Captured findings</h2>
        {findingsError ? (
          <EmptyState title="Findings unavailable" message="Captured findings could not be loaded." />
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
          <EmptyState title="No findings captured" message="Captured field findings will appear here." />
        )}
      </Card>
    </div>
  );
}
