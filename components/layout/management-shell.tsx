import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

type ManagementShellProps = Readonly<{
  children: React.ReactNode;
  title?: string;
  description?: string;
}>;

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clients", label: "Clients" },
  { href: "/sites", label: "Sites" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/reports", label: "Reports" }
];

export function ManagementShell({ children, title, description }: ManagementShellProps) {
  return (
    <div
      style={{
        display: "grid",
        minHeight: "100vh",
        gridTemplateColumns: "minmax(180px, 240px) minmax(0, 1fr)"
      }}
    >
      <aside
        style={{
          borderRight: "1px solid var(--border)",
          background: "var(--surface)",
          padding: "1.25rem"
        }}
      >
        <strong>FireMaint</strong>
        <nav style={{ display: "grid", gap: "0.75rem", marginTop: "2rem" }}>
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={signOut} style={{ marginTop: "2rem" }}>
          <Button type="submit" variant="secondary">
            Sign Out
          </Button>
        </form>
      </aside>
      <main style={{ display: "grid", alignContent: "start", gap: "1.5rem", padding: "2rem" }}>
        <div
          style={{
            alignItems: "center",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            padding: "0.75rem 1rem"
          }}
        >
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <form action={signOut} style={{ marginLeft: "auto" }}>
            <Button type="submit" variant="secondary">
              Sign Out
            </Button>
          </form>
        </div>
        {title ? <PageHeader {...(description ? { description } : {})} title={title} /> : null}
        {children}
      </main>
    </div>
  );
}
