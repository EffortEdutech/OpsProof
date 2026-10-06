import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { PageHeader } from "@/components/ui/page-header";
import { requireProfile } from "@/lib/auth/current-user";
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
    .select("id,report_number,title,issued_at,status,maintenance_jobs(job_number,scheduled_date,sites(name))")
    .eq("status", "ISSUED")
    .order("issued_at", { ascending: false });

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <PageHeader title="Client Dashboard" description="Issued reports and evidence will appear here." />
      {error ? (
        <EmptyState title="Reports unavailable" message="Issued reports could not be loaded." />
      ) : reports && reports.length > 0 ? (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Report</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Title</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Job</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Site</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Issued</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
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
                    {report.issued_at ? new Date(report.issued_at).toISOString().slice(0, 10) : "Not set"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <EmptyState title="No issued reports loaded" message="Client data stays read-only and RLS-scoped." />
      )}
    </div>
  );
}
