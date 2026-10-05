// Shared, generated Supabase database contract for StellarJob workspace apps.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      applications: {
        Row: {
          cv_url: string | null;
          id: string;
          job_id: string;
          next_action_at: string | null;
          next_action_label: string | null;
          note: string | null;
          status: Database["public"]["Enums"]["application_status"];
          submitted_at: string;
          user_id: string;
        };
        Insert: {
          cv_url?: string | null;
          id?: string;
          job_id: string;
          next_action_at?: string | null;
          next_action_label?: string | null;
          note?: string | null;
          status?: Database["public"]["Enums"]["application_status"];
          submitted_at?: string;
          user_id: string;
        };
        Update: {
          cv_url?: string | null;
          id?: string;
          job_id?: string;
          next_action_at?: string | null;
          next_action_label?: string | null;
          note?: string | null;
          status?: Database["public"]["Enums"]["application_status"];
          submitted_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      certifications: {
        Row: {
          created_at: string;
          expires_year: number | null;
          id: string;
          issued_year: number | null;
          issuer: string | null;
          name: string;
          sort_order: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          expires_year?: number | null;
          id?: string;
          issued_year?: number | null;
          issuer?: string | null;
          name: string;
          sort_order?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          expires_year?: number | null;
          id?: string;
          issued_year?: number | null;
          issuer?: string | null;
          name?: string;
          sort_order?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          about: string | null;
          address: string | null;
          company_type: string | null;
          country: string | null;
          created_at: string;
          id: string;
          industries: string[] | null;
          logo_url: string | null;
          name: string;
          onboarding_completed_at: string | null;
          owner_id: string | null;
          size: string | null;
          slug: string | null;
          state_province: string | null;
          updated_at: string;
          verified: boolean;
          website: string | null;
        };
        Insert: {
          about?: string | null;
          address?: string | null;
          company_type?: string | null;
          country?: string | null;
          created_at?: string;
          id?: string;
          industries?: string[] | null;
          logo_url?: string | null;
          name: string;
          onboarding_completed_at?: string | null;
          owner_id?: string | null;
          size?: string | null;
          slug?: string | null;
          state_province?: string | null;
          updated_at?: string;
          verified?: boolean;
          website?: string | null;
        };
        Update: {
          about?: string | null;
          address?: string | null;
          company_type?: string | null;
          country?: string | null;
          created_at?: string;
          id?: string;
          industries?: string[] | null;
          logo_url?: string | null;
          name?: string;
          onboarding_completed_at?: string | null;
          owner_id?: string | null;
          size?: string | null;
          slug?: string | null;
          state_province?: string | null;
          updated_at?: string;
          verified?: boolean;
          website?: string | null;
        };
        Relationships: [];
      };
      education: {
        Row: {
          city: string | null;
          country: string | null;
          degree: string | null;
          end_date: string | null;
          end_year: number | null;
          field_of_study: string | null;
          id: string;
          is_current: boolean;
          level: string | null;
          school: string | null;
          start_date: string | null;
          start_year: number | null;
          user_id: string;
        };
        Insert: {
          city?: string | null;
          country?: string | null;
          degree?: string | null;
          end_date?: string | null;
          end_year?: number | null;
          field_of_study?: string | null;
          id?: string;
          is_current?: boolean;
          level?: string | null;
          school?: string | null;
          start_date?: string | null;
          start_year?: number | null;
          user_id: string;
        };
        Update: {
          city?: string | null;
          country?: string | null;
          degree?: string | null;
          end_date?: string | null;
          end_year?: number | null;
          field_of_study?: string | null;
          id?: string;
          is_current?: boolean;
          level?: string | null;
          school?: string | null;
          start_date?: string | null;
          start_year?: number | null;
          user_id?: string;
        };
        Relationships: [];
      };
      experience: {
        Row: {
          city: string | null;
          company: string | null;
          country: string | null;
          description: string | null;
          end_date: string | null;
          id: string;
          is_current: boolean;
          sort_order: number;
          start_date: string | null;
          title: string | null;
          user_id: string;
        };
        Insert: {
          city?: string | null;
          company?: string | null;
          country?: string | null;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          is_current?: boolean;
          sort_order?: number;
          start_date?: string | null;
          title?: string | null;
          user_id: string;
        };
        Update: {
          city?: string | null;
          company?: string | null;
          country?: string | null;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          is_current?: boolean;
          sort_order?: number;
          start_date?: string | null;
          title?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      job_skills: {
        Row: {
          id: string;
          job_id: string;
          skill: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          skill: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          skill?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_skills_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      jobs: {
        Row: {
          about: string | null;
          category: string | null;
          city: string | null;
          company_id: string;
          created_at: string;
          employment_type:
            Database["public"]["Enums"]["employment_type"] | null;
          id: string;
          nice_to_have: string[] | null;
          perks: string[] | null;
          posted_at: string;
          promoted: boolean;
          requirements: string[] | null;
          responsibilities: string[] | null;
          salary_max: number | null;
          salary_min: number | null;
          title: string;
          work_model: Database["public"]["Enums"]["work_model"] | null;
        };
        Insert: {
          about?: string | null;
          category?: string | null;
          city?: string | null;
          company_id: string;
          created_at?: string;
          employment_type?:
            Database["public"]["Enums"]["employment_type"] | null;
          id?: string;
          nice_to_have?: string[] | null;
          perks?: string[] | null;
          posted_at?: string;
          promoted?: boolean;
          requirements?: string[] | null;
          responsibilities?: string[] | null;
          salary_max?: number | null;
          salary_min?: number | null;
          title: string;
          work_model?: Database["public"]["Enums"]["work_model"] | null;
        };
        Update: {
          about?: string | null;
          category?: string | null;
          city?: string | null;
          company_id?: string;
          created_at?: string;
          employment_type?:
            Database["public"]["Enums"]["employment_type"] | null;
          id?: string;
          nice_to_have?: string[] | null;
          perks?: string[] | null;
          posted_at?: string;
          promoted?: boolean;
          requirements?: string[] | null;
          responsibilities?: string[] | null;
          salary_max?: number | null;
          salary_min?: number | null;
          title?: string;
          work_model?: Database["public"]["Enums"]["work_model"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"];
          avatar_url: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          cv_updated_at: string | null;
          cv_url: string | null;
          display_name: string | null;
          email: string | null;
          first_name: string | null;
          headline: string | null;
          id: string;
          last_name: string | null;
          locations: string[] | null;
          min_salary: number | null;
          onboarding_completed_at: string | null;
          phone: string | null;
          postal_code: string | null;
          street_address: string | null;
          summary: string | null;
          updated_at: string;
          work_model_prefs: Database["public"]["Enums"]["work_model"][] | null;
        };
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"];
          avatar_url?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          cv_updated_at?: string | null;
          cv_url?: string | null;
          display_name?: string | null;
          email?: string | null;
          first_name?: string | null;
          headline?: string | null;
          id: string;
          last_name?: string | null;
          locations?: string[] | null;
          min_salary?: number | null;
          onboarding_completed_at?: string | null;
          phone?: string | null;
          postal_code?: string | null;
          street_address?: string | null;
          summary?: string | null;
          updated_at?: string;
          work_model_prefs?: Database["public"]["Enums"]["work_model"][] | null;
        };
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"];
          avatar_url?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          cv_updated_at?: string | null;
          cv_url?: string | null;
          display_name?: string | null;
          email?: string | null;
          first_name?: string | null;
          headline?: string | null;
          id?: string;
          last_name?: string | null;
          locations?: string[] | null;
          min_salary?: number | null;
          onboarding_completed_at?: string | null;
          phone?: string | null;
          postal_code?: string | null;
          street_address?: string | null;
          summary?: string | null;
          updated_at?: string;
          work_model_prefs?: Database["public"]["Enums"]["work_model"][] | null;
        };
        Relationships: [];
      };
      saved_jobs: {
        Row: {
          id: string;
          job_id: string;
          saved_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          saved_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          saved_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      skills: {
        Row: {
          id: string;
          label: string;
          sort_order: number;
          user_id: string;
        };
        Insert: {
          id?: string;
          label: string;
          sort_order?: number;
          user_id: string;
        };
        Update: {
          id?: string;
          label?: string;
          sort_order?: number;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      account_type: "applicant" | "employer";
      application_status:
        | "applied"
        | "reviewing"
        | "interview"
        | "offer"
        | "not_selected"
        | "closed";
      employment_type: "full_time" | "part_time" | "contract" | "internship";
      work_model: "remote" | "hybrid" | "onsite";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
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
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      account_type: ["applicant", "employer"],
      application_status: [
        "applied",
        "reviewing",
        "interview",
        "offer",
        "not_selected",
        "closed",
      ],
      employment_type: ["full_time", "part_time", "contract", "internship"],
      work_model: ["remote", "hybrid", "onsite"],
    },
  },
} as const;
