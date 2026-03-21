export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          phone: string;
          name: string | null;
          state: string | null;
          district: string | null;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
        };
        Insert: {
          id?: string;
          phone: string;
          name?: string | null;
          state?: string | null;
          district?: string | null;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
        };
        Update: {
          name?: string | null;
          state?: string | null;
          district?: string | null;
          updated_at?: string;
          last_login_at?: string | null;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          guest_session: string | null;
          scheme_id: string | null;
          scheme_name: string | null;
          turn_count: number;
          verdict: "ELIGIBLE" | "NOT_ELIGIBLE" | "LIKELY_ELIGIBLE" | "NEED_MORE_INFO" | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          guest_session?: string | null;
          scheme_id?: string | null;
          scheme_name?: string | null;
          turn_count?: number;
          verdict?: "ELIGIBLE" | "NOT_ELIGIBLE" | "LIKELY_ELIGIBLE" | "NEED_MORE_INFO" | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          turn_count?: number;
          verdict?: "ELIGIBLE" | "NOT_ELIGIBLE" | "LIKELY_ELIGIBLE" | "NEED_MORE_INFO" | null;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          session_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          sequence_num: number;
          token_count: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          sequence_num?: number;
          token_count?: number | null;
          created_at?: string;
        };
        Update: never;
      };
      documents: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          original_filename: string;
          mime_type: string;
          size_bytes: number;
          char_count: number;
          chunk_count: number;
          status: "uploading" | "parsing" | "indexed" | "failed";
          is_preloaded: boolean;
          language: string;
          s3_key: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          original_filename: string;
          mime_type: string;
          size_bytes?: number;
          char_count?: number;
          chunk_count?: number;
          status?: "uploading" | "parsing" | "indexed" | "failed";
          is_preloaded?: boolean;
          language?: string;
          s3_key?: string | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          status?: "uploading" | "parsing" | "indexed" | "failed";
          char_count?: number;
          chunk_count?: number;
          s3_key?: string | null;
          error_message?: string | null;
        };
      };
      eligibility_results: {
        Row: {
          id: string;
          session_id: string;
          user_id: string | null;
          scheme_id: string;
          scheme_name: string | null;
          verdict: "ELIGIBLE" | "NOT_ELIGIBLE" | "LIKELY_ELIGIBLE" | "NEED_MORE_INFO";
          confidence_score: number | null;
          criteria_met: Json;
          documents_needed: Json;
          application_steps: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id?: string | null;
          scheme_id: string;
          scheme_name?: string | null;
          verdict: "ELIGIBLE" | "NOT_ELIGIBLE" | "LIKELY_ELIGIBLE" | "NEED_MORE_INFO";
          confidence_score?: number | null;
          criteria_met?: Json;
          documents_needed?: Json;
          application_steps?: Json;
          created_at?: string;
        };
        Update: never;
      };
      schemes: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: "housing" | "health" | "agriculture" | "finance" | "education" | "other";
          ministry: string | null;
          description: string | null;
          eligibility_summary: string | null;
          icon: string | null;
          official_url: string | null;
          is_active: boolean;
          last_policy_update: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          slug: string;
          category?: "housing" | "health" | "agriculture" | "finance" | "education" | "other";
          ministry?: string | null;
          description?: string | null;
          eligibility_summary?: string | null;
          icon?: string | null;
          official_url?: string | null;
          is_active?: boolean;
          last_policy_update?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          eligibility_summary?: string | null;
          is_active?: boolean;
        };
      };
      otp_requests: {
        Row: {
          id: string;
          phone: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          created_at?: string;
        };
        Update: never;
      };
    };
  };
}
