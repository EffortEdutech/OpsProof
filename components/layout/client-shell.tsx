import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <strong>FireMaint Client Portal</strong>
          <form action={signOut}>
            <Button type="submit" variant="secondary">
              Sign Out
            </Button>
          </form>
        </div>
      </header>
      <main style={{ margin: "0 auto", maxWidth: "960px", padding: "2rem" }}>{children}</main>
    </div>
  );
}
