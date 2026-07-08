-- Workspace qovluqları
create table if not exists gdrive_folders (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_by uuid references employees(id) on delete set null,
  created_at timestamptz default now()
);
alter table gdrive_docs add column if not exists folder_id uuid references gdrive_folders(id) on delete set null;
