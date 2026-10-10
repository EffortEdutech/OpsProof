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

export function SuccessState({ message }: { message: string }) {
  return (
    <Card role="status" style={{ borderColor: "#9cc9a8", color: "#22543d" }}>
      {message}
    </Card>
  );
}

export function AlertState({ message }: { message: string }) {
  return (
    <Card role="alert" style={{ borderColor: "#f0b4ae", color: "#8a1f17" }}>
      {message}
    </Card>
  );
}
