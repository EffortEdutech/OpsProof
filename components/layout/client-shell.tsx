export function ClientShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          padding: "1rem 2rem"
        }}
      >
        <strong>FireMaint Client Portal</strong>
      </header>
      <main style={{ margin: "0 auto", maxWidth: "960px", padding: "2rem" }}>{children}</main>
    </div>
  );
}
