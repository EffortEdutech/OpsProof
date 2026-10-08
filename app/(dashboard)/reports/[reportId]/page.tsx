import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { issueReport, reviewReport } from "@/app/(dashboard)/reports/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChecklistResults } from "@/components/ui/checklist-results";
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
  const { data: jobEquipment } = await supabase
    .from("job_equipment")
    .select("id,equipment(asset_code)")
    .eq("job_id", report.job_id)
    .order("created_at", { ascending: true });
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

      <Card className="print-section">
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>Checklist results</h2>
        {inspectionsError || templateItemsError || resultsError ? (
          <EmptyState title="Checklist unavailable" message="Structured checklist results could not be loaded." />
        ) : (
          <ChecklistResults
            emptyTitle="No checklist results"
            emptyMessage="This report has no structured checklist results attached."
            groups={checklistGroups}
          />
        )}
      </Card>
    </div>
  );
}
