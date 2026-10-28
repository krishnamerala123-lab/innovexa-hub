export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      invitations: {
        Row: {
          created_at: string
          id: string
          match_score: number | null
          message: string
          profile_id: string
          project_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_score?: number | null
          message?: string
          profile_id: string
          project_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          match_score?: number | null
          message?: string
          profile_id?: string
          project_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability_hours: number
          collab_prefs: string
          created_at: string
          full_name: string
          id: string
          interests: string[]
          intro: string
          is_sample: boolean
          past_projects: string
          portfolio_links: string[]
          soft_skills: string[]
          tech_skills: string[]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          availability_hours?: number
          collab_prefs?: string
          created_at?: string
          full_name?: string
          id?: string
          interests?: string[]
          intro?: string
          is_sample?: boolean
          past_projects?: string
          portfolio_links?: string[]
          soft_skills?: string[]
          tech_skills?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          availability_hours?: number
          collab_prefs?: string
          created_at?: string
          full_name?: string
          id?: string
          interests?: string[]
          intro?: string
          is_sample?: boolean
          past_projects?: string
          portfolio_links?: string[]
          soft_skills?: string[]
          tech_skills?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      project_join_requests: {
        Row: {
          created_at: string
          id: string
          message: string
          profile_id: string
          project_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string
          profile_id: string
          project_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          profile_id?: string
          project_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_join_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_join_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          available_positions: string[]
          checklist: Json
          confidential_notes: string
          created_at: string
          creator_user_id: string | null
          document_links: string[]
          expected_hours: number
          general_solution: string
          id: string
          interests: string[]
          is_sample: boolean
          owner_id: string
          privacy: string
          problem: string
          required_skills: string[]
          roadmap_stage: number
          solution: string
          stage: string
          target_users: string
          technical_notes: string
          title: string
        }
        Insert: {
          available_positions?: string[]
          checklist?: Json
          confidential_notes?: string
          created_at?: string
          creator_user_id?: string | null
          document_links?: string[]
          expected_hours?: number
          general_solution?: string
          id?: string
          interests?: string[]
          is_sample?: boolean
          owner_id: string
          privacy?: string
          problem?: string
          required_skills?: string[]
          roadmap_stage?: number
          solution?: string
          stage?: string
          target_users?: string
          technical_notes?: string
          title: string
        }
        Update: {
          available_positions?: string[]
          checklist?: Json
          confidential_notes?: string
          created_at?: string
          creator_user_id?: string | null
          document_links?: string[]
          expected_hours?: number
          general_solution?: string
          id?: string
          interests?: string[]
          is_sample?: boolean
          owner_id?: string
          privacy?: string
          problem?: string
          required_skills?: string[]
          roadmap_stage?: number
          solution?: string
          stage?: string
          target_users?: string
          technical_notes?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmap_submissions: {
        Row: {
          evidence: string
          fields: Json
          id: string
          milestone: number
          project_id: string
          review_note: string
          reviewed_by: string | null
          status: string
          submitted_by: string
          updated_at: string
        }
        Insert: {
          evidence?: string
          fields?: Json
          id?: string
          milestone: number
          project_id: string
          review_note?: string
          reviewed_by?: string | null
          status?: string
          submitted_by: string
          updated_at?: string
        }
        Update: {
          evidence?: string
          fields?: Json
          id?: string
          milestone?: number
          project_id?: string
          review_note?: string
          reviewed_by?: string | null
          status?: string
          submitted_by?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approved_roadmap_stage: { Args: { _project: string }; Returns: number }
      can_submit_roadmap: { Args: { _project: string }; Returns: boolean }
      discoverable_project: { Args: { _project: string }; Returns: boolean }
      has_project_access: { Args: { _project: string }; Returns: boolean }
      my_profile_id: { Args: never; Returns: string }
      owns_project: { Args: { _project: string }; Returns: boolean }
      project_discovery: {
        Args: never
        Returns: {
          available_positions: string[]
          checklist: Json
          created_at: string
          expected_hours: number
          id: string
          interests: string[]
          is_sample: boolean
          owner_id: string
          privacy: string
          problem: string
          required_skills: string[]
          roadmap_stage: number
          solution: string
          stage: string
          target_users: string
          title: string
        }[]
      }
      project_team: {
        Args: { _project: string }
        Returns: {
          profile_id: string
        }[]
      }
      student_directory: {
        Args: never
        Returns: {
          availability_hours: number
          collab_prefs: string
          created_at: string
          full_name: string
          id: string
          interests: string[]
          intro: string
          is_sample: boolean
          past_projects: string
          portfolio_links: string[]
          soft_skills: string[]
          tech_skills: string[]
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
