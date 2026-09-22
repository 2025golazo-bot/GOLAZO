alter table public.session_logs
add column if not exists exercises jsonb not null default '[]'::jsonb;

create table if not exists public.session_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'トレーニング',
  record_type text not null default 'weight_reps',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint session_templates_name_unique unique (name),
  constraint session_templates_record_type_check
    check (record_type in ('weight_reps', 'check'))
);

alter table public.session_templates enable row level security;

drop policy if exists "authenticated_full_access" on public.session_templates;

create policy "authenticated_full_access"
on public.session_templates
for all
to authenticated
using (true)
with check (true);
