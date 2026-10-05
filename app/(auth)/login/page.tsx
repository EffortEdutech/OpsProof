import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function LoginPage() {
  return (
    <main
      style={{
        display: "grid",
        minHeight: "100vh",
        placeItems: "center",
        padding: "1rem"
      }}
    >
      <Card style={{ width: "min(100%, 420px)" }}>
        <PageHeader title="Sign in" description="Access FireMaint using your Supabase account." />
        <form style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
          <input
            aria-label="Email"
            name="email"
            placeholder="Email"
            type="email"
            style={{ minHeight: 44, border: "1px solid var(--border)", borderRadius: 6, padding: 12 }}
          />
          <input
            aria-label="Password"
            name="password"
            placeholder="Password"
            type="password"
            style={{ minHeight: 44, border: "1px solid var(--border)", borderRadius: 6, padding: 12 }}
          />
          <Button type="button">Continue</Button>
        </form>
      </Card>
    </main>
  );
}
