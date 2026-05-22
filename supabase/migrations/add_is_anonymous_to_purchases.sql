-- Run in Supabase SQL editor: adds anonymous flag to purchase records
alter table public.purchases
  add column is_anonymous boolean not null default false;
