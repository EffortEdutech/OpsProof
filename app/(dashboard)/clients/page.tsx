import { redirect } from "next/navigation";
import { createClientRecord } from "@/app/(dashboard)/clients/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { requireProfile } from "@/lib/auth/current-user";
import { canAccessManagement } from "@/lib/permissions/roles";
import { createClient } from "@/lib/supabase/server";

type ClientsPageProps = {
  searchParams?: Promise<{
    created?: string;
    error?: string;
  }>;
};

const inputStyle = {
  minHeight: 44,
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: 12
};

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const profile = await requireProfile();

  if (!canAccessManagement(profile.role)) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const supabase = await createClient();
  const { data: clients, error } = await supabase
    .from("clients")
    .select("id,name,registration_no,industry,phone,email,active,created_at")
    .order("created_at", { ascending: false });

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <PageHeader title="Clients" description="Register and review client accounts for the current organisation." />
        {params?.created ? (
          <Card role="status" style={{ borderColor: "#9cc9a8", color: "#22543d" }}>
            Client created.
          </Card>
        ) : null}
        {params?.error ? (
          <ErrorState
            title="Client not saved"
            message={params.error === "missing-name" ? "Client name is required." : "The client could not be saved."}
          />
        ) : null}
        <Card>
          <form action={createClientRecord} style={{ display: "grid", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              <input aria-label="Client name" name="name" placeholder="Client name" required style={inputStyle} />
              <input aria-label="Registration number" name="registration_no" placeholder="Registration number" style={inputStyle} />
              <input aria-label="Industry" name="industry" placeholder="Industry" style={inputStyle} />
              <input aria-label="Phone" name="phone" placeholder="Phone" style={inputStyle} />
              <input aria-label="Email" name="email" placeholder="Email" type="email" style={inputStyle} />
              <input aria-label="Address" name="address" placeholder="Address" style={inputStyle} />
            </div>
            <div>
              <Button type="submit">Create Client</Button>
            </div>
          </form>
        </Card>
        {error ? (
          <ErrorState title="Clients unavailable" message="The client list could not be loaded." />
        ) : clients && clients.length > 0 ? (
          <Card className="table-scroll" style={{ padding: 0 }}>
            <table className="data-table">
              <colgroup>
                <col style={{ width: 180 }} />
                <col style={{ width: 150 }} />
                <col style={{ width: 150 }} />
                <col style={{ width: 190 }} />
                <col style={{ width: 100 }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Registration</th>
                  <th>Industry</th>
                  <th>Contact</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <strong>{client.name}</strong>
                    </td>
                    <td>
                      {client.registration_no ?? "Not set"}
                    </td>
                    <td>
                      {client.industry ?? "Not set"}
                    </td>
                    <td>
                      {client.email ?? client.phone ?? "Not set"}
                    </td>
                    <td>
                      {client.active ? "Active" : "Inactive"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : (
          <EmptyState title="No clients yet" message="Create the first client to begin the maintenance setup flow." />
        )}
    </div>
  );
}
