import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { closeJobFromIssuedReport, startJobReview } from "@/app/(dashboard)/maintenance/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChecklistResults } from "@/components/ui/checklist-results";
import { EmptyState } from "@/components/ui/states";
import { requireProfile } from "@/lib/auth/current-user";
import { formatDate } from "@/lib/format/date";
import { canAccessManagement } from "@/lib/permissions/roles";
import { createClient } from "@/lib/supabase/server";

type JobDetailPageProps = {
  params: Promise<{
    jobId: string;
  }>;
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>{label}</div>
      <strong style={{ display: "block", marginTop: 4 }}>{value}</strong>
    </div>
  );
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const profile = await requireProfile();

  if (!canAccessManagement(profile.role)) {
    redirect("/dashboard");
  }

  const { jobId } = await params;
  const supabase = await createClient();
  const { data: job, error: jobError } = await supabase
    .from("maintenance_jobs")
    .select("id,job_number,scheduled_date,completed_at,status,assigned_technician_id,notes,clients(name),sites(name),maintenance_plans(name,frequency)")
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    notFound();
  }

  const [{ data: technician }, { data: findings }, { data: reports }, { data: jobEquipment, error: jobEquipmentError }] = await Promise.all([
    job.assigned_technician_id
      ? supabase.from("profiles").select("full_name").eq("id", job.assigned_technician_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("findings")
      .select("id,title,severity,status,description,recommendation,created_at,equipment(asset_code)")
      .eq("job_id", job.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("reports")
      .select("id,report_number,title,status,generated_at,issued_at")
      .eq("job_id", job.id)
      .neq("status", "VOID")
      .order("created_at", { ascending: false }),
    supabase
      .from("job_equipment")
      .select("id,equipment_id,status,equipment(asset_code,location_description,equipment_types(name,code))")
      .eq("job_id", job.id)
      .order("created_at", { ascending: true })
  ]);

  const issuedReport = reports?.find((report) => report.status === "ISSUED");
  const jobEquipmentIds = jobEquipment?.map((asset) => asset.id) ?? [];
  const { data: inspections, error: inspectionsError } =
    jobEquipmentIds.length > 0
      ? await supabase
          .from("inspections")
          .select("id,job_equipment_id,template_id,status,inspection_templates(name)")
          .in("job_equipment_id", jobEquipmentIds)
      : { data: [], error: null };
  const inspectionIds = inspections?.map((inspection) => inspection.id) ?? [];
  const templateIds = inspections?.map((inspection) => inspection.template_id) ?? [];
  const [{ data: templateItems, error: templateItemsError }, { data: inspectionResults, error: resultsError }] = await Promise.all([
    templateIds.length > 0
      ? supabase
          .from("inspection_template_items")
          .select("id,template_id,prompt,sort_order")
          .in("template_id", templateIds)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    inspectionIds.length > 0
      ? supabase
          .from("inspection_results")
          .select("id,inspection_id,template_item_id,result_status")
          .in("inspection_id", inspectionIds)
      : Promise.resolve({ data: [], error: null })
  ]);
  const assetById = new Map(jobEquipment?.map((asset) => [asset.id, asset]) ?? []);
  const itemsByTemplateId = new Map<string, NonNullable<typeof templateItems>>();
  const resultByInspectionAndItem = new Map<string, NonNullable<typeof inspectionResults>[number]>();

  templateItems?.forEach((item) => {
    const current = itemsByTemplateId.get(item.template_id) ?? [];
    itemsByTemplateId.set(item.template_id, [...current, item]);
  });

  inspectionResults?.forEach((result) => {
    resultByInspectionAndItem.set(`${result.inspection_id}:${result.template_item_id}`, result);
  });
  const checklistGroups =
    inspections?.map((inspection) => {
      const asset = assetById.get(inspection.job_equipment_id);
      const checklistItems = itemsByTemplateId.get(inspection.template_id) ?? [];

      return {
        id: inspection.id,
        assetCode: asset?.equipment?.asset_code ?? "Asset",
        checklistName: inspection.inspection_templates?.name ?? "Checklist",
        status: inspection.status,
        items: checklistItems.map((item) => ({
          id: item.id,
          prompt: item.prompt,
          resultStatus: resultByInspectionAndItem.get(`${inspection.id}:${item.id}`)?.result_status ?? null
        }))
      };
    }) ?? [];

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
        <div>
          <Link href="/maintenance" style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
            Back to maintenance
          </Link>
          <h1 style={{ margin: "0.5rem 0 0", fontSize: "1.75rem" }}>{job.job_number}</h1>
          <div style={{ color: "var(--muted)", marginTop: 4 }}>
            {job.clients?.name ?? "Client not set"} / {job.sites?.name ?? "Site not set"}
          </div>
        </div>
        <StatusBadge>{jobStatusLabel[job.status] ?? job.status}</StatusBadge>
      </div>

      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          <Field label="Technician" value={technician?.full_name ?? "Unassigned"} />
          <Field label="Plan" value={job.maintenance_plans?.name ?? "Ad hoc"} />
          <Field label="Frequency" value={job.maintenance_plans?.frequency ?? "Not set"} />
          <Field label="Scheduled" value={job.scheduled_date} />
          <Field label="Completed" value={formatDate(job.completed_at)} />
          <Field label="Assets" value={`${jobEquipment?.length ?? 0}`} />
          <Field label="Findings" value={`${findings?.length ?? 0}`} />
          <Field label="Report" value={reports?.[0]?.report_number ?? "No report"} />
          <Field label="Issued" value={formatDate(issuedReport?.issued_at ?? null)} />
        </div>
      </Card>

      <Card>
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>Management action</h2>
        {job.status === "SUBMITTED" ? (
          <form action={startJobReview}>
            <input name="job_id" type="hidden" value={job.id} />
            <Button type="submit">Start Review</Button>
          </form>
        ) : null}
        {job.status === "UNDER_REVIEW" ? <div>Ready for report generation from the Reports page.</div> : null}
        {issuedReport && job.status !== "COMPLETED" ? (
          <form action={closeJobFromIssuedReport}>
            <input name="job_id" type="hidden" value={job.id} />
            <Button type="submit" variant="secondary">
              Close Job
            </Button>
          </form>
        ) : null}
        {job.status === "COMPLETED" ? <div>Job is closed after issued report delivery.</div> : null}
        {job.status !== "SUBMITTED" && job.status !== "UNDER_REVIEW" && job.status !== "COMPLETED" && !issuedReport ? (
          <div style={{ color: "var(--muted)" }}>No management action is available for this job state.</div>
        ) : null}
      </Card>

      <Card>
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>Assigned assets</h2>
        {jobEquipmentError ? (
          <EmptyState title="Assets unavailable" message="Assigned assets could not be loaded." />
        ) : jobEquipment && jobEquipment.length > 0 ? (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {jobEquipment.map((asset) => (
              <div key={asset.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "center" }}>
                <div>
                  <strong>{asset.equipment?.asset_code ?? "Asset"}</strong>
                  <div style={{ color: "var(--muted)", marginTop: 4 }}>
                    {asset.equipment?.equipment_types?.name ?? "Equipment"} / {asset.equipment?.location_description ?? "Location not set"}
                  </div>
                </div>
                <StatusBadge>{asset.status}</StatusBadge>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No assets assigned" message="Attach an asset when creating the next maintenance job." />
        )}
      </Card>

      <Card>
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>Field evidence</h2>
        {findings && findings.length > 0 ? (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {findings.map((finding) => (
              <div key={finding.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <strong>{finding.title}</strong>
                  <StatusBadge>{finding.severity}</StatusBadge>
                </div>
                <div style={{ color: "var(--muted)", marginTop: 4 }}>{finding.status} / {formatDate(finding.created_at)}</div>
                {finding.equipment?.asset_code ? <div style={{ color: "var(--muted)", marginTop: 4 }}>Asset: {finding.equipment.asset_code}</div> : null}
                {finding.description ? <div style={{ marginTop: 8 }}>{finding.description}</div> : null}
                {finding.recommendation ? <div style={{ color: "var(--muted)", marginTop: 8 }}>Recommendation: {finding.recommendation}</div> : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No findings captured" message="Technician evidence will appear here after field capture." />
        )}
      </Card>

      <Card>
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>Checklist evidence</h2>
        {inspectionsError || templateItemsError || resultsError ? (
          <EmptyState title="Checklist unavailable" message="Structured checklist results could not be loaded." />
        ) : (
          <ChecklistResults
            emptyTitle="No checklist evidence"
            emptyMessage="Structured checklist results will appear after technician inspection."
            groups={checklistGroups}
          />
        )}
      </Card>

      <Card>
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>Reports</h2>
        {reports && reports.length > 0 ? (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {reports.map((report) => (
              <div key={report.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "center" }}>
                <div>
                  <strong>{report.report_number}</strong>
                  <div style={{ color: "var(--muted)", marginTop: 4 }}>{report.title ?? "Untitled report"}</div>
                  <div style={{ color: "var(--muted)", marginTop: 4 }}>Generated {formatDate(report.generated_at)}</div>
                </div>
                <StatusBadge>{reportStatusLabel[report.status] ?? report.status}</StatusBadge>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No report generated" message="Start review, then generate the report shell from Reports." />
        )}
      </Card>
    </div>
  );
}
