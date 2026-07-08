-- Sənəd paylaşımı (kim ilə paylaşılıb)
create table if not exists gdrive_doc_shares (
  id uuid primary key default uuid_generate_v4(),
  doc_id uuid references gdrive_docs(id) on delete cascade,
  shared_with uuid references employees(id) on delete cascade,
  shared_by uuid references employees(id) on delete set null,
  created_at timestamptz default now(),
  unique(doc_id, shared_with)
);

-- Sənəd şərhləri
create table if not exists gdrive_doc_comments (
  id uuid primary key default uuid_generate_v4(),
  doc_id uuid references gdrive_docs(id) on delete cascade,
  author_id uuid references employees(id) on delete set null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_gdrive_comments_doc on gdrive_doc_comments(doc_id);
