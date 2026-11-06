export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      deletion_jobs: {
        Row: {
          attempt_count: number;
          created_at: string;
          id: string;
          last_error_code: string | null;
          owner_id: string;
          status: Database["public"]["Enums"]["deletion_job_status"];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          attempt_count?: number;
          created_at?: string;
          id?: string;
          last_error_code?: string | null;
          owner_id: string;
          status?: Database["public"]["Enums"]["deletion_job_status"];
          updated_at?: string;
        };
        Update: {
          attempt_count?: number;
          created_at?: string;
          id?: string;
          last_error_code?: string | null;
          owner_id?: string;
          status?: Database["public"]["Enums"]["deletion_job_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          account_state: Database["public"]["Enums"]["account_state"];
          created_at: string;
          deletion_operation_id: string | null;
          deletion_requested_at: string | null;
          display_name: string | null;
          id: string;
          locale: string;
          preferences: NonNullable<Json>;
          skill_level: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          account_state?: Database["public"]["Enums"]["account_state"];
          created_at?: string;
          deletion_operation_id?: string | null;
          deletion_requested_at?: string | null;
          display_name?: string | null;
          id: string;
          locale?: string;
          preferences?: NonNullable<Json>;
          skill_level?: string | null;
          updated_at?: string;
        };
        Update: {
          account_state?: Database["public"]["Enums"]["account_state"];
          created_at?: string;
          deletion_operation_id?: string | null;
          deletion_requested_at?: string | null;
          display_name?: string | null;
          id?: string;
          locale?: string;
          preferences?: NonNullable<Json>;
          skill_level?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_deletion_operation_fk";
            columns: ["deletion_operation_id"];
            isOneToOne: false;
            referencedRelation: "deletion_jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          archived_at: string | null;
          budget_minor: number | null;
          constraints: NonNullable<Json>;
          created_at: string;
          currency_code: string | null;
          damage_description: string | null;
          deleted_at: string | null;
          description: string | null;
          id: string;
          intended_use: string | null;
          item_type: string | null;
          materials: string[];
          owner_id: string;
          skill_level: string | null;
          status: Database["public"]["Enums"]["project_status"];
          title: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          archived_at?: string | null;
          budget_minor?: number | null;
          constraints?: NonNullable<Json>;
          created_at?: string;
          currency_code?: string | null;
          damage_description?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          intended_use?: string | null;
          item_type?: string | null;
          materials?: string[];
          owner_id: string;
          skill_level?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          budget_minor?: number | null;
          constraints?: NonNullable<Json>;
          created_at?: string;
          currency_code?: string | null;
          damage_description?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          intended_use?: string | null;
          item_type?: string | null;
          materials?: string[];
          owner_id?: string;
          skill_level?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      begin_account_deletion: { Args: Record<PropertyKey, never>; Returns: string };
    };
    Enums: {
      account_state: "active" | "deleting";
      deletion_job_status: "requested" | "cleaning" | "auth_deletion_pending" | "failed";
      project_status: "draft" | "active" | "paused" | "completed" | "archived" | "deleting";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_state: ["active", "deleting"],
      deletion_job_status: ["requested", "cleaning", "auth_deletion_pending", "failed"],
      project_status: ["draft", "active", "paused", "completed", "archived", "deleting"],
    },
  },
} as const;
