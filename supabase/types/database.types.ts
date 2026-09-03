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
      canonical_places: {
        Row: {
          address_en: string | null
          address_ko: string | null
          address_zh_tw: string | null
          canonical_key: string
          category: string
          country_code: string
          created_at: string
          description_zh_tw: string | null
          id: string
          image_license: string | null
          image_url: string | null
          last_verified_at: string | null
          lat: number | null
          lng: number | null
          name_en: string | null
          name_ko: string
          name_zh_tw: string | null
          opening_hours: Json | null
          phone: string | null
          publication_status: Database["public"]["Enums"]["event_publication_status"]
          published_at: string | null
          region_code: string
          trust_level: Database["public"]["Enums"]["data_trust_level"]
          updated_at: string
          version: number
          website_url: string | null
        }
        Insert: {
          address_en?: string | null
          address_ko?: string | null
          address_zh_tw?: string | null
          canonical_key: string
          category: string
          country_code: string
          created_at?: string
          description_zh_tw?: string | null
          id?: string
          image_license?: string | null
          image_url?: string | null
          last_verified_at?: string | null
          lat?: number | null
          lng?: number | null
          name_en?: string | null
          name_ko: string
          name_zh_tw?: string | null
          opening_hours?: Json | null
          phone?: string | null
          publication_status?: Database["public"]["Enums"]["event_publication_status"]
          published_at?: string | null
          region_code: string
          trust_level?: Database["public"]["Enums"]["data_trust_level"]
          updated_at?: string
          version?: number
          website_url?: string | null
        }
        Update: {
          address_en?: string | null
          address_ko?: string | null
          address_zh_tw?: string | null
          canonical_key?: string
          category?: string
          country_code?: string
          created_at?: string
          description_zh_tw?: string | null
          id?: string
          image_license?: string | null
          image_url?: string | null
          last_verified_at?: string | null
          lat?: number | null
          lng?: number | null
          name_en?: string | null
          name_ko?: string
          name_zh_tw?: string | null
          opening_hours?: Json | null
          phone?: string | null
          publication_status?: Database["public"]["Enums"]["event_publication_status"]
          published_at?: string | null
          region_code?: string
          trust_level?: Database["public"]["Enums"]["data_trust_level"]
          updated_at?: string
          version?: number
          website_url?: string | null
        }
        Relationships: []
      }
      data_reports: {
        Row: {
          category: string
          created_at: string
          details: string
          event_id: string
          id: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["data_report_status"]
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          details: string
          event_id: string
          id?: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["data_report_status"]
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          details?: string
          event_id?: string
          id?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["data_report_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_reports_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      data_review_queue: {
        Row: {
          assigned_to: string | null
          created_at: string
          event_id: string | null
          id: string
          place_id: string | null
          priority: number
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          risk_flags: string[]
          status: Database["public"]["Enums"]["data_review_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          place_id?: string | null
          priority?: number
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_flags?: string[]
          status?: Database["public"]["Enums"]["data_review_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          place_id?: string | null
          priority?: number
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_flags?: string[]
          status?: Database["public"]["Enums"]["data_review_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_review_queue_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_review_queue_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "canonical_places"
            referencedColumns: ["id"]
          },
        ]
      }
      data_sources: {
        Row: {
          acquisition_method: string
          base_url: string
          code: string
          country_code: string
          created_at: string
          default_language: string
          enabled: boolean
          id: string
          kill_switch_reason: string | null
          kind: Database["public"]["Enums"]["data_source_kind"]
          last_failure_at: string | null
          last_success_at: string | null
          name: string
          rate_limit_per_minute: number | null
          region_code: string | null
          terms_status: string
          trust_level: Database["public"]["Enums"]["data_trust_level"]
          updated_at: string
        }
        Insert: {
          acquisition_method: string
          base_url: string
          code: string
          country_code: string
          created_at?: string
          default_language: string
          enabled?: boolean
          id?: string
          kill_switch_reason?: string | null
          kind: Database["public"]["Enums"]["data_source_kind"]
          last_failure_at?: string | null
          last_success_at?: string | null
          name: string
          rate_limit_per_minute?: number | null
          region_code?: string | null
          terms_status: string
          trust_level?: Database["public"]["Enums"]["data_trust_level"]
          updated_at?: string
        }
        Update: {
          acquisition_method?: string
          base_url?: string
          code?: string
          country_code?: string
          created_at?: string
          default_language?: string
          enabled?: boolean
          id?: string
          kill_switch_reason?: string | null
          kind?: Database["public"]["Enums"]["data_source_kind"]
          last_failure_at?: string | null
          last_success_at?: string | null
          name?: string
          rate_limit_per_minute?: number | null
          region_code?: string | null
          terms_status?: string
          trust_level?: Database["public"]["Enums"]["data_trust_level"]
          updated_at?: string
        }
        Relationships: []
      }
      event_change_notifications: {
        Row: {
          acknowledged_at: string | null
          after_snapshot: Json
          before_snapshot: Json
          change_kind: string
          created_at: string
          event_id: string | null
          id: string
          itinerary_item_id: string | null
          trip_id: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          after_snapshot: Json
          before_snapshot: Json
          change_kind: string
          created_at?: string
          event_id?: string | null
          id?: string
          itinerary_item_id?: string | null
          trip_id: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          after_snapshot?: Json
          before_snapshot?: Json
          change_kind?: string
          created_at?: string
          event_id?: string | null
          id?: string
          itinerary_item_id?: string | null
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_change_notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_change_notifications_itinerary_item_id_fkey"
            columns: ["itinerary_item_id"]
            isOneToOne: false
            referencedRelation: "itinerary_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_change_notifications_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      event_provenance: {
        Row: {
          created_at: string
          event_id: string
          external_id: string
          field_evidence: Json
          id: string
          is_primary: boolean
          observed_at: string
          raw_item_id: string | null
          source_id: string
          source_url: string
        }
        Insert: {
          created_at?: string
          event_id: string
          external_id: string
          field_evidence?: Json
          id?: string
          is_primary?: boolean
          observed_at: string
          raw_item_id?: string | null
          source_id: string
          source_url: string
        }
        Update: {
          created_at?: string
          event_id?: string
          external_id?: string
          field_evidence?: Json
          id?: string
          is_primary?: boolean
          observed_at?: string
          raw_item_id?: string | null
          source_id?: string
          source_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_provenance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_provenance_raw_item_id_fkey"
            columns: ["raw_item_id"]
            isOneToOne: false
            referencedRelation: "source_items_raw"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_provenance_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          canonical_key: string
          country_code: string
          created_at: string
          ends_at: string
          id: string
          image_license: string | null
          image_url: string | null
          last_verified_at: string | null
          lat: number | null
          lifecycle_status: Database["public"]["Enums"]["event_lifecycle_status"]
          lng: number | null
          publication_status: Database["public"]["Enums"]["event_publication_status"]
          published_at: string | null
          region_code: string
          starts_at: string
          summary_zh_tw: string | null
          tags: string[]
          ticket_url: string | null
          timezone: string
          title_en: string | null
          title_ko: string
          title_zh_tw: string | null
          trust_level: Database["public"]["Enums"]["data_trust_level"]
          updated_at: string
          venue_name: string | null
          version: number
        }
        Insert: {
          address?: string | null
          canonical_key: string
          country_code: string
          created_at?: string
          ends_at: string
          id?: string
          image_license?: string | null
          image_url?: string | null
          last_verified_at?: string | null
          lat?: number | null
          lifecycle_status?: Database["public"]["Enums"]["event_lifecycle_status"]
          lng?: number | null
          publication_status?: Database["public"]["Enums"]["event_publication_status"]
          published_at?: string | null
          region_code: string
          starts_at: string
          summary_zh_tw?: string | null
          tags?: string[]
          ticket_url?: string | null
          timezone: string
          title_en?: string | null
          title_ko: string
          title_zh_tw?: string | null
          trust_level?: Database["public"]["Enums"]["data_trust_level"]
          updated_at?: string
          venue_name?: string | null
          version?: number
        }
        Update: {
          address?: string | null
          canonical_key?: string
          country_code?: string
          created_at?: string
          ends_at?: string
          id?: string
          image_license?: string | null
          image_url?: string | null
          last_verified_at?: string | null
          lat?: number | null
          lifecycle_status?: Database["public"]["Enums"]["event_lifecycle_status"]
          lng?: number | null
          publication_status?: Database["public"]["Enums"]["event_publication_status"]
          published_at?: string | null
          region_code?: string
          starts_at?: string
          summary_zh_tw?: string | null
          tags?: string[]
          ticket_url?: string | null
          timezone?: string
          title_en?: string | null
          title_ko?: string
          title_zh_tw?: string | null
          trust_level?: Database["public"]["Enums"]["data_trust_level"]
          updated_at?: string
          venue_name?: string | null
          version?: number
        }
        Relationships: []
      }
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
          added_by: string | null
          created_at: string
          duration_minutes: number
          fixed: boolean
          id: string
          meta: string
          place_id: string | null
          sort_key: string
          source_event_id: string | null
          source_idempotency_key: string | null
          source_reference: Json | null
          source_snapshot: Json | null
          starts_at: string
          status: Database["public"]["Enums"]["itinerary_item_status"]
          title: string
          trip_day_id: string
          type: Database["public"]["Enums"]["itinerary_item_type"]
          updated_at: string
          version: number
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          duration_minutes: number
          fixed?: boolean
          id?: string
          meta?: string
          place_id?: string | null
          sort_key: string
          source_event_id?: string | null
          source_idempotency_key?: string | null
          source_reference?: Json | null
          source_snapshot?: Json | null
          starts_at: string
          status?: Database["public"]["Enums"]["itinerary_item_status"]
          title: string
          trip_day_id: string
          type?: Database["public"]["Enums"]["itinerary_item_type"]
          updated_at?: string
          version?: number
        }
        Update: {
          added_by?: string | null
          created_at?: string
          duration_minutes?: number
          fixed?: boolean
          id?: string
          meta?: string
          place_id?: string | null
          sort_key?: string
          source_event_id?: string | null
          source_idempotency_key?: string | null
          source_reference?: Json | null
          source_snapshot?: Json | null
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
            foreignKeyName: "itinerary_items_source_event_id_fkey"
            columns: ["source_event_id"]
            isOneToOne: false
            referencedRelation: "events"
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
      pipeline_runs: {
        Row: {
          attempt: number
          created_at: string
          cursor: Json
          error_code: string | null
          error_summary: string | null
          finished_at: string | null
          id: string
          idempotency_key: string
          metrics: Json
          source_id: string
          started_at: string
          status: Database["public"]["Enums"]["pipeline_run_status"]
          trigger_kind: string
        }
        Insert: {
          attempt?: number
          created_at?: string
          cursor?: Json
          error_code?: string | null
          error_summary?: string | null
          finished_at?: string | null
          id?: string
          idempotency_key: string
          metrics?: Json
          source_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["pipeline_run_status"]
          trigger_kind: string
        }
        Update: {
          attempt?: number
          created_at?: string
          cursor?: Json
          error_code?: string | null
          error_summary?: string | null
          finished_at?: string | null
          id?: string
          idempotency_key?: string
          metrics?: Json
          source_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["pipeline_run_status"]
          trigger_kind?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_runs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      place_provenance: {
        Row: {
          created_at: string
          external_id: string
          field_evidence: Json
          id: string
          is_primary: boolean
          observed_at: string
          place_id: string
          raw_item_id: string | null
          source_id: string
          source_url: string
        }
        Insert: {
          created_at?: string
          external_id: string
          field_evidence?: Json
          id?: string
          is_primary?: boolean
          observed_at: string
          place_id: string
          raw_item_id?: string | null
          source_id: string
          source_url: string
        }
        Update: {
          created_at?: string
          external_id?: string
          field_evidence?: Json
          id?: string
          is_primary?: boolean
          observed_at?: string
          place_id?: string
          raw_item_id?: string | null
          source_id?: string
          source_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_provenance_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "canonical_places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_provenance_raw_item_id_fkey"
            columns: ["raw_item_id"]
            isOneToOne: false
            referencedRelation: "source_items_raw"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_provenance_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
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
      platform_audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          detail: Json
          entity_id: string | null
          entity_table: string
          expires_at: string
          id: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          detail?: Json
          entity_id?: string | null
          entity_table: string
          expires_at?: string
          id?: never
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          detail?: Json
          entity_id?: string | null
          entity_table?: string
          expires_at?: string
          id?: never
        }
        Relationships: []
      }
      platform_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          role: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          role: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          role?: Database["public"]["Enums"]["platform_role"]
          user_id?: string
        }
        Relationships: []
      }
      source_items_raw: {
        Row: {
          content_hash: string
          created_at: string
          expires_at: string
          external_id: string
          fetched_at: string
          id: string
          payload: Json
          pipeline_run_id: string
          source_id: string
          source_url: string
        }
        Insert: {
          content_hash: string
          created_at?: string
          expires_at: string
          external_id: string
          fetched_at: string
          id?: string
          payload: Json
          pipeline_run_id: string
          source_id: string
          source_url: string
        }
        Update: {
          content_hash?: string
          created_at?: string
          expires_at?: string
          external_id?: string
          fetched_at?: string
          id?: string
          payload?: Json
          pipeline_run_id?: string
          source_id?: string
          source_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_items_raw_pipeline_run_id_fkey"
            columns: ["pipeline_run_id"]
            isOneToOne: false
            referencedRelation: "pipeline_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_items_raw_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
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
      add_event_to_itinerary: {
        Args: {
          request_idempotency_key: string
          target_duration_minutes: number
          target_event_id: string
          target_sort_key: string
          target_starts_at: string
          target_trip_day_id: string
        }
        Returns: {
          added_by: string | null
          created_at: string
          duration_minutes: number
          fixed: boolean
          id: string
          meta: string
          place_id: string | null
          sort_key: string
          source_event_id: string | null
          source_idempotency_key: string | null
          source_reference: Json | null
          source_snapshot: Json | null
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
      review_data_item: {
        Args: {
          decision: string
          notes?: string
          target_id: string
          target_kind: string
        }
        Returns: Json
      }
      set_platform_role: {
        Args: {
          reason: string
          should_grant: boolean
          target_role: Database["public"]["Enums"]["platform_role"]
          target_user_id: string
        }
        Returns: {
          granted_at: string
          granted_by: string | null
          role: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "platform_roles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      trip_id_for_day: { Args: { day_id: string }; Returns: string }
      update_data_draft: {
        Args: {
          expected_version: number
          patch: Json
          target_id: string
          target_kind: string
        }
        Returns: Json
      }
      update_itinerary_item_with_version: {
        Args: { expected_version: number; patch: Json; target_item_id: string }
        Returns: {
          added_by: string | null
          created_at: string
          duration_minutes: number
          fixed: boolean
          id: string
          meta: string
          place_id: string | null
          sort_key: string
          source_event_id: string | null
          source_idempotency_key: string | null
          source_reference: Json | null
          source_snapshot: Json | null
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
      data_report_status: "open" | "triaged" | "resolved" | "dismissed"
      data_review_status: "pending" | "approved" | "rejected" | "needs_changes"
      data_source_kind: "official_api" | "official_site" | "maps" | "manual"
      data_trust_level: "official" | "verified" | "unverified"
      event_lifecycle_status:
        | "scheduled"
        | "cancelled"
        | "postponed"
        | "expired"
      event_publication_status:
        | "draft"
        | "review"
        | "published"
        | "rejected"
        | "archived"
      invitation_status: "pending" | "accepted" | "revoked" | "expired"
      itinerary_item_status: "planned" | "confirmed" | "completed" | "cancelled"
      itinerary_item_type: "place" | "transit"
      pipeline_run_status: "running" | "succeeded" | "failed" | "cancelled"
      platform_role: "platform_admin" | "data_reviewer"
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
      data_report_status: ["open", "triaged", "resolved", "dismissed"],
      data_review_status: ["pending", "approved", "rejected", "needs_changes"],
      data_source_kind: ["official_api", "official_site", "maps", "manual"],
      data_trust_level: ["official", "verified", "unverified"],
      event_lifecycle_status: [
        "scheduled",
        "cancelled",
        "postponed",
        "expired",
      ],
      event_publication_status: [
        "draft",
        "review",
        "published",
        "rejected",
        "archived",
      ],
      invitation_status: ["pending", "accepted", "revoked", "expired"],
      itinerary_item_status: ["planned", "confirmed", "completed", "cancelled"],
      itinerary_item_type: ["place", "transit"],
      pipeline_run_status: ["running", "succeeded", "failed", "cancelled"],
      platform_role: ["platform_admin", "data_reviewer"],
      trip_currency: ["KRW", "JPY", "TWD"],
      trip_pace: ["very_relaxed", "relaxed", "balanced", "full", "intense"],
      trip_role: ["owner", "admin", "editor", "viewer"],
    },
  },
} as const

