export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      invitations: {
        Row: {
          accepted_by: string | null
          created_at: string
          created_by: string
          email: string
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["trip_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token_hash: string
          trip_id: string
          updated_at: string
        }
        Insert: {
          accepted_by?: string | null
          created_at?: string
          created_by: string
          email: string
          expires_at: string
          id?: string
          role: Database["public"]["Enums"]["trip_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token_hash: string
          trip_id: string
          updated_at?: string
        }
        Update: {
          accepted_by?: string | null
          created_at?: string
          created_by?: string
          email?: string
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["trip_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token_hash?: string
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_items: {
        Row: {
          created_at: string
          duration_minutes: number
          fixed: boolean
          id: string
          meta: string
          place_id: string | null
          sort_key: string
          starts_at: string
          status: Database["public"]["Enums"]["itinerary_item_status"]
          title: string
          trip_day_id: string
          type: Database["public"]["Enums"]["itinerary_item_type"]
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          duration_minutes: number
          fixed?: boolean
          id?: string
          meta?: string
          place_id?: string | null
          sort_key: string
          starts_at: string
          status?: Database["public"]["Enums"]["itinerary_item_status"]
          title: string
          trip_day_id: string
          type?: Database["public"]["Enums"]["itinerary_item_type"]
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          fixed?: boolean
          id?: string
          meta?: string
          place_id?: string | null
          sort_key?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["itinerary_item_status"]
          title?: string
          trip_day_id?: string
          type?: Database["public"]["Enums"]["itinerary_item_type"]
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_items_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_items_trip_day_id_fkey"
            columns: ["trip_day_id"]
            isOneToOne: false
            referencedRelation: "trip_days"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          address: string | null
          category: string
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          name: string
          rating: number | null
          region: string
          suggested_duration_minutes: number
          travel_minutes: number
          trip_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          category: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          rating?: number | null
          region: string
          suggested_duration_minutes: number
          travel_minutes?: number
          trip_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          rating?: number | null
          region?: string
          suggested_duration_minutes?: number
          travel_minutes?: number
          trip_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "places_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_days: {
        Row: {
          created_at: string
          date: string
          id: string
          pace_override: Database["public"]["Enums"]["trip_pace"] | null
          sort_key: string
          title: string
          trip_id: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          pace_override?: Database["public"]["Enums"]["trip_pace"] | null
          sort_key: string
          title: string
          trip_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          pace_override?: Database["public"]["Enums"]["trip_pace"] | null
          sort_key?: string
          title?: string
          trip_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "trip_days_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_events: {
        Row: {
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_table: string
          event_type: string
          id: string
          payload: Json
          trip_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          entity_id: string
          entity_table: string
          event_type: string
          id?: string
          payload?: Json
          trip_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_table?: string
          event_type?: string
          id?: string
          payload?: Json
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_events_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_members: {
        Row: {
          created_at: string
          display_name: string
          role: Database["public"]["Enums"]["trip_role"]
          trip_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          role: Database["public"]["Enums"]["trip_role"]
          trip_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          role?: Database["public"]["Enums"]["trip_role"]
          trip_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string
          currency: Database["public"]["Enums"]["trip_currency"]
          current_day_id: string | null
          default_pace: Database["public"]["Enums"]["trip_pace"]
          destination: string
          end_date: string
          id: string
          owner_id: string
          start_date: string
          timezone: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          currency?: Database["public"]["Enums"]["trip_currency"]
          current_day_id?: string | null
          default_pace?: Database["public"]["Enums"]["trip_pace"]
          destination: string
          end_date: string
          id?: string
          owner_id: string
          start_date: string
          timezone: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          currency?: Database["public"]["Enums"]["trip_currency"]
          current_day_id?: string | null
          default_pace?: Database["public"]["Enums"]["trip_pace"]
          destination?: string
          end_date?: string
          id?: string
          owner_id?: string
          start_date?: string
          timezone?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "trips_current_day_id_fkey"
            columns: ["current_day_id"]
            isOneToOne: false
            referencedRelation: "trip_days"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      safe_invitations: {
        Row: {
          accepted_by: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          expires_at: string | null
          id: string | null
          role: Database["public"]["Enums"]["trip_role"] | null
          status: Database["public"]["Enums"]["invitation_status"] | null
          trip_id: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_by?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string | null
          role?: Database["public"]["Enums"]["trip_role"] | null
          status?: Database["public"]["Enums"]["invitation_status"] | null
          trip_id?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_by?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string | null
          role?: Database["public"]["Enums"]["trip_role"] | null
          status?: Database["public"]["Enums"]["invitation_status"] | null
          trip_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_trip_invitation: {
        Args: { invitation_token: string }
        Returns: {
          invitation_id: string
          role: Database["public"]["Enums"]["trip_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          trip_id: string
        }[]
      }
      can_admin_trip: { Args: { target_trip_id: string }; Returns: boolean }
      can_edit_trip: { Args: { target_trip_id: string }; Returns: boolean }
      can_read_trip: { Args: { target_trip_id: string }; Returns: boolean }
      current_user_role: {
        Args: { target_trip_id: string }
        Returns: Database["public"]["Enums"]["trip_role"]
      }
      is_trip_owner: { Args: { target_trip_id: string }; Returns: boolean }
      redact_trip_event_row: {
        Args: { entity_table_name: string; row_data: Json }
        Returns: Json
      }
      trip_id_for_day: { Args: { day_id: string }; Returns: string }
      update_itinerary_item_with_version: {
        Args: { expected_version: number; patch: Json; target_item_id: string }
        Returns: {
          created_at: string
          duration_minutes: number
          fixed: boolean
          id: string
          meta: string
          place_id: string | null
          sort_key: string
          starts_at: string
          status: Database["public"]["Enums"]["itinerary_item_status"]
          title: string
          trip_day_id: string
          type: Database["public"]["Enums"]["itinerary_item_type"]
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "itinerary_items"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_trip_day_with_version: {
        Args: { expected_version: number; patch: Json; target_day_id: string }
        Returns: {
          created_at: string
          date: string
          id: string
          pace_override: Database["public"]["Enums"]["trip_pace"] | null
          sort_key: string
          title: string
          trip_id: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "trip_days"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_trip_with_version: {
        Args: { expected_version: number; patch: Json; target_trip_id: string }
        Returns: {
          created_at: string
          currency: Database["public"]["Enums"]["trip_currency"]
          current_day_id: string | null
          default_pace: Database["public"]["Enums"]["trip_pace"]
          destination: string
          end_date: string
          id: string
          owner_id: string
          start_date: string
          timezone: string
          title: string
          updated_at: string
          version: number
        }
        SetofOptions: {
          from: "*"
          to: "trips"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      invitation_status: "pending" | "accepted" | "revoked" | "expired"
      itinerary_item_status: "planned" | "confirmed" | "completed" | "cancelled"
      itinerary_item_type: "place" | "transit"
      trip_currency: "KRW" | "JPY" | "TWD"
      trip_pace: "very_relaxed" | "relaxed" | "balanced" | "full" | "intense"
      trip_role: "owner" | "admin" | "editor" | "viewer"
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
      invitation_status: ["pending", "accepted", "revoked", "expired"],
      itinerary_item_status: ["planned", "confirmed", "completed", "cancelled"],
      itinerary_item_type: ["place", "transit"],
      trip_currency: ["KRW", "JPY", "TWD"],
      trip_pace: ["very_relaxed", "relaxed", "balanced", "full", "intense"],
      trip_role: ["owner", "admin", "editor", "viewer"],
    },
  },
} as const

