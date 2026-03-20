-- ============================================================
-- NailKarte — Supabase テーブル定義 + RLS
-- Supabase の SQL エディタで実行してください
-- ============================================================

-- ----------------------------------------------------------------
-- 拡張機能
-- ----------------------------------------------------------------
create extension if not exists "pg_cron";
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------
-- owners テーブル
-- ----------------------------------------------------------------
create table if not exists owners (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  name          text not null,
  stripe_customer_id        text,
  stripe_subscription_id    text,
  subscription_status       text check (subscription_status in ('trialing','active','past_due','canceled','unpaid')),
  trial_end                 timestamptz,
  line_channel_access_token text,
  line_channel_secret       text,
  google_access_token       text,
  google_refresh_token      text,
  google_token_expiry       timestamptz,
  google_calendar_id        text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table owners enable row level security;

create policy "owners: select own" on owners for select using (auth.uid() = id);
create policy "owners: insert own" on owners for insert with check (auth.uid() = id);
create policy "owners: update own" on owners for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "owners: delete own" on owners for delete using (auth.uid() = id);

-- ----------------------------------------------------------------
-- customers テーブル
-- ----------------------------------------------------------------
create table if not exists customers (
  id           uuid primary key default uuid_generate_v4(),
  owner_id     uuid not null references owners(id) on delete cascade,
  name         text not null,
  phone        text,
  nail_shape   text check (nail_shape in ('round','square','oval','point','squareoff')),
  nail_length  text check (nail_length in ('short','medium','long')),
  allergy_info text,
  line_user_id text,
  memo         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists customers_owner_id_idx on customers(owner_id);

alter table customers enable row level security;

create policy "customers: select own" on customers for select using (auth.uid() = owner_id);
create policy "customers: insert own" on customers for insert with check (auth.uid() = owner_id);
create policy "customers: update own" on customers for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "customers: delete own" on customers for delete using (auth.uid() = owner_id);

-- ----------------------------------------------------------------
-- treatments テーブル（カルテ）
-- ----------------------------------------------------------------
create table if not exists treatments (
  id               uuid primary key default uuid_generate_v4(),
  owner_id         uuid not null references owners(id) on delete cascade,
  customer_id      uuid not null references customers(id) on delete cascade,
  treatment_date   date not null,
  menu_name        text not null,
  price            integer not null default 0,
  color_memo       text,
  design_memo      text,
  photo_urls       text[] not null default '{}',
  next_visit_date  date,
  is_quick_entry   boolean not null default false,
  google_event_id  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists treatments_owner_id_idx on treatments(owner_id);
create index if not exists treatments_customer_id_idx on treatments(customer_id);
create index if not exists treatments_treatment_date_idx on treatments(treatment_date);

alter table treatments enable row level security;

create policy "treatments: select own" on treatments for select using (auth.uid() = owner_id);
create policy "treatments: insert own" on treatments for insert with check (auth.uid() = owner_id);
create policy "treatments: update own" on treatments for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "treatments: delete own" on treatments for delete using (auth.uid() = owner_id);

-- ----------------------------------------------------------------
-- menu_presets テーブル
-- ----------------------------------------------------------------
create table if not exists menu_presets (
  id         uuid primary key default uuid_generate_v4(),
  owner_id   uuid not null references owners(id) on delete cascade,
  name       text not null,
  price      integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_presets_owner_id_idx on menu_presets(owner_id);

alter table menu_presets enable row level security;

create policy "menu_presets: select own" on menu_presets for select using (auth.uid() = owner_id);
create policy "menu_presets: insert own" on menu_presets for insert with check (auth.uid() = owner_id);
create policy "menu_presets: update own" on menu_presets for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "menu_presets: delete own" on menu_presets for delete using (auth.uid() = owner_id);

-- ----------------------------------------------------------------
-- updated_at 自動更新トリガー
-- ----------------------------------------------------------------
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger owners_updated_at before update on owners for each row execute function update_updated_at();
create trigger customers_updated_at before update on customers for each row execute function update_updated_at();
create trigger treatments_updated_at before update on treatments for each row execute function update_updated_at();
create trigger menu_presets_updated_at before update on menu_presets for each row execute function update_updated_at();

-- ----------------------------------------------------------------
-- Storage バケット（Supabase ダッシュボードで作成 or SQL）
-- ----------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('treatment-photos', 'treatment-photos', false)
on conflict (id) do nothing;

-- Storage RLS
create policy "treatment-photos: owner upload" on storage.objects
  for insert with check (
    bucket_id = 'treatment-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "treatment-photos: owner select" on storage.objects
  for select using (
    bucket_id = 'treatment-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "treatment-photos: owner delete" on storage.objects
  for delete using (
    bucket_id = 'treatment-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
