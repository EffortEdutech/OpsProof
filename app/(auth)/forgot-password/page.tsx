import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default function ForgotPasswordPage() {
  return (
    <main style={{ display: "grid", minHeight: "100vh", placeItems: "center", padding: "1rem" }}>
      <Card style={{ width: "min(100%, 420px)" }}>
        <PageHeader title="Reset password" description="Password reset delivery is wired in the auth slice." />
      </Card>
    </main>
  );
}
