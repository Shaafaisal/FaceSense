-- FaceSense persistence. Run in the Supabase SQL editor.
-- Photos are never stored in Postgres. Storage uploads happen only when store_for_training is true.

create extension if not exists "pgcrypto";

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  mode text not null check (mode in ('face', 'skin', 'all')),
  consent boolean not null default false,
  store_for_training boolean not null default false,
  age_estimate double precision,
  age_range_low integer,
  age_range_high integer,
  gender_label text check (gender_label in ('male', 'female')),
  gender_confidence double precision,
  emotion_label text,
  emotion_confidence double precision,
  emotion_probs jsonb,
  skin jsonb,
  bbox jsonb,
  timing jsonb,
  image_path text,
  source text not null check (source in ('mock', 'flask'))
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  prediction_id uuid not null unique references public.analyses (id) on delete cascade,
  emotion_correction text,
  helpful boolean,
  created_at timestamptz not null default now()
);

create index if not exists feedback_prediction_id_idx on public.feedback (prediction_id);

alter table public.analyses enable row level security;
alter table public.feedback enable row level security;

-- No anon/authenticated policies: only the service role (used in Next.js route handlers) can read/write.

insert into storage.buckets (id, name, public)
values ('training-images', 'training-images', false)
on conflict (id) do nothing;
