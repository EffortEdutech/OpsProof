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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
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
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                  <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Client</th>
                  <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Registration</th>
                  <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Industry</th>
                  <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Contact</th>
                  <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      <strong>{client.name}</strong>
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      {client.registration_no ?? "Not set"}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      {client.industry ?? "Not set"}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                      {client.email ?? client.phone ?? "Not set"}
                    </td>
                    <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
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
