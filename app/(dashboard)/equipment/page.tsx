import { redirect } from "next/navigation";
import { createBuildingRecord, createEquipmentRecord, createSystemRecord } from "@/app/(dashboard)/equipment/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { PageHeader } from "@/components/ui/page-header";
import { requireProfile } from "@/lib/auth/current-user";
import { canAccessManagement } from "@/lib/permissions/roles";
import { createClient } from "@/lib/supabase/server";

type EquipmentPageProps = {
  searchParams?: Promise<{
    building?: string;
    equipment?: string;
    error?: string;
    system?: string;
  }>;
};

const fieldStyle = {
  minHeight: 44,
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: 12
};

const systemTypes = [
  ["FIRE_ALARM", "Fire alarm"],
  ["FIRE_EXTINGUISHING", "Fire extinguishing"],
  ["HOSE_REEL", "Hose reel"],
  ["SPRINKLER", "Sprinkler"],
  ["EMERGENCY_LIGHTING", "Emergency lighting"],
  ["EXIT_SIGNAGE", "Exit signage"],
  ["OTHER", "Other"]
];

const statusLabel = {
  ACTIVE: "Active",
  OUT_OF_SERVICE: "Out of service",
  RETIRED: "Retired"
};

export default async function EquipmentPage({ searchParams }: EquipmentPageProps) {
  const profile = await requireProfile();

  if (!canAccessManagement(profile.role)) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const supabase = await createClient();
  const [
    { data: sites, error: sitesError },
    { data: buildings, error: buildingsError },
    { data: systems, error: systemsError },
    { data: equipmentTypes, error: typesError },
    { data: equipment, error: equipmentError }
  ] = await Promise.all([
    supabase.from("sites").select("id,name,clients(name)").eq("active", true).order("name", { ascending: true }),
    supabase.from("buildings").select("id,name,code,active,sites(name,clients(name))").eq("active", true).order("name", { ascending: true }),
    supabase.from("systems").select("id,name,code,system_type,active,buildings(name,sites(name))").eq("active", true).order("name", { ascending: true }),
    supabase.from("equipment_types").select("id,name,code,system_type").or(`organisation_id.is.null,organisation_id.eq.${profile.organisation_id}`).eq("active", true).order("name", { ascending: true }),
    supabase
      .from("equipment")
      .select("id,asset_code,brand,model,capacity,location_description,status,buildings(name,sites(name)),systems(name),equipment_types(name,code)")
      .order("created_at", { ascending: false })
  ]);

  const hasSites = Boolean(sites?.length);
  const hasBuildings = Boolean(buildings?.length);
  const hasEquipmentTypes = Boolean(equipmentTypes?.length);
  const canCreateEquipment = hasBuildings && hasEquipmentTypes;

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <PageHeader title="Equipment" description="Register buildings, fire systems, and maintainable assets." />
      {params?.building ? (
        <Card role="status" style={{ borderColor: "#9cc9a8", color: "#22543d" }}>
          Building created.
        </Card>
      ) : null}
      {params?.system ? (
        <Card role="status" style={{ borderColor: "#9cc9a8", color: "#22543d" }}>
          System created.
        </Card>
      ) : null}
      {params?.equipment ? (
        <Card role="status" style={{ borderColor: "#9cc9a8", color: "#22543d" }}>
          Equipment registered.
        </Card>
      ) : null}
      {params?.error ? (
        <ErrorState
          title="Equipment register not saved"
          message={
            params.error === "missing-building"
              ? "Choose a site and enter a building name."
              : params.error === "missing-system"
                ? "Choose a building, system type, and system name."
                : params.error === "missing-equipment"
                  ? "Choose a building, equipment type, and asset code."
                  : "The register item could not be saved."
          }
        />
      ) : null}
      {sitesError || buildingsError || systemsError || typesError ? (
        <ErrorState title="Register setup unavailable" message="Some register choices could not be loaded." />
      ) : null}

      <Card>
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>Create building</h2>
        <form action={createBuildingRecord} style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            <select aria-label="Site" disabled={!hasSites} name="site_id" required style={fieldStyle}>
              <option value="">{hasSites ? "Select site" : "Create a site first"}</option>
              {sites?.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} - {site.clients?.name ?? "Client"}
                </option>
              ))}
            </select>
            <input aria-label="Building name" disabled={!hasSites} name="name" placeholder="Building name" required style={fieldStyle} />
            <input aria-label="Building code" disabled={!hasSites} name="code" placeholder="Building code" style={fieldStyle} />
            <input aria-label="Floors" disabled={!hasSites} min={1} name="floors" placeholder="Floors" style={fieldStyle} type="number" />
            <input aria-label="Building description" disabled={!hasSites} name="description" placeholder="Description" style={fieldStyle} />
          </div>
          <div>
            <Button disabled={!hasSites} type="submit">
              Create Building
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>Create system</h2>
        <form action={createSystemRecord} style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            <select aria-label="Building" disabled={!hasBuildings} name="building_id" required style={fieldStyle}>
              <option value="">{hasBuildings ? "Select building" : "Create a building first"}</option>
              {buildings?.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name} - {building.sites?.name ?? "Site"}
                </option>
              ))}
            </select>
            <select aria-label="System type" disabled={!hasBuildings} name="system_type" required style={fieldStyle}>
              {systemTypes.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input aria-label="System name" disabled={!hasBuildings} name="name" placeholder="System name" required style={fieldStyle} />
            <input aria-label="System code" disabled={!hasBuildings} name="code" placeholder="System code" style={fieldStyle} />
            <input aria-label="System description" disabled={!hasBuildings} name="description" placeholder="Description" style={fieldStyle} />
          </div>
          <div>
            <Button disabled={!hasBuildings} type="submit">
              Create System
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 style={{ fontSize: "1rem", margin: "0 0 1rem" }}>Register equipment</h2>
        <form action={createEquipmentRecord} style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            <select aria-label="Equipment building" disabled={!canCreateEquipment} name="building_id" required style={fieldStyle}>
              <option value="">{hasBuildings ? "Select building" : "Create a building first"}</option>
              {buildings?.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name} - {building.sites?.name ?? "Site"}
                </option>
              ))}
            </select>
            <select aria-label="System" disabled={!canCreateEquipment} name="system_id" style={fieldStyle}>
              <option value="">No system selected</option>
              {systems?.map((system) => (
                <option key={system.id} value={system.id}>
                  {system.name} - {system.buildings?.name ?? "Building"}
                </option>
              ))}
            </select>
            <select aria-label="Equipment type" disabled={!canCreateEquipment} name="equipment_type_id" required style={fieldStyle}>
              <option value="">{hasEquipmentTypes ? "Select equipment type" : "Seed equipment types first"}</option>
              {equipmentTypes?.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.code})
                </option>
              ))}
            </select>
            <input aria-label="Asset code" disabled={!canCreateEquipment} name="asset_code" placeholder="Asset code" required style={fieldStyle} />
            <input aria-label="Serial number" disabled={!canCreateEquipment} name="serial_number" placeholder="Serial number" style={fieldStyle} />
            <input aria-label="Brand" disabled={!canCreateEquipment} name="brand" placeholder="Brand" style={fieldStyle} />
            <input aria-label="Model" disabled={!canCreateEquipment} name="model" placeholder="Model" style={fieldStyle} />
            <input aria-label="Capacity" disabled={!canCreateEquipment} name="capacity" placeholder="Capacity" style={fieldStyle} />
            <input aria-label="Location description" disabled={!canCreateEquipment} name="location_description" placeholder="Location" style={fieldStyle} />
            <input aria-label="Installation date" disabled={!canCreateEquipment} name="installation_date" style={fieldStyle} type="date" />
          </div>
          <div>
            <Button disabled={!canCreateEquipment} type="submit">
              Register Equipment
            </Button>
          </div>
        </form>
      </Card>

      {equipmentError ? (
        <ErrorState title="Equipment unavailable" message="The equipment list could not be loaded." />
      ) : equipment && equipment.length > 0 ? (
        <Card style={{ padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Asset</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Type</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Building</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>System</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Location</th>
                <th style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((asset) => (
                <tr key={asset.id}>
                  <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                    <strong>{asset.asset_code}</strong>
                    <div style={{ color: "var(--muted)", marginTop: 4 }}>
                      {[asset.brand, asset.model, asset.capacity].filter(Boolean).join(" / ") || "Details not set"}
                    </div>
                  </td>
                  <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                    {asset.equipment_types?.name ?? "Not set"}
                  </td>
                  <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                    {asset.buildings?.name ?? "Not set"}
                    <div style={{ color: "var(--muted)", marginTop: 4 }}>{asset.buildings?.sites?.name ?? ""}</div>
                  </td>
                  <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>{asset.systems?.name ?? "Not set"}</td>
                  <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>{asset.location_description ?? "Not set"}</td>
                  <td style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>{statusLabel[asset.status] ?? asset.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <EmptyState title="No equipment registered" message="Create a building, system, then register the first asset." />
      )}
    </div>
  );
}
