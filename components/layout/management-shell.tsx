import Link from "next/link";

export function ManagementShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div style={{ display: "grid", minHeight: "100vh", gridTemplateColumns: "240px 1fr" }}>
      <aside
        style={{
          borderRight: "1px solid var(--border)",
          background: "var(--surface)",
          padding: "1.25rem"
        }}
      >
        <strong>FireMaint</strong>
        <nav style={{ display: "grid", gap: "0.75rem", marginTop: "2rem" }}>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </aside>
      <main style={{ padding: "2rem" }}>{children}</main>
    </div>
  );
}
