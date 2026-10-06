import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <strong>FireMaint Field</strong>
            <div style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Sync ready
            </div>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="secondary">
              Sign Out
            </Button>
          </form>
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
