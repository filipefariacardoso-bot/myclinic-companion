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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_type: string
          created_at: string | null
          id: string
          notes: string | null
          patient_name: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          appointment_date: string
          appointment_type: string
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_name: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          appointment_date?: string
          appointment_type?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_name?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cartilhas: {
        Row: {
          created_at: string | null
          description: string | null
          file_type: string
          file_url: string
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_type: string
          file_url: string
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_type?: string
          file_url?: string
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clinic_location: {
        Row: {
          address: string
          city: string
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          map_url: string | null
          name: string
          opening_hours: string | null
          phone: string | null
          state: string
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          map_url?: string | null
          name: string
          opening_hours?: string | null
          phone?: string | null
          state: string
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          map_url?: string | null
          name?: string
          opening_hours?: string | null
          phone?: string | null
          state?: string
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      ebooks: {
        Row: {
          author: string | null
          category: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          file_url: string
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          file_url: string
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          file_url?: string
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      medical_questionnaires: {
        Row: {
          additional_observations: string | null
          birth_weight: string | null
          child_age: string
          child_name: string
          child_sex: string
          complaint_details: string | null
          consanguinity_degree: string | null
          consultation_reason: string | null
          current_illness_history: string | null
          current_medications: string | null
          delivery_complications: string | null
          delivery_type: string | null
          development_observations: string | null
          development_perception: string | null
          family_medical_history: string | null
          first_steps_age: string | null
          first_words_age: string | null
          gestational_age: string | null
          has_been_hospitalized: boolean | null
          has_had_surgeries: boolean | null
          health_history: string | null
          hospitalization_details: string | null
          id: string
          known_allergies: string | null
          last_vaccination_date: string | null
          main_complaint: string
          main_symptoms: string[] | null
          medications: string | null
          parents_concerns: string | null
          parents_consanguinity: boolean | null
          past_medical_history: string | null
          pregnancy_complications: string | null
          recent_diseases: string | null
          specific_questions: string | null
          sphincter_control_age: string | null
          status: string | null
          submitted_at: string | null
          surgery_details: string | null
          symptoms_duration: string | null
          urgency_level: string | null
          user_id: string
          vaccination_card_status: string | null
          vaccination_details: string | null
        }
        Insert: {
          additional_observations?: string | null
          birth_weight?: string | null
          child_age: string
          child_name: string
          child_sex: string
          complaint_details?: string | null
          consanguinity_degree?: string | null
          consultation_reason?: string | null
          current_illness_history?: string | null
          current_medications?: string | null
          delivery_complications?: string | null
          delivery_type?: string | null
          development_observations?: string | null
          development_perception?: string | null
          family_medical_history?: string | null
          first_steps_age?: string | null
          first_words_age?: string | null
          gestational_age?: string | null
          has_been_hospitalized?: boolean | null
          has_had_surgeries?: boolean | null
          health_history?: string | null
          hospitalization_details?: string | null
          id?: string
          known_allergies?: string | null
          last_vaccination_date?: string | null
          main_complaint: string
          main_symptoms?: string[] | null
          medications?: string | null
          parents_concerns?: string | null
          parents_consanguinity?: boolean | null
          past_medical_history?: string | null
          pregnancy_complications?: string | null
          recent_diseases?: string | null
          specific_questions?: string | null
          sphincter_control_age?: string | null
          status?: string | null
          submitted_at?: string | null
          surgery_details?: string | null
          symptoms_duration?: string | null
          urgency_level?: string | null
          user_id: string
          vaccination_card_status?: string | null
          vaccination_details?: string | null
        }
        Update: {
          additional_observations?: string | null
          birth_weight?: string | null
          child_age?: string
          child_name?: string
          child_sex?: string
          complaint_details?: string | null
          consanguinity_degree?: string | null
          consultation_reason?: string | null
          current_illness_history?: string | null
          current_medications?: string | null
          delivery_complications?: string | null
          delivery_type?: string | null
          development_observations?: string | null
          development_perception?: string | null
          family_medical_history?: string | null
          first_steps_age?: string | null
          first_words_age?: string | null
          gestational_age?: string | null
          has_been_hospitalized?: boolean | null
          has_had_surgeries?: boolean | null
          health_history?: string | null
          hospitalization_details?: string | null
          id?: string
          known_allergies?: string | null
          last_vaccination_date?: string | null
          main_complaint?: string
          main_symptoms?: string[] | null
          medications?: string | null
          parents_concerns?: string | null
          parents_consanguinity?: boolean | null
          past_medical_history?: string | null
          pregnancy_complications?: string | null
          recent_diseases?: string | null
          specific_questions?: string | null
          sphincter_control_age?: string | null
          status?: string | null
          submitted_at?: string | null
          surgery_details?: string | null
          symptoms_duration?: string | null
          urgency_level?: string | null
          user_id?: string
          vaccination_card_status?: string | null
          vaccination_details?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          image_url: string | null
          name: string
          phone: string | null
          specialty: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          name: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          name?: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      payment_info: {
        Row: {
          bank_info: string | null
          created_at: string | null
          description: string | null
          id: string
          instructions: string | null
          is_active: boolean | null
          pix_key: string | null
          pix_key_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          bank_info?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          pix_key?: string | null
          pix_key_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          bank_info?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          pix_key?: string | null
          pix_key_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          consent_date: string | null
          consent_given: boolean
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          consent_date?: string | null
          consent_given?: boolean
          created_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          consent_date?: string | null
          consent_given?: boolean
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      satisfaction_surveys: {
        Row: {
          comments: string | null
          id: string
          rating: number
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          comments?: string | null
          id?: string
          rating: number
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          comments?: string | null
          id?: string
          rating?: number
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client"
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
      app_role: ["admin", "client"],
    },
  },
} as const
