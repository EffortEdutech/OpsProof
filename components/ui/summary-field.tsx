type SummaryFieldProps = {
  label: string;
  value: string;
};

export function SummaryField({ label, value }: SummaryFieldProps) {
  return (
    <div>
      <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>{label}</div>
      <strong style={{ display: "block", marginTop: 4 }}>{value}</strong>
    </div>
  );
}
