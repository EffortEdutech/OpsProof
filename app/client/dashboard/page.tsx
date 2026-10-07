import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { PageHeader } from "@/components/ui/page-header";
import { requireProfile } from "@/lib/auth/current-user";
import { formatDate } from "@/lib/format/date";
import { canAccessClientPortal } from "@/lib/permissions/roles";
import { createClient } from "@/lib/supabase/server";

export default async function ClientDashboardPage() {
  const profile = await requireProfile();

  if (!canAccessClientPortal(profile.role)) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data: reports, error } = await supabase
    .from("reports")
    .select("id,job_id,report_number,title,issued_at,status,maintenance_jobs(job_number,scheduled_date,sites(name))")
    .eq("status", "ISSUED")
    .order("issued_at", { ascending: false });
  const reportJobIds = reports?.map((report) => report.job_id).filter(Boolean) ?? [];
  const { data: findings, error: findingsError } =
    reportJobIds.length > 0
      ? await supabase
          .from("findings")
          .select("id,job_id,title,severity,status,recommendation")
          .in("job_id", reportJobIds)
          .order("created_at", { ascending: false })
      : { data: [], error: null };

  const findingsByJobId = new Map<string, NonNullable<typeof findings>>();

  findings?.forEach((finding) => {
    const current = findingsByJobId.get(finding.job_id) ?? [];
    findingsByJobId.set(finding.job_id, [...current, finding]);
  });

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <PageHeader title="Client Dashboard" description="Issued reports and evidence will appear here." />
      {error ? (
        <EmptyState title="Reports unavailable" message="Issued reports could not be loaded." />
      ) : findingsError ? (
        <EmptyState title="Evidence unavailable" message="Report evidence could not be loaded." />
      ) : reports && reports.length > 0 ? (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Report</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Title</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Job</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Site</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Evidence</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Issued</th>
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
                      <strong>{report.report_number}</strong>
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      {report.title ?? "Not set"}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      {report.maintenance_jobs?.job_number ?? "Not set"}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      {report.maintenance_jobs?.sites?.name ?? "Not set"}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      {evidenceSummary}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                      {formatDate(report.issued_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ) : (
        <EmptyState title="No issued reports loaded" message="Client data stays read-only and RLS-scoped." />
      )}
    </div>
  );
}
