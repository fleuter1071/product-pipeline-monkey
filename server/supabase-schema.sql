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
  created_at date not null default current_date,
  updated_at date not null default current_date
);
