-- =====================================================================
-- パーソナルジム運営 統合管理アプリ - Supabase スキーマ
-- Supabase SQL Editor でこのファイルをそのまま実行してください。
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. 顧客テーブル
-- ---------------------------------------------------------------------
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  square_customer_id text unique,
  parent_name text,
  child_name text not null,
  birth_date date not null,
  first_session_date date,
  next_reservation_date date,
  concerns_and_goals text,
  ticket_total int default 0,
  ticket_used int default 0,
  memo text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 2. セッション記録テーブル
-- ---------------------------------------------------------------------
create table if not exists session_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  session_date timestamptz default now(),
  staff_name text not null check (staff_name in ('TAKA', 'NANA')),
  content text not null,
  homework_text text,
  homework_image_url text,
  memo text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 3. 測定詳細テーブル
-- ---------------------------------------------------------------------
create table if not exists measurements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  measurement_date date default current_date,
  weight numeric(5, 2),
  body_fat numeric(4, 1),
  muscle_mass numeric(5, 2),
  posture_image_1_url text,
  posture_image_2_url text,
  posture_image_3_url text,
  test_result_image_url text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 4. 売上管理テーブル
-- ---------------------------------------------------------------------
create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  square_payment_id text unique,
  client_id uuid references clients(id) on delete set null,
  amount numeric(10, 2) not null,
  payment_date timestamptz default now(),
  is_trial boolean default false,
  is_ticket_purchase boolean default false,
  campaign_name text
);

-- ---------------------------------------------------------------------
-- 5. 業務タスクテーブル
-- ---------------------------------------------------------------------
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  staff_name text not null check (staff_name in ('TAKA', 'NANA')),
  content text not null,
  memo text,
  due_date date,
  status text default 'unstarted' check (status in ('unstarted', 'in_progress', 'completed')),
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 6. 近隣情報テーブル
-- ---------------------------------------------------------------------
create table if not exists local_info (
  id uuid primary key default gen_random_uuid(),
  school_or_team_name text not null,
  district text check (district in ('板橋区', '北区', 'その他')),
  event_name text not null,
  url text,
  staff_name text check (staff_name in ('TAKA', 'NANA')),
  memo text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 7. キャンペーンテーブル（議事録から自動連携）
-- ---------------------------------------------------------------------
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  target_count int not null default 0,
  actual_count int not null default 0,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- 8. ミーティング議事録テーブル
-- ---------------------------------------------------------------------
create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  meeting_date timestamptz default now(),
  meeting_type text not null check (meeting_type in ('月度MT', '週MT', 'キャンペーン')),
  title text not null,
  content text,
  linked_campaign_id uuid references campaigns(id) on delete set null,
  created_at timestamptz default now()
);

-- 議事録内で作成したタスクを紐づけるための中間テーブル
create table if not exists meeting_tasks (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade,
  task_id uuid references tasks(id) on delete cascade
);

-- ---------------------------------------------------------------------
-- 9. 取引一覧テーブル（Square取引 + 個別追加データ）
-- ---------------------------------------------------------------------
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  staff_name text check (staff_name in ('TAKA', 'NANA')),
  memo text,
  source text default 'manual' check (source in ('square', 'manual')),
  square_reference_id text,
  created_at timestamptz default now()
);

-- =====================================================================
-- 自動計算ビュー：年齢、回数券残数、フォロー要否、3ヶ月測定月判定
-- =====================================================================
create or replace view view_client_details as
select
  c.*,
  extract(year from age(current_date, c.birth_date))::int as current_age,
  (c.ticket_total - c.ticket_used) as ticket_remaining,
  case when (c.ticket_total - c.ticket_used) = 1 then true else false end as is_ticket_last_one,
  case
    when c.next_reservation_date is null and c.first_session_date <= current_date - interval '1 month' then 'needs_follow_1month'
    when c.next_reservation_date is null and c.first_session_date <= current_date - interval '2 weeks' then 'needs_follow_2weeks'
    when c.next_reservation_date < current_date - interval '1 month' then 'needs_follow_1month'
    when c.next_reservation_date < current_date - interval '2 weeks' then 'needs_follow_2weeks'
    else 'ok'
  end as follow_status,
  case
    when c.first_session_date is not null
      and (extract(year from age(current_date, c.first_session_date))::int * 12
           + extract(month from age(current_date, c.first_session_date))::int) % 3 = 0
    then true
    else false
  end as is_measurement_month
from clients c;

-- 売上ダッシュボード用集計ビュー
create or replace view view_sales_summary as
select
  coalesce(sum(amount) filter (where payment_date::date = current_date), 0) as today_total,
  coalesce(sum(amount) filter (where date_trunc('month', payment_date) = date_trunc('month', current_date)), 0) as month_total,
  coalesce(sum(amount) filter (where date_trunc('year', payment_date) = date_trunc('year', current_date)), 0) as year_total
from sales;

-- =====================================================================
-- Realtime 有効化（Supabase Realtime で即時反映させる対象テーブル）
-- =====================================================================
alter publication supabase_realtime add table clients;
alter publication supabase_realtime add table session_logs;
alter publication supabase_realtime add table measurements;
alter publication supabase_realtime add table sales;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table local_info;
alter publication supabase_realtime add table campaigns;
alter publication supabase_realtime add table meetings;
alter publication supabase_realtime add table transactions;

-- =====================================================================
-- Row Level Security
-- 社内スタッフ専用の管理画面のため、認証済みユーザーには全操作を許可する
-- シンプルなポリシーにしています。要件に応じて絞り込んでください。
-- =====================================================================
alter table clients enable row level security;
alter table session_logs enable row level security;
alter table measurements enable row level security;
alter table sales enable row level security;
alter table tasks enable row level security;
alter table local_info enable row level security;
alter table campaigns enable row level security;
alter table meetings enable row level security;
alter table meeting_tasks enable row level security;
alter table transactions enable row level security;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'clients','session_logs','measurements','sales','tasks',
    'local_info','campaigns','meetings','meeting_tasks','transactions'
  ])
  loop
    execute format(
      'create policy "authenticated_full_access" on %I for all to authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;

-- Square Webhook はサービスロールキーで書き込むため service_role には
-- RLS が適用されません（デフォルト挙動）。

-- =====================================================================
-- Storage バケット（宿題写真・姿勢チェック写真・測定結果写真の保存先）
-- Supabase ダッシュボード > Storage からも作成できますが、SQLでも作成可能です。
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('gym-media', 'gym-media', true)
on conflict (id) do nothing;

create policy "authenticated_can_upload_gym_media"
on storage.objects for insert to authenticated
with check (bucket_id = 'gym-media');

create policy "public_can_read_gym_media"
on storage.objects for select
using (bucket_id = 'gym-media');
