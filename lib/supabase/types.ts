export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = "OWNER" | "ADMIN" | "SUPERVISOR" | "TECHNICIAN" | "CLIENT";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          organisation_id: string;
          client_id: string | null;
          full_name: string;
          phone: string | null;
          role: AppRole;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organisation_id: string;
          client_id?: string | null;
          full_name: string;
          phone?: string | null;
          role?: AppRole;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organisation_id?: string;
          client_id?: string | null;
          full_name?: string;
          phone?: string | null;
          role?: AppRole;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
