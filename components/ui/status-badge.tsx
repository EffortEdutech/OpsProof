type StatusBadgeProps = {
  children: string;
};

export function StatusBadge({ children }: StatusBadgeProps) {
  return (
    <span
      style={{
        background: "#eef2f6",
        border: "1px solid var(--border)",
        borderRadius: 999,
        display: "inline-block",
        fontSize: "0.8125rem",
        fontWeight: 600,
        padding: "4px 10px",
        whiteSpace: "nowrap"
      }}
    >
      {children}
    </span>
  );
}
