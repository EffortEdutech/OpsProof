import { redirect } from "next/navigation";
import { createSiteRecord } from "@/app/(dashboard)/sites/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, ErrorState, SuccessState } from "@/components/ui/states";
import { requireProfile } from "@/lib/auth/current-user";
import { canAccessManagement } from "@/lib/permissions/roles";
import { createClient } from "@/lib/supabase/server";

type SitesPageProps = {
  searchParams?: Promise<{
    created?: string;
    error?: string;
  }>;
};

const fieldStyle = {
  minHeight: 44,
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: 12
};

export default async function SitesPage({ searchParams }: SitesPageProps) {
  const profile = await requireProfile();

  if (!canAccessManagement(profile.role)) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const supabase = await createClient();
  const [{ data: clients, error: clientsError }, { data: sites, error: sitesError }] = await Promise.all([
    supabase.from("clients").select("id,name").eq("active", true).order("name", { ascending: true }),
    supabase
      .from("sites")
      .select("id,name,site_code,address,city,state,country,active,created_at,clients(name)")
      .order("created_at", { ascending: false })
  ]);

  const hasClients = Boolean(clients && clients.length > 0);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <PageHeader title="Sites" description="Create client locations before planning maintenance jobs." />
      {params?.created ? (
        <SuccessState message="Site created." />
      ) : null}
      {params?.error ? (
        <ErrorState
          title="Site not saved"
          message={params.error === "missing-required" ? "Choose a client and enter a site name." : "The site could not be saved."}
        />
      ) : null}
      {clientsError ? <ErrorState title="Clients unavailable" message="Client choices could not be loaded." /> : null}
      <Card>
        <form action={createSiteRecord} style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            <select aria-label="Client" disabled={!hasClients} name="client_id" required style={fieldStyle}>
              <option value="">{hasClients ? "Select client" : "Create a client first"}</option>
              {clients?.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <input aria-label="Site name" disabled={!hasClients} name="name" placeholder="Site name" required style={fieldStyle} />
            <input aria-label="Site code" disabled={!hasClients} name="site_code" placeholder="Site code" style={fieldStyle} />
            <input aria-label="Address" disabled={!hasClients} name="address" placeholder="Address" style={fieldStyle} />
            <input aria-label="City" disabled={!hasClients} name="city" placeholder="City" style={fieldStyle} />
            <input aria-label="State" disabled={!hasClients} name="state" placeholder="State" style={fieldStyle} />
            <input aria-label="Postcode" disabled={!hasClients} name="postcode" placeholder="Postcode" style={fieldStyle} />
            <input aria-label="Country" disabled={!hasClients} name="country" placeholder="Malaysia" style={fieldStyle} />
          </div>
          <div>
            <Button disabled={!hasClients} type="submit">
              Create Site
            </Button>
          </div>
        </form>
      </Card>
      {sitesError ? (
        <ErrorState title="Sites unavailable" message="The site list could not be loaded." />
      ) : sites && sites.length > 0 ? (
        <Card className="table-scroll" style={{ padding: 0 }}>
          <table className="data-table">
            <colgroup>
              <col style={{ width: 180 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 150 }} />
              <col style={{ width: 300 }} />
              <col style={{ width: 100 }} />
            </colgroup>
            <thead>
              <tr>
                <th>Site</th>
                <th>Code</th>
                <th>Client</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr key={site.id}>
                  <td>
                    <strong>{site.name}</strong>
                  </td>
                  <td>
                    {site.site_code ?? "Not set"}
                  </td>
                  <td>{site.clients?.name ?? "Not set"}</td>
                  <td>
                    {[site.address, site.city, site.state, site.country].filter(Boolean).join(", ") || "Not set"}
                  </td>
                  <td>{site.active ? "Active" : "Inactive"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <EmptyState title="No sites yet" message="Create the first client location to unlock job planning." />
      )}
    </div>
  );
}
