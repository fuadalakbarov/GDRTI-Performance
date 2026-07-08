-- Mövcud Supabase-ə əlavə: rəsmi məktublar cədvəli
create table if not exists letters (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references employees(id) on delete set null,
  recipient_id uuid references employees(id) on delete cascade,
  sector_id uuid references sectors(id) on delete cascade,
  subject text not null,
  body text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_letters_recipient on letters(recipient_id);
create index if not exists idx_letters_sector on letters(sector_id);
