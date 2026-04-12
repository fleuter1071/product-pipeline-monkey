create extension if not exists pgcrypto;

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  submitter_name text not null,
  submitter_priority text not null,
  reach numeric,
  impact numeric,
  confidence numeric,
  effort numeric,
  rice_score numeric,
  notes text default ''::text,
  is_archived boolean not null default false,
  status text not null default 'submitted',
  placement text not null default 'unassigned',
  delivery_owner text default ''::text,
  delivery_status text not null default 'clarifying',
  target_date date,
  current_blocker text default ''::text,
  main_risk text default ''::text,
  open_decision text default ''::text,
  latest_update text default ''::text,
  launch_qa_complete boolean not null default false,
  launch_stakeholders_informed boolean not null default false,
  launch_date_confirmed boolean not null default false,
  launch_monitoring_ready boolean not null default false,
  created_at date not null default current_date,
  updated_at date not null default current_date
);

alter table public.requests add column if not exists delivery_owner text default ''::text;
alter table public.requests add column if not exists delivery_status text not null default 'clarifying';
alter table public.requests add column if not exists target_date date;
alter table public.requests add column if not exists current_blocker text default ''::text;
alter table public.requests add column if not exists main_risk text default ''::text;
alter table public.requests add column if not exists open_decision text default ''::text;
alter table public.requests add column if not exists latest_update text default ''::text;
alter table public.requests add column if not exists launch_qa_complete boolean not null default false;
alter table public.requests add column if not exists launch_stakeholders_informed boolean not null default false;
alter table public.requests add column if not exists launch_date_confirmed boolean not null default false;
alter table public.requests add column if not exists launch_monitoring_ready boolean not null default false;
