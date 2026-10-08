import { EmptyState } from "@/components/ui/states";

type ChecklistResultItem = {
  id: string;
  prompt: string;
  resultStatus: string | null;
};

type ChecklistResultGroup = {
  id: string;
  assetCode: string;
  checklistName: string;
  status: string;
  items: ChecklistResultItem[];
};

type ChecklistResultsProps = {
  emptyMessage: string;
  emptyTitle: string;
  groups: ChecklistResultGroup[];
};

function ResultBadge({ children }: { children: string }) {
  return (
    <span
      style={{
        background: "#eef2f6",
        border: "1px solid var(--border)",
        borderRadius: 999,
        display: "inline-flex",
        fontSize: "0.8125rem",
        fontWeight: 700,
        justifyContent: "center",
        minWidth: 92,
        padding: "4px 10px",
        whiteSpace: "nowrap"
      }}
    >
      {children}
    </span>
  );
}

export function ChecklistResults({ emptyMessage, emptyTitle, groups }: ChecklistResultsProps) {
  if (groups.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {groups.map((group) => (
        <section
          key={group.id}
          style={{
            border: "1px solid var(--border)",
            borderRadius: 6,
            display: "grid",
            gap: "0.75rem",
            padding: "1rem"
          }}
        >
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
              <strong>{group.assetCode}</strong>
              <ResultBadge>{group.status}</ResultBadge>
            </div>
            <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>{group.checklistName}</div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {group.items.map((item) => (
              <div
                key={item.id}
                style={{
                  alignItems: "center",
                  borderTop: "1px solid var(--border)",
                  display: "grid",
                  gap: "0.75rem",
                  gridTemplateColumns: "minmax(0, 1fr) auto",
                  paddingTop: 8
                }}
              >
                <span>{item.prompt}</span>
                <ResultBadge>{item.resultStatus ?? "Not answered"}</ResultBadge>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
