import { Card } from "@/components/ui/card";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return <Card aria-busy="true">{label}</Card>;
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <Card>
      <strong>{title}</strong>
      <p style={{ margin: "0.5rem 0 0", color: "var(--muted)" }}>{message}</p>
    </Card>
  );
}

export function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <Card role="alert">
      <strong>{title}</strong>
      <p style={{ margin: "0.5rem 0 0", color: "var(--muted)" }}>{message}</p>
    </Card>
  );
}
