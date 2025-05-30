-- supabase/migrations/20250204120000_create_chatgpt_interactions.sql

-- Enable uuid generation extension if not already enabled
create extension if not exists "pgcrypto";

-- ============================================================
-- Table: chatgpt_interactions
-- Stores ChatGPT prompt and response data linked to a dream entry.
-- ============================================================
create table if not exists chatgpt_interactions (
  id uuid primary key default gen_random_uuid(),
  dream_entry_id uuid references dream_entries(id) on delete cascade,
  prompt text not null,
  response text not null,
  model text,
  temperature numeric,
  created_at timestamp default now()
);