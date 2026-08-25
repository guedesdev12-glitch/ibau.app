export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      cell_meeting_team: {
        Row: {
          meeting_id: string
          profile_id: string
          role: Database["public"]["Enums"]["meeting_team_role"]
        }
        Insert: {
          meeting_id: string
          profile_id: string
          role?: Database["public"]["Enums"]["meeting_team_role"]
        }
        Update: {
          meeting_id?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["meeting_team_role"]
        }
        Relationships: [
          {
            foreignKeyName: "cell_meeting_team_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "cell_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cell_meeting_team_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cell_meeting_visitors: {
        Row: {
          meeting_id: string
          visitor_id: string
        }
        Insert: {
          meeting_id: string
          visitor_id: string
        }
        Update: {
          meeting_id?: string
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cell_meeting_visitors_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "cell_meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cell_meeting_visitors_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      cell_meetings: {
        Row: {
          cell_id: string
          created_at: string
          created_by: string | null
          duration_minutes: number | null
          id: string
          location: string | null
          meeting_date: string
          notes: string | null
          offering_amount: number | null
          offering_type: Database["public"]["Enums"]["offering_type"] | null
          start_time: string | null
          theme: string | null
          updated_at: string
        }
        Insert: {
          cell_id: string
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          meeting_date: string
          notes?: string | null
          offering_amount?: number | null
          offering_type?: Database["public"]["Enums"]["offering_type"] | null
          start_time?: string | null
          theme?: string | null
          updated_at?: string
        }
        Update: {
          cell_id?: string
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          meeting_date?: string
          notes?: string | null
          offering_amount?: number | null
          offering_type?: Database["public"]["Enums"]["offering_type"] | null
          start_time?: string | null
          theme?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cell_meetings_cell_id_fkey"
            columns: ["cell_id"]
            isOneToOne: false
            referencedRelation: "cells"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cell_meetings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cell_members: {
        Row: {
          cell_id: string
          joined_at: string
          profile_id: string
          role: Database["public"]["Enums"]["cell_member_role"]
        }
        Insert: {
          cell_id: string
          joined_at?: string
          profile_id: string
          role?: Database["public"]["Enums"]["cell_member_role"]
        }
        Update: {
          cell_id?: string
          joined_at?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["cell_member_role"]
        }
        Relationships: [
          {
            foreignKeyName: "cell_members_cell_id_fkey"
            columns: ["cell_id"]
            isOneToOne: false
            referencedRelation: "cells"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cell_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cells: {
        Row: {
          active: boolean
          address: string | null
          created_at: string
          id: string
          leader_id: string | null
          meeting_time: string | null
          meeting_weekday: number | null
          name: string
          neighborhood: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          created_at?: string
          id?: string
          leader_id?: string | null
          meeting_time?: string | null
          meeting_weekday?: number | null
          name: string
          neighborhood?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          created_at?: string
          id?: string
          leader_id?: string | null
          meeting_time?: string | null
          meeting_weekday?: number | null
          name?: string
          neighborhood?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cells_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      church_services: {
        Row: {
          active: boolean
          created_at: string
          id: string
          label: string
          start_time: string
          weekday: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          label: string
          start_time: string
          weekday: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          label?: string
          start_time?: string
          weekday?: number
        }
        Relationships: []
      }
      church_settings: {
        Row: {
          about: string | null
          address: string | null
          id: boolean
          instagram: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          about?: string | null
          address?: string | null
          id?: boolean
          instagram?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          about?: string | null
          address?: string | null
          id?: boolean
          instagram?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string
          id: string
          location: string | null
          start_time: string | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date: string
          id?: string
          location?: string | null
          start_time?: string | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string
          id?: string
          location?: string | null
          start_time?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      home_banners: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          id: string
          image_url: string
          position: number
          title: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          image_url: string
          position?: number
          title?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string
          position?: number
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "home_banners_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string
          id: string
          key: string
          label: string
          module: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          label: string
          module: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          label?: string
          module?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          role_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          role_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          role_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          id: string
          is_developer: boolean
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_developer?: boolean
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_developer?: boolean
          name?: string
        }
        Relationships: []
      }
      visitors: {
        Row: {
          cell_id: string
          created_at: string
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          cell_id: string
          created_at?: string
          full_name: string
          id?: string
          phone?: string | null
        }
        Update: {
          cell_id?: string
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitors_cell_id_fkey"
            columns: ["cell_id"]
            isOneToOne: false
            referencedRelation: "cells"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cell_monthly_summary: {
        Args: { p_cell_id: string; p_month: number; p_year: number }
        Returns: {
          encontros_count: number
          ofertas_total: number
          participantes_count: number
          visitantes_count: number
        }[]
      }
      has_permission: { Args: { p_key: string }; Returns: boolean }
      is_cell_leader: { Args: { target_cell_id: string }; Returns: boolean }
      is_cell_member: { Args: { target_cell_id: string }; Returns: boolean }
      is_developer: { Args: never; Returns: boolean }
    }
    Enums: {
      cell_member_role: "lider" | "anfitriao" | "membro"
      meeting_team_role: "lider" | "co_lider" | "auxiliar"
      offering_type: "voluntaria" | "dizimo" | "oferta_especial"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      cell_member_role: ["lider", "anfitriao", "membro"],
      meeting_team_role: ["lider", "co_lider", "auxiliar"],
      offering_type: ["voluntaria", "dizimo", "oferta_especial"],
    },
  },
} as const
