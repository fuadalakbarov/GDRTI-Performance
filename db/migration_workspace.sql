-- ORTAQ SƏNƏDLƏR (workspace) — onlayn redaktə, hamı görür
create table if not exists workspace_docs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text default '',
  created_by uuid references employees(id) on delete set null,
  updated_by uuid references employees(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
