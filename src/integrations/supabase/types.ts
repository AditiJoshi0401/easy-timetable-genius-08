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
          name: string
          stream: string
          year: string
        }
        Insert: {
          code: string
          created_at?: string | null
          credits: number
          id?: string
          name: string
          stream: string
          year: string
        }
        Update: {
          code?: string
          created_at?: string | null
          credits?: number
          id?: string
          name?: string
          stream?: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
