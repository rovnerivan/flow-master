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
      certifications: {
        Row: {
          certificate_url: string | null
          certified_at: string
          id: string
          process_id: string
          team_id: string
          user_id: string
        }
        Insert: {
          certificate_url?: string | null
          certified_at?: string
          id?: string
          process_id: string
          team_id: string
          user_id: string
        }
        Update: {
          certificate_url?: string | null
          certified_at?: string
          id?: string
          process_id?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certifications_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certifications_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_completions: {
        Row: {
          checklist_item_id: string
          completed_at: string
          completion_date: string
          id: string
          team_id: string
          user_id: string
        }
        Insert: {
          checklist_item_id: string
          completed_at?: string
          completion_date?: string
          id?: string
          team_id: string
          user_id: string
        }
        Update: {
          checklist_item_id?: string
          completed_at?: string
          completion_date?: string
          id?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_completions_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_completions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          checklist_id: string
          created_at: string
          id: string
          linked_process_id: string | null
          order_index: number | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          team_id: string
          title: string
        }
        Insert: {
          checklist_id: string
          created_at?: string
          id?: string
          linked_process_id?: string | null
          order_index?: number | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          team_id: string
          title: string
        }
        Update: {
          checklist_id?: string
          created_at?: string
          id?: string
          linked_process_id?: string | null
          order_index?: number | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          team_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "daily_checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_linked_process_id_fkey"
            columns: ["linked_process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      culture_content: {
        Row: {
          category: string
          content: string
          content_type: string
          created_at: string
          creator_id: string
          id: string
          include_indirect_subordinates: boolean | null
          is_active: boolean | null
          target_branch_user_ids: string[] | null
          target_levels: Database["public"]["Enums"]["hierarchy_level"][] | null
          target_type: Database["public"]["Enums"]["culture_target_type"]
          target_user_ids: string[] | null
          team_id: string
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          category?: string
          content: string
          content_type: string
          created_at?: string
          creator_id: string
          id?: string
          include_indirect_subordinates?: boolean | null
          is_active?: boolean | null
          target_branch_user_ids?: string[] | null
          target_levels?:
            | Database["public"]["Enums"]["hierarchy_level"][]
            | null
          target_type?: Database["public"]["Enums"]["culture_target_type"]
          target_user_ids?: string[] | null
          team_id: string
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          content_type?: string
          created_at?: string
          creator_id?: string
          id?: string
          include_indirect_subordinates?: boolean | null
          is_active?: boolean | null
          target_branch_user_ids?: string[] | null
          target_levels?:
            | Database["public"]["Enums"]["hierarchy_level"][]
            | null
          target_type?: Database["public"]["Enums"]["culture_target_type"]
          target_user_ids?: string[] | null
          team_id?: string
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "culture_content_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_checklists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_checklists_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          description: string | null
          error_type: string | null
          estimated_loss_value: number | null
          id: string
          process_id: string | null
          reported_at: string
          team_id: string
          user_id: string | null
        }
        Insert: {
          description?: string | null
          error_type?: string | null
          estimated_loss_value?: number | null
          id?: string
          process_id?: string | null
          reported_at?: string
          team_id: string
          user_id?: string | null
        }
        Update: {
          description?: string | null
          error_type?: string | null
          estimated_loss_value?: number | null
          id?: string
          process_id?: string | null
          reported_at?: string
          team_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_logs_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "error_logs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      micro_learnings: {
        Row: {
          category: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          is_active: boolean | null
          scheduled_date: string | null
          script_text: string | null
          team_id: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          scheduled_date?: string | null
          script_text?: string | null
          team_id?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          scheduled_date?: string | null
          script_text?: string | null
          team_id?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "micro_learnings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      process_assignments: {
        Row: {
          assigned_at: string
          assigned_by_id: string | null
          completed_at: string | null
          due_date: string | null
          id: string
          process_id: string
          status: Database["public"]["Enums"]["assignment_status"] | null
          team_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by_id?: string | null
          completed_at?: string | null
          due_date?: string | null
          id?: string
          process_id: string
          status?: Database["public"]["Enums"]["assignment_status"] | null
          team_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by_id?: string | null
          completed_at?: string | null
          due_date?: string | null
          id?: string
          process_id?: string
          status?: Database["public"]["Enums"]["assignment_status"] | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "process_assignments_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "process_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      process_steps: {
        Row: {
          content_type: Database["public"]["Enums"]["content_type"] | null
          created_at: string
          duration_seconds: number | null
          id: string
          process_id: string
          script_text: string | null
          step_number: number
          team_id: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          process_id: string
          script_text?: string | null
          step_number: number
          team_id: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          process_id?: string
          script_text?: string | null
          step_number?: number
          team_id?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "process_steps_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "process_steps_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      processes: {
        Row: {
          benchmark_time_min: number | null
          created_at: string
          creator_id: string | null
          current_version: string | null
          description: string | null
          id: string
          is_published: boolean | null
          name: string
          team_id: string
          updated_at: string
        }
        Insert: {
          benchmark_time_min?: number | null
          created_at?: string
          creator_id?: string | null
          current_version?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          team_id: string
          updated_at?: string
        }
        Update: {
          benchmark_time_min?: number | null
          created_at?: string
          creator_id?: string | null
          current_version?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "processes_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          hire_date: string | null
          id: string
          job_title: string | null
          reports_to_id: string | null
          team_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          hire_date?: string | null
          id: string
          job_title?: string | null
          reports_to_id?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          hire_date?: string | null
          id?: string
          job_title?: string | null
          reports_to_id?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_reports_to_id_fkey"
            columns: ["reports_to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      step_completions: {
        Row: {
          completed_at: string
          id: string
          process_id: string
          step_id: string
          team_id: string
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          process_id: string
          step_id: string
          team_id: string
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          process_id?: string
          step_id?: string
          team_id?: string
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "step_completions_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_completions_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "process_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_completions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      step_feedback: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_confused: boolean | null
          process_id: string
          step_id: string
          team_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_confused?: boolean | null
          process_id: string
          step_id: string
          team_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_confused?: boolean | null
          process_id?: string
          step_id?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "step_feedback_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_feedback_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "process_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_feedback_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignees: {
        Row: {
          assignment_id: string
          completed_at: string | null
          id: string
          started_at: string | null
          status: string | null
          team_id: string
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          assignment_id: string
          completed_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          team_id: string
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          assignment_id?: string
          completed_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          team_id?: string
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignees_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "task_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignees_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignments: {
        Row: {
          assigned_by: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          due_date: string | null
          due_time: string | null
          id: string
          instance_label: string | null
          is_shared: boolean | null
          notes: string | null
          status: string | null
          task_id: string
          team_id: string
        }
        Insert: {
          assigned_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          instance_label?: string | null
          is_shared?: boolean | null
          notes?: string | null
          status?: string | null
          task_id: string
          team_id: string
        }
        Update: {
          assigned_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          instance_label?: string | null
          is_shared?: boolean | null
          notes?: string | null
          status?: string | null
          task_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          estimated_duration_min: number | null
          frequency: string | null
          id: string
          is_active: boolean | null
          linked_process_id: string | null
          name: string
          team_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_duration_min?: number | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          linked_process_id?: string | null
          name: string
          team_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_duration_min?: number | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          linked_process_id?: string | null
          name?: string
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_linked_process_id_fkey"
            columns: ["linked_process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_feed: {
        Row: {
          content_text: string | null
          content_type: Database["public"]["Enums"]["feed_content_type"] | null
          created_at: string
          id: string
          image_url: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          content_text?: string | null
          content_type?: Database["public"]["Enums"]["feed_content_type"] | null
          created_at?: string
          id?: string
          image_url?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          content_text?: string | null
          content_type?: Database["public"]["Enums"]["feed_content_type"] | null
          created_at?: string
          id?: string
          image_url?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_feed_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          is_active: boolean | null
          name: string
          subscription_plan: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code?: string
          is_active?: boolean | null
          name: string
          subscription_plan?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          is_active?: boolean | null
          name?: string
          subscription_plan?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      can_view_culture_content: {
        Args: { content_id: string; viewer_id: string }
        Returns: boolean
      }
      get_user_hierarchy_level: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["hierarchy_level"]
      }
      get_user_team_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_direct_subordinate_of: {
        Args: { subordinate_id: string; superior_id: string }
        Returns: boolean
      }
      is_subordinate_of: {
        Args: { subordinate_id: string; superior_id: string }
        Returns: boolean
      }
      is_team_admin_or_supervisor: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "business_admin" | "supervisor" | "employee"
      assignment_status: "pending" | "in_progress" | "completed"
      content_type: "video" | "text" | "checklist"
      culture_target_type:
        | "all_organization"
        | "direct_reports"
        | "all_subordinates"
        | "specific_users"
        | "specific_levels"
        | "specific_branches"
      feed_content_type: "tip" | "achievement" | "certification"
      hierarchy_level: "owner" | "admin" | "supervisor" | "employee"
      priority_level: "high" | "medium" | "low"
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
      app_role: ["super_admin", "business_admin", "supervisor", "employee"],
      assignment_status: ["pending", "in_progress", "completed"],
      content_type: ["video", "text", "checklist"],
      culture_target_type: [
        "all_organization",
        "direct_reports",
        "all_subordinates",
        "specific_users",
        "specific_levels",
        "specific_branches",
      ],
      feed_content_type: ["tip", "achievement", "certification"],
      hierarchy_level: ["owner", "admin", "supervisor", "employee"],
      priority_level: ["high", "medium", "low"],
    },
  },
} as const
