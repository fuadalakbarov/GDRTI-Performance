-- Google Drive sənədləri (link əsaslı inteqrasiya)
create table if not exists gdrive_docs (
  id uuid primary key default uuid_generate_v4(),
  added_by uuid references employees(id) on delete set null,
  title text not null,
  url text not null,
  doc_type text default 'doc' check (doc_type in ('doc','sheet','slide','form','other')),
  description text,
  created_at timestamptz default now()
);
create index if not exists idx_gdrive_docs_type on gdrive_docs(doc_type);
