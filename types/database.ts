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
          end_time: string | null
          host_id: string | null
          id: string
          location: string | null
          meeting_date: string
          notes: string | null
          offering_amount: number | null
          offering_type: Database["public"]["Enums"]["offering_type"] | null
          rating: number | null
          registered_at: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["meeting_status"]
          study_id: string | null
          theme: string | null
          updated_at: string
        }
        Insert: {
          cell_id: string
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          host_id?: string | null
          id?: string
          location?: string | null
          meeting_date: string
          notes?: string | null
          offering_amount?: number | null
          offering_type?: Database["public"]["Enums"]["offering_type"] | null
          rating?: number | null
          registered_at?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["meeting_status"]
          study_id?: string | null
          theme?: string | null
          updated_at?: string
        }
        Update: {
          cell_id?: string
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          host_id?: string | null
          id?: string
          location?: string | null
          meeting_date?: string
          notes?: string | null
          offering_amount?: number | null
          offering_type?: Database["public"]["Enums"]["offering_type"] | null
          rating?: number | null
          registered_at?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["meeting_status"]
          study_id?: string | null
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
          {
            foreignKeyName: "cell_meetings_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cell_meetings_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: false
            referencedRelation: "weekly_studies"
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
          co_leader_id: string | null
          created_at: string
          generation: string | null
          id: string
          leader_id: string | null
          meeting_time: string | null
          meeting_weekday: number | null
          name: string
          neighborhood: string | null
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          co_leader_id?: string | null
          created_at?: string
          generation?: string | null
          id?: string
          leader_id?: string | null
          meeting_time?: string | null
          meeting_weekday?: number | null
          name: string
          neighborhood?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          co_leader_id?: string | null
          created_at?: string
          generation?: string | null
          id?: string
          leader_id?: string | null
          meeting_time?: string | null
          meeting_weekday?: number | null
          name?: string
          neighborhood?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cells_co_leader_id_fkey"
            columns: ["co_leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
      event_tickets: {
        Row: {
          checked_in_at: string | null
          code: string
          created_at: string
          event_id: string
          id: string
          profile_id: string
          quantity: number
          status: Database["public"]["Enums"]["ticket_status"]
          total_price: number
          unit_price: number
        }
        Insert: {
          checked_in_at?: string | null
          code: string
          created_at?: string
          event_id: string
          id?: string
          profile_id: string
          quantity?: number
          status?: Database["public"]["Enums"]["ticket_status"]
          total_price?: number
          unit_price?: number
        }
        Update: {
          checked_in_at?: string | null
          code?: string
          created_at?: string
          event_id?: string
          id?: string
          profile_id?: string
          quantity?: number
          status?: Database["public"]["Enums"]["ticket_status"]
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string | null
          event_date: string
          id: string
          is_free: boolean
          location: string | null
          poster_url: string | null
          price: number | null
          registration_deadline: string | null
          registration_open: boolean
          start_time: string | null
          subtitle: string | null
          title: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          is_free?: boolean
          location?: string | null
          poster_url?: string | null
          price?: number | null
          registration_deadline?: string | null
          registration_open?: boolean
          start_time?: string | null
          subtitle?: string | null
          title: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          is_free?: boolean
          location?: string | null
          poster_url?: string | null
          price?: number | null
          registration_deadline?: string | null
          registration_open?: boolean
          start_time?: string | null
          subtitle?: string | null
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
      devotionals: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          devotional_date: string
          id: string
          title: string
          verse_reference: string | null
          verse_text: string | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          devotional_date: string
          id?: string
          title: string
          verse_reference?: string | null
          verse_text?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          devotional_date?: string
          id?: string
          title?: string
          verse_reference?: string | null
          verse_text?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          created_at: string
          id: string
          profile_id: string
          title: string | null
          updated_at: string
          verse_reference: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          profile_id: string
          title?: string | null
          updated_at?: string
          verse_reference?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          profile_id?: string
          title?: string | null
          updated_at?: string
          verse_reference?: string | null
        }
        Relationships: []
      }
      prayer_items: {
        Row: {
          answered: boolean
          answered_at: string | null
          created_at: string
          description: string | null
          id: string
          last_prayed_at: string | null
          prayed_count: number
          profile_id: string
          title: string
        }
        Insert: {
          answered?: boolean
          answered_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_prayed_at?: string | null
          prayed_count?: number
          profile_id: string
          title: string
        }
        Update: {
          answered?: boolean
          answered_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          last_prayed_at?: string | null
          prayed_count?: number
          profile_id?: string
          title?: string
        }
        Relationships: []
      }
      prayer_request_prayers: {
        Row: { created_at: string; profile_id: string; request_id: string }
        Insert: { created_at?: string; profile_id: string; request_id: string }
        Update: { created_at?: string; profile_id?: string; request_id?: string }
        Relationships: []
      }
      prayer_requests: {
        Row: {
          answered: boolean
          content: string
          created_at: string
          id: string
          is_anonymous: boolean
          profile_id: string
        }
        Insert: {
          answered?: boolean
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          profile_id: string
        }
        Update: {
          answered?: boolean
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_requests_profile_id_fkey"
            columns: ["profile_id"]
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
          active: boolean
          address: string | null
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          role_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          phone?: string | null
          role_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
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
          admin_only: boolean
          created_at: string
          id: string
          is_developer: boolean
          name: string
        }
        Insert: {
          admin_only?: boolean
          created_at?: string
          id?: string
          is_developer?: boolean
          name: string
        }
        Update: {
          admin_only?: boolean
          created_at?: string
          id?: string
          is_developer?: boolean
          name?: string
        }
        Relationships: []
      }
      weekly_studies: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          file_url: string | null
          id: string
          study_date: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          file_url?: string | null
          id?: string
          study_date: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          file_url?: string | null
          id?: string
          study_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_studies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      ensure_cell_saturdays: {
        Args: { p_cell_id: string; p_from?: string; p_months?: number }
        Returns: number
      }
      event_spots_left: { Args: { p_event_id: string }; Returns: number }
      has_permission: { Args: { p_key: string }; Returns: boolean }
      is_cell_leader: { Args: { target_cell_id: string }; Returns: boolean }
      is_cell_member: { Args: { target_cell_id: string }; Returns: boolean }
      is_developer: { Args: never; Returns: boolean }
    }
    Enums: {
      cell_member_role: "lider" | "anfitriao" | "membro"
      meeting_status: "a_realizar" | "registrada" | "nao_houve"
      meeting_team_role: "lider" | "co_lider" | "auxiliar"
      offering_type: "voluntaria" | "dizimo" | "oferta_especial"
      ticket_status: "pendente" | "confirmado" | "cancelado"
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
      meeting_status: ["a_realizar", "registrada", "nao_houve"],
      meeting_team_role: ["lider", "co_lider", "auxiliar"],
      offering_type: ["voluntaria", "dizimo", "oferta_especial"],
      ticket_status: ["pendente", "confirmado", "cancelado"],
    },
  },
} as const
