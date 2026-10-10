import Link from "next/link";
import { Card } from "@/components/ui/card";

type FilterItem = {
  count: number;
  href: string;
  key: string;
  label: string;
};

type FilterBarProps = {
  description?: string;
  items: FilterItem[];
  selectedKey: string;
};

export function FilterBar({ description, items, selectedKey }: FilterBarProps) {
  return (
    <Card>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {items.map((item) => {
          const selected = selectedKey === item.key;

          return (
            <Link
              aria-current={selected ? "page" : undefined}
              href={item.href}
              key={item.key}
              style={{
                background: selected ? "var(--accent)" : "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: selected ? "var(--accent-foreground)" : "var(--foreground)",
                fontWeight: 700,
                padding: "8px 10px",
                textDecoration: "none"
              }}
            >
              {item.label} ({item.count})
            </Link>
          );
        })}
      </div>
      {description ? (
        <div style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.75rem" }}>
          {description}
        </div>
      ) : null}
    </Card>
  );
}
