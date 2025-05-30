-- supabase/migrations/20250204054754_create_tables.sql

-- Enable uuid generation extension if not already enabled
create extension if not exists "pgcrypto";

-- ============================================================
-- Table: dream_entries
-- Stores the core information for each dream journal entry.
-- ============================================================
create table if not exists dream_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  original_text text not null,
  title text,
  dream_summary text,
  analysis_summary text,
  topic_sentence text,
  gematria_interpretation text,
  color_symbolism text,
  image_url text,
  tags text[],
  bible_refs text[],
  created_at timestamp default now()
);

-- ============================================================
-- Table: bible_citations
-- Stores detailed Bible citation data for each dream entry.
-- ============================================================
create table if not exists bible_citations (
  id uuid primary key default gen_random_uuid(),
  dream_entry_id uuid references dream_entries(id) on delete cascade,
  bible_book text,
  chapter int,
  verse int,
  full_text text,
  citation_order int default 1,
  created_at timestamp default now()
);

-- ============================================================
-- Table: profile
-- Stores profile information for each user.
-- ============================================================
create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid UNIQUE references auth.users(id) on delete cascade,
  language text,
  bible_version text,
  created_at timestamp default now()
);

-- ============================================================
-- Table: subscriptions
-- Stores subscription/payment-related details for each user.
-- ============================================================
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  stripe_subscription_id text,
  status text,           -- e.g., "active", "canceled", "past_due"
  plan text,             -- e.g., "basic", "premium"
  credits int default 0,
  trial_end timestamp,
  current_period_end timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- ============================================================
-- Table: payments
-- Keeps a record of individual payment transactions.
-- ============================================================
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  stripe_payment_id text,
  amount numeric,
  currency text,
  status text,           -- e.g., "succeeded", "failed"
  created_at timestamp default now()
);