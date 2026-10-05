import Link from "next/link";

export function TechnicianShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      style={{
        display: "grid",
        minHeight: "100vh",
        gridTemplateRows: "auto 1fr auto",
        background: "#fbfbfa"
      }}
    >
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          padding: "1rem"
        }}
      >
        <strong>FireMaint Field</strong>
        <div style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Sync ready
        </div>
      </header>
      <main style={{ padding: "1rem" }}>{children}</main>
      <nav
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          borderTop: "1px solid var(--border)",
          background: "var(--surface)"
        }}
      >
        {["Today", "Jobs", "Scan", "More"].map((item) => (
          <Link key={item} href="/technician/today" style={{ padding: "1rem", textAlign: "center" }}>
            {item}
          </Link>
        ))}
      </nav>
    </div>
  );
}
