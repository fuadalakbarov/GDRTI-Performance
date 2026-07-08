-- 1) Məktublara fayl əlavəsi (PDF/Word) — base64 kimi saxlanılır, ayrıca storage lazım deyil
alter table letters add column if not exists attachment_name text;
alter table letters add column if not exists attachment_type text;
alter table letters add column if not exists attachment_data text; -- base64

-- 2) Məktub altında şərhlər (online müzakirə)
create table if not exists letter_comments (
  id uuid primary key default uuid_generate_v4(),
  letter_id uuid references letters(id) on delete cascade,
  author_id uuid references employees(id) on delete set null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_letter_comments_letter on letter_comments(letter_id);

-- 3) Resurslar bölməsi (şablonlar, lazımi materiallar)
create table if not exists resources (
  id uuid primary key default uuid_generate_v4(),
  uploaded_by uuid references employees(id) on delete set null,
  title text not null,
  description text,
  category text default 'ümumi',
  file_name text not null,
  file_type text,
  file_data text not null, -- base64
  created_at timestamptz default now()
);
create index if not exists idx_resources_category on resources(category);
