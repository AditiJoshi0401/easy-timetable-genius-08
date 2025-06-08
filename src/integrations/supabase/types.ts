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
      divisions: {
        Row: {
          created_at: string | null
          id: string
          name: string
          streamid: string
          strength: number
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          streamid: string
          strength: number
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          streamid?: string
          strength?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "divisions_streamid_fkey"
            columns: ["streamid"]
            isOneToOne: false
            referencedRelation: "streams"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          credits: number | null
          description: string | null
          id: string
          lectures: number | null
          name: string
          practical: number | null
          tutorials: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits?: number | null
          description?: string | null
          id?: string
          lectures?: number | null
          name: string
          practical?: number | null
          tutorials?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits?: number | null
          description?: string | null
          id?: string
          lectures?: number | null
          name?: string
          practical?: number | null
          tutorials?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          capacity: number
          created_at: string | null
          id: string
          number: string
          type: string
        }
        Insert: {
          capacity: number
          created_at?: string | null
          id?: string
          number: string
          type: string
        }
        Update: {
          capacity?: number
          created_at?: string | null
          id?: string
          number?: string
          type?: string
        }
        Relationships: []
      }
      streams: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
          years: number
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
          years: number
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          years?: number
        }
        Relationships: []
      }
      subjects: {
        Row: {
          code: string
          created_at: string | null
          credits: number
          id: string
          lectures: number | null
          name: string
          practicals: number | null
          stream: string
          tutorials: number | null
          year: string
        }
        Insert: {
          code: string
          created_at?: string | null
          credits?: number
          id?: string
          lectures?: number | null
          name: string
          practicals?: number | null
          stream: string
          tutorials?: number | null
          year: string
        }
        Update: {
          code?: string
          created_at?: string | null
          credits?: number
          id?: string
          lectures?: number | null
          name?: string
          practicals?: number | null
          stream?: string
          tutorials?: number | null
          year?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          cabin: string | null
          created_at: string | null
          email: string
          id: string
          ista: boolean
          name: string
          role: string | null
          specialization: string
          subjects: string[]
        }
        Insert: {
          cabin?: string | null
          created_at?: string | null
          email: string
          id?: string
          ista?: boolean
          name: string
          role?: string | null
          specialization: string
          subjects: string[]
        }
        Update: {
          cabin?: string | null
          created_at?: string | null
          email?: string
          id?: string
          ista?: boolean
          name?: string
          role?: string | null
          specialization?: string
          subjects?: string[]
        }
        Relationships: []
      }
      timetables: {
        Row: {
          created_at: string | null
          data: Json
          division_id: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data: Json
          division_id?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          division_id?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timetables_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
