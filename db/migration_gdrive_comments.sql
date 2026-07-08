-- Google Drive sənəd şərhləri
create table if not exists gdrive_comments (
  id uuid primary key default uuid_generate_v4(),
  doc_id uuid references gdrive_docs(id) on delete cascade,
  author_id uuid references employees(id) on delete set null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_gdrive_comments_doc on gdrive_comments(doc_id);
