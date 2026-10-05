import type { Database as GeneratedDatabase } from "@/lib/supabase/database.types";

export type {
  CompositeTypes,
  Database,
  Enums,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate
} from "@/lib/supabase/database.types";

export type AppRole = GeneratedDatabase["public"]["Enums"]["app_role"];
export type Profile = GeneratedDatabase["public"]["Tables"]["profiles"]["Row"];
