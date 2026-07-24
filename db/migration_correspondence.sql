CREATE TABLE IF NOT EXISTS correspondence (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  source text DEFAULT 'MÜTDA',
  sender_email text,
  reg_number text,
  subject text NOT NULL,
  body text,
  received_at timestamptz DEFAULT now(),
  status text DEFAULT 'yeni'
    CHECK (status IN ('yeni','derkenar','sektorda','iscide','cavab','tamamlandi')),
  resolution text,
  resolution_by uuid REFERENCES employees(id) ON DELETE SET NULL,
  resolution_at timestamptz,
  coordinator_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  sector_id uuid REFERENCES sectors(id) ON DELETE SET NULL,
  assigned_employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  due_date date,
  reply_body text,
  reply_by uuid REFERENCES employees(id) ON DELETE SET NULL,
  reply_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_corr_status ON correspondence(status);
CREATE INDEX IF NOT EXISTS idx_corr_sector ON correspondence(sector_id);
CREATE INDEX IF NOT EXISTS idx_corr_emp ON correspondence(assigned_employee_id);
