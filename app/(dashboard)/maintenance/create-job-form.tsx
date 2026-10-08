"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type ClientOption = {
  id: string;
  name: string;
};

type SiteOption = {
  id: string;
  clientId: string;
  name: string;
};

type EquipmentOption = {
  id: string;
  assetCode: string;
  typeName: string;
  clientName: string;
  siteId: string;
  siteName: string;
};

type TechnicianOption = {
  id: string;
  fullName: string;
};

type CreateJobFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  clients: ClientOption[];
  sites: SiteOption[];
  equipment: EquipmentOption[];
  technicians: TechnicianOption[];
};

const fieldStyle = {
  minHeight: 44,
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: 12
};

export function CreateJobForm({ action, clients, sites, equipment, technicians }: CreateJobFormProps) {
  const [clientId, setClientId] = useState("");
  const [siteId, setSiteId] = useState("");

  const clientSites = useMemo(
    () => sites.filter((site) => site.clientId === clientId),
    [clientId, sites]
  );
  const siteEquipment = useMemo(
    () => equipment.filter((asset) => asset.siteId === siteId),
    [equipment, siteId]
  );
  const hasClients = clients.length > 0;
  const canSelectSite = clientId.length > 0 && clientSites.length > 0;
  const canSelectAsset = siteId.length > 0 && siteEquipment.length > 0;
  const canCreateJob = canSelectSite;

  return (
    <form action={action} style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        <select
          aria-label="Client"
          disabled={!hasClients}
          name="client_id"
          onChange={(event) => {
            setClientId(event.target.value);
            setSiteId("");
          }}
          required
          style={fieldStyle}
          value={clientId}
        >
          <option value="">{hasClients ? "Select client" : "Create a client first"}</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Site"
          disabled={!clientId || clientSites.length === 0}
          name="site_id"
          onChange={(event) => setSiteId(event.target.value)}
          required
          style={fieldStyle}
          value={siteId}
        >
          <option value="">
            {!clientId ? "Select client first" : clientSites.length > 0 ? "Select site" : "Create a site for this client first"}
          </option>
          {clientSites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </select>
        <input aria-label="Plan name" disabled={!canCreateJob} name="name" placeholder="Plan name" required style={fieldStyle} />
        <select aria-label="Frequency" disabled={!canCreateJob} name="frequency" required style={fieldStyle}>
          <option value="MONTHLY">Monthly</option>
          <option value="QUARTERLY">Quarterly</option>
          <option value="HALF_YEARLY">Half yearly</option>
          <option value="YEARLY">Yearly</option>
          <option value="CUSTOM">Custom</option>
        </select>
        <select aria-label="Assigned technician" disabled={!canCreateJob} name="assigned_technician_id" style={fieldStyle}>
          <option value="">Unassigned</option>
          {technicians.map((technician) => (
            <option key={technician.id} value={technician.id}>
              {technician.fullName}
            </option>
          ))}
        </select>
        <select aria-label="Assigned asset" disabled={!canSelectAsset} name="equipment_id" style={fieldStyle}>
          <option value="">
            {!siteId ? "Select site first" : siteEquipment.length > 0 ? "Optional asset" : "Register an asset for this site first"}
          </option>
          {siteEquipment.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.assetCode} - {asset.typeName} / {asset.clientName} / {asset.siteName}
            </option>
          ))}
        </select>
        <input aria-label="Custom interval days" disabled={!canCreateJob} min={1} name="interval_days" placeholder="Custom interval days" style={fieldStyle} type="number" />
        <input aria-label="Plan start date" disabled={!canCreateJob} name="start_date" required style={fieldStyle} type="date" />
        <input aria-label="First scheduled date" disabled={!canCreateJob} name="scheduled_date" required style={fieldStyle} type="date" />
        <input aria-label="Notes" disabled={!canCreateJob} name="notes" placeholder="Notes" style={fieldStyle} />
      </div>
      <div>
        <Button disabled={!canCreateJob} type="submit">
          Create Plan and Job
        </Button>
      </div>
    </form>
  );
}
