import type { Profile } from "@/lib/supabase/types";

type CurrentUserBadgeProps = Readonly<{
  email: string | null;
  profile: Pick<Profile, "full_name" | "role">;
}>;

export function CurrentUserBadge({ email, profile }: CurrentUserBadgeProps) {
  return (
    <div aria-label="Currently signed in user" style={{ display: "grid", gap: 2, minWidth: 0 }}>
      <span style={{ color: "var(--muted)", fontSize: "0.75rem", textTransform: "uppercase" }}>Signed in</span>
      <strong style={{ overflowWrap: "anywhere" }}>{profile.full_name}</strong>
      <span style={{ color: "var(--muted)", fontSize: "0.875rem", overflowWrap: "anywhere" }}>
        {email ?? "Email unavailable"} - {profile.role}
      </span>
    </div>
  );
}
