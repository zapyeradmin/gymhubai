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
      academy: {
        Row: {
          business_hours: Json | null
          capacity_per_class: number | null
          cnpj: string | null
          cor_primaria: string | null
          created_at: string
          documento: string | null
          documento_tipo: string | null
          email: string | null
          endereco: Json | null
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          instagram: string | null
          logo_url: string | null
          name: string
          owner_cpf: string | null
          owner_email: string | null
          owner_nome: string | null
          owner_telefone: string | null
          plano: Database["public"]["Enums"]["academy_plan"]
          razao_social: string | null
          site: string | null
          slug: string | null
          status: Database["public"]["Enums"]["academy_status"]
          system_plan_id: string | null
          telefone: string | null
          tipo_empresa: Database["public"]["Enums"]["business_type"]
          trial_ate: string | null
          ultimo_acesso: string | null
          updated_at: string
          valor_mensal: number | null
          whatsapp: string | null
        }
        Insert: {
          business_hours?: Json | null
          capacity_per_class?: number | null
          cnpj?: string | null
          cor_primaria?: string | null
          created_at?: string
          documento?: string | null
          documento_tipo?: string | null
          email?: string | null
          endereco?: Json | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          instagram?: string | null
          logo_url?: string | null
          name: string
          owner_cpf?: string | null
          owner_email?: string | null
          owner_nome?: string | null
          owner_telefone?: string | null
          plano?: Database["public"]["Enums"]["academy_plan"]
          razao_social?: string | null
          site?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["academy_status"]
          system_plan_id?: string | null
          telefone?: string | null
          tipo_empresa?: Database["public"]["Enums"]["business_type"]
          trial_ate?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
          valor_mensal?: number | null
          whatsapp?: string | null
        }
        Update: {
          business_hours?: Json | null
          capacity_per_class?: number | null
          cnpj?: string | null
          cor_primaria?: string | null
          created_at?: string
          documento?: string | null
          documento_tipo?: string | null
          email?: string | null
          endereco?: Json | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          instagram?: string | null
          logo_url?: string | null
          name?: string
          owner_cpf?: string | null
          owner_email?: string | null
          owner_nome?: string | null
          owner_telefone?: string | null
          plano?: Database["public"]["Enums"]["academy_plan"]
          razao_social?: string | null
          site?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["academy_status"]
          system_plan_id?: string | null
          telefone?: string | null
          tipo_empresa?: Database["public"]["Enums"]["business_type"]
          trial_ate?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
          valor_mensal?: number | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_system_plan_id_fkey"
            columns: ["system_plan_id"]
            isOneToOne: false
            referencedRelation: "system_plan"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_technical_responsible: {
        Row: {
          academy_id: string
          conselho: string
          created_at: string
          id: string
          nome: string
          numero_registro: string
          principal: boolean
          uf: string | null
          updated_at: string
        }
        Insert: {
          academy_id: string
          conselho?: string
          created_at?: string
          id?: string
          nome: string
          numero_registro: string
          principal?: boolean
          uf?: string | null
          updated_at?: string
        }
        Update: {
          academy_id?: string
          conselho?: string
          created_at?: string
          id?: string
          nome?: string
          numero_registro?: string
          principal?: boolean
          uf?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_technical_responsible_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academy"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_user: {
        Row: {
          academy_id: string
          ativo: boolean
          created_at: string
          email: string
          id: string
          must_change_password: boolean
          nome: string | null
          role: Database["public"]["Enums"]["academy_user_role"]
          ultimo_login: string | null
          updated_at: string
        }
        Insert: {
          academy_id: string
          ativo?: boolean
          created_at?: string
          email: string
          id?: string
          must_change_password?: boolean
          nome?: string | null
          role?: Database["public"]["Enums"]["academy_user_role"]
          ultimo_login?: string | null
          updated_at?: string
        }
        Update: {
          academy_id?: string
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          must_change_password?: boolean
          nome?: string | null
          role?: Database["public"]["Enums"]["academy_user_role"]
          ultimo_login?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_user_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academy"
            referencedColumns: ["id"]
          },
        ]
      }
      app_config: {
        Row: {
          app_name: string | null
          created_at: string
          id: string
          super_admin_emails: string[]
          system_settings: Json | null
          updated_at: string
        }
        Insert: {
          app_name?: string | null
          created_at?: string
          id?: string
          super_admin_emails?: string[]
          system_settings?: Json | null
          updated_at?: string
        }
        Update: {
          app_name?: string | null
          created_at?: string
          id?: string
          super_admin_emails?: string[]
          system_settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      checkin: {
        Row: {
          academy_id: string
          created_at: string
          date: string
          id: string
          modality: Database["public"]["Enums"]["class_modality"] | null
          schedule_id: string | null
          source: Database["public"]["Enums"]["checkin_source"]
          student_id: string
          student_name: string | null
          time: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          date: string
          id?: string
          modality?: Database["public"]["Enums"]["class_modality"] | null
          schedule_id?: string | null
          source?: Database["public"]["Enums"]["checkin_source"]
          student_id: string
          student_name?: string | null
          time: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          date?: string
          id?: string
          modality?: Database["public"]["Enums"]["class_modality"] | null
          schedule_id?: string | null
          source?: Database["public"]["Enums"]["checkin_source"]
          student_id?: string
          student_name?: string | null
          time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkin_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedule"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student"
            referencedColumns: ["id"]
          },
        ]
      }
      financial: {
        Row: {
          academy_id: string
          amount: number
          category: string | null
          created_at: string
          date: string
          description: string | null
          due_date: string | null
          id: string
          payment_method: string | null
          status: Database["public"]["Enums"]["financial_status"]
          student_id: string | null
          student_name: string | null
          type: Database["public"]["Enums"]["financial_type"]
          updated_at: string
        }
        Insert: {
          academy_id: string
          amount: number
          category?: string | null
          created_at?: string
          date: string
          description?: string | null
          due_date?: string | null
          id?: string
          payment_method?: string | null
          status?: Database["public"]["Enums"]["financial_status"]
          student_id?: string | null
          student_name?: string | null
          type?: Database["public"]["Enums"]["financial_type"]
          updated_at?: string
        }
        Update: {
          academy_id?: string
          amount?: number
          category?: string | null
          created_at?: string
          date?: string
          description?: string | null
          due_date?: string | null
          id?: string
          payment_method?: string | null
          status?: Database["public"]["Enums"]["financial_status"]
          student_id?: string | null
          student_name?: string | null
          type?: Database["public"]["Enums"]["financial_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student"
            referencedColumns: ["id"]
          },
        ]
      }
      lead: {
        Row: {
          academy_id: string
          created_at: string
          email: string | null
          id: string
          modality: string | null
          name: string
          objetivo: string | null
          phone: string
          plan_id: string | null
          schedule_id: string | null
          status: Database["public"]["Enums"]["lead_status"]
          type: Database["public"]["Enums"]["lead_type"]
          updated_at: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          email?: string | null
          id?: string
          modality?: string | null
          name: string
          objetivo?: string | null
          phone: string
          plan_id?: string | null
          schedule_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          type: Database["public"]["Enums"]["lead_type"]
          updated_at?: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          email?: string | null
          id?: string
          modality?: string | null
          name?: string
          objetivo?: string | null
          phone?: string
          plan_id?: string | null
          schedule_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          type?: Database["public"]["Enums"]["lead_type"]
          updated_at?: string
        }
        Relationships: []
      }
      plan: {
        Row: {
          academy_id: string
          active: boolean
          created_at: string
          description: string | null
          duration_months: number
          featured: boolean
          id: string
          included_classes: string[] | null
          name: string
          price: number
          total_checkins: number | null
          updated_at: string
        }
        Insert: {
          academy_id: string
          active?: boolean
          created_at?: string
          description?: string | null
          duration_months?: number
          featured?: boolean
          id?: string
          included_classes?: string[] | null
          name: string
          price: number
          total_checkins?: number | null
          updated_at?: string
        }
        Update: {
          academy_id?: string
          active?: boolean
          created_at?: string
          description?: string | null
          duration_months?: number
          featured?: boolean
          id?: string
          included_classes?: string[] | null
          name?: string
          price?: number
          total_checkins?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academy"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule: {
        Row: {
          academy_id: string
          active: boolean
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          instructor_id: string | null
          instructor_name: string | null
          max_capacity: number
          modality: Database["public"]["Enums"]["class_modality"] | null
          name: string
          start_time: string
          updated_at: string
        }
        Insert: {
          academy_id: string
          active?: boolean
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          instructor_id?: string | null
          instructor_name?: string | null
          max_capacity?: number
          modality?: Database["public"]["Enums"]["class_modality"] | null
          name: string
          start_time: string
          updated_at?: string
        }
        Update: {
          academy_id?: string
          active?: boolean
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          instructor_id?: string | null
          instructor_name?: string | null
          max_capacity?: number
          modality?: Database["public"]["Enums"]["class_modality"] | null
          name?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "team_member"
            referencedColumns: ["id"]
          },
        ]
      }
      student: {
        Row: {
          academy_id: string
          address: string | null
          ativo: boolean
          birth_date: string | null
          cpf: string | null
          created_at: string
          email: string | null
          emergency_contact: string | null
          gender: Database["public"]["Enums"]["student_gender"] | null
          id: string
          medical_notes: string | null
          name: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string | null
          photo_url: string | null
          plan_end: string | null
          plan_id: string | null
          plan_name: string | null
          plan_start: string | null
          status: Database["public"]["Enums"]["student_status"]
          updated_at: string
        }
        Insert: {
          academy_id: string
          address?: string | null
          ativo?: boolean
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          gender?: Database["public"]["Enums"]["student_gender"] | null
          id?: string
          medical_notes?: string | null
          name: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string | null
          photo_url?: string | null
          plan_end?: string | null
          plan_id?: string | null
          plan_name?: string | null
          plan_start?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          updated_at?: string
        }
        Update: {
          academy_id?: string
          address?: string | null
          ativo?: boolean
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          gender?: Database["public"]["Enums"]["student_gender"] | null
          id?: string
          medical_notes?: string | null
          name?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string | null
          photo_url?: string | null
          plan_end?: string | null
          plan_id?: string | null
          plan_name?: string | null
          plan_start?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plan"
            referencedColumns: ["id"]
          },
        ]
      }
      system_plan: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          destaque: boolean
          duracao: Database["public"]["Enums"]["plan_duration"]
          id: string
          max_alunos_ativos: number
          max_equipe_ativos: number
          nome: string
          permissoes: string[]
          updated_at: string
          valor: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          destaque?: boolean
          duracao?: Database["public"]["Enums"]["plan_duration"]
          id?: string
          max_alunos_ativos?: number
          max_equipe_ativos?: number
          nome: string
          permissoes?: string[]
          updated_at?: string
          valor?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          destaque?: boolean
          duracao?: Database["public"]["Enums"]["plan_duration"]
          id?: string
          max_alunos_ativos?: number
          max_equipe_ativos?: number
          nome?: string
          permissoes?: string[]
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      team_member: {
        Row: {
          academy_id: string
          active: boolean
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["team_role"]
          updated_at: string
        }
        Insert: {
          academy_id: string
          active?: boolean
          created_at?: string
          email: string
          id?: string
          name: string
          role?: Database["public"]["Enums"]["team_role"]
          updated_at?: string
        }
        Update: {
          academy_id?: string
          active?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["team_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academy"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          academy_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          academy_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          academy_id?: string | null
          created_at?: string
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
      claim_super_admin_if_empty: { Args: never; Returns: boolean }
      create_academy_with_owner: {
        Args: {
          p_cor_primaria: string
          p_email: string
          p_name: string
          p_telefone: string
        }
        Returns: {
          business_hours: Json | null
          capacity_per_class: number | null
          cnpj: string | null
          cor_primaria: string | null
          created_at: string
          documento: string | null
          documento_tipo: string | null
          email: string | null
          endereco: Json | null
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          instagram: string | null
          logo_url: string | null
          name: string
          owner_cpf: string | null
          owner_email: string | null
          owner_nome: string | null
          owner_telefone: string | null
          plano: Database["public"]["Enums"]["academy_plan"]
          razao_social: string | null
          site: string | null
          slug: string | null
          status: Database["public"]["Enums"]["academy_status"]
          system_plan_id: string | null
          telefone: string | null
          tipo_empresa: Database["public"]["Enums"]["business_type"]
          trial_ate: string | null
          ultimo_acesso: string | null
          updated_at: string
          valor_mensal: number | null
          whatsapp: string | null
        }
        SetofOptions: {
          from: "*"
          to: "academy"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_academy_id: { Args: never; Returns: string }
      current_user_email: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      user_academy_ids: { Args: never; Returns: string[] }
      user_can_manage_academy: {
        Args: { _academy_id: string }
        Returns: boolean
      }
    }
    Enums: {
      academy_plan: "starter" | "pro" | "premium"
      academy_status: "active" | "trial" | "blocked"
      academy_user_role: "owner" | "admin" | "professor" | "recepcao"
      app_role:
        | "super_admin"
        | "admin"
        | "professor"
        | "recepcao"
        | "personal"
        | "demo"
      business_type:
        | "academia"
        | "estudio_personal"
        | "estudio_funcional"
        | "estudio_pilates"
        | "artes_marciais"
        | "box_crossfit"
      checkin_source: "catraca" | "manual" | "app"
      class_modality:
        | "Musculacao"
        | "Funcional"
        | "Pilates"
        | "Yoga"
        | "Crossfit"
        | "Aerobica"
        | "Outro"
      financial_status: "pendente" | "pago" | "atrasado" | "cancelado"
      financial_type: "receita" | "despesa"
      lead_status: "novo" | "contatado" | "convertido" | "perdido"
      lead_type: "aula_experimental" | "trial_7dias" | "interesse_plano"
      payment_status: "em_dia" | "atrasado" | "pendente"
      plan_duration: "recorrencia" | "trimestral" | "semestral" | "anual"
      student_gender: "M" | "F" | "Outro"
      student_status: "active" | "inactive" | "blocked" | "trial"
      team_role: "admin" | "professor" | "recepcao" | "personal"
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
    Enums: {
      academy_plan: ["starter", "pro", "premium"],
      academy_status: ["active", "trial", "blocked"],
      academy_user_role: ["owner", "admin", "professor", "recepcao"],
      app_role: [
        "super_admin",
        "admin",
        "professor",
        "recepcao",
        "personal",
        "demo",
      ],
      business_type: [
        "academia",
        "estudio_personal",
        "estudio_funcional",
        "estudio_pilates",
        "artes_marciais",
        "box_crossfit",
      ],
      checkin_source: ["catraca", "manual", "app"],
      class_modality: [
        "Musculacao",
        "Funcional",
        "Pilates",
        "Yoga",
        "Crossfit",
        "Aerobica",
        "Outro",
      ],
      financial_status: ["pendente", "pago", "atrasado", "cancelado"],
      financial_type: ["receita", "despesa"],
      lead_status: ["novo", "contatado", "convertido", "perdido"],
      lead_type: ["aula_experimental", "trial_7dias", "interesse_plano"],
      payment_status: ["em_dia", "atrasado", "pendente"],
      plan_duration: ["recorrencia", "trimestral", "semestral", "anual"],
      student_gender: ["M", "F", "Outro"],
      student_status: ["active", "inactive", "blocked", "trial"],
      team_role: ["admin", "professor", "recepcao", "personal"],
    },
  },
} as const
