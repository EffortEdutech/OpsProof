import { describe, expect, it } from "vitest";
import { getPublicEnv } from "@/lib/validation/env";

describe("getPublicEnv", () => {
  it("accepts valid public Supabase settings", () => {
    expect(
      getPublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon"
      })
    ).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon"
    });
  });

  it("rejects missing values", () => {
    expect(() => getPublicEnv({} as NodeJS.ProcessEnv)).toThrow(
      "Missing or invalid public environment"
    );
  });
});
