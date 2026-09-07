export type StaffName = "TAKA" | "NANA";
export type TaskStatus = "unstarted" | "in_progress" | "completed";
export type District = "板橋区" | "北区" | "その他";
export type MeetingType = "月度MT" | "週MT" | "キャンペーン";
export type FollowStatus = "needs_follow_1month" | "needs_follow_2weeks" | "ok";

export interface Client {
  id: string;
  square_customer_id: string | null;
  parent_name: string | null;
  child_name: string;
  birth_date: string;
  first_session_date: string | null;
  next_reservation_date: string | null;
  concerns_and_goals: string | null;
  ticket_total: number;
  ticket_used: number;
  memo: string | null;
  created_at: string;
}

export interface ClientDetails extends Client {
  current_age: number;
  ticket_remaining: number;
  is_ticket_last_one: boolean;
  follow_status: FollowStatus;
  is_measurement_month: boolean;
}

export interface SessionLog {
  id: string;
  client_id: string;
  session_date: string;
  staff_name: StaffName;
  content: string;
  homework_text: string | null;
  homework_image_url: string | null;
  memo: string | null;
  created_at: string;
}

export interface Measurement {
  id: string;
  client_id: string;
  measurement_date: string;
  weight: number | null;
  body_fat: number | null;
  muscle_mass: number | null;
  posture_image_1_url: string | null;
  posture_image_2_url: string | null;
  posture_image_3_url: string | null;
  test_result_image_url: string | null;
  created_at: string;
}

export interface Sale {
  id: string;
  square_payment_id: string | null;
  client_id: string | null;
  amount: number;
  payment_date: string;
  is_trial: boolean;
  is_ticket_purchase: boolean;
  campaign_name: string | null;
}

export interface Task {
  id: string;
  staff_name: StaffName;
  content: string;
  memo: string | null;
  due_date: string | null;
  status: TaskStatus;
  created_at: string;
}

export interface LocalInfo {
  id: string;
  school_or_team_name: string;
  district: District | null;
  event_name: string;
  url: string | null;
  staff_name: StaffName | null;
  memo: string | null;
  created_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  target_count: number;
  actual_count: number;
  created_at: string;
}

export interface Meeting {
  id: string;
  meeting_date: string;
  meeting_type: MeetingType;
  title: string;
  content: string | null;
  linked_campaign_id: string | null;
  created_at: string;
}

export interface TransactionRow {
  id: string;
  name: string;
  url: string | null;
  staff_name: StaffName | null;
  memo: string | null;
  source: "square" | "manual";
  square_reference_id: string | null;
  created_at: string;
}

export interface SalesSummary {
  today_total: number;
  month_total: number;
  year_total: number;
}

// Supabase JS 用の簡易 Database 型（テーブル単位の詳細な Row/Insert/Update までは
// 定義していません。厳密な型付けが必要な場合は `supabase gen types` を利用してください）
export type Database = any;
