-- ===== GDRTI FAZA 2 MİQRASİYA =====
-- Bütün bu skripti bir dəfəyə Supabase SQL Editor-da işə salın.

-- 1) Tapşırıqlara prioritet sütunu
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium'
  CHECK (priority IN ('high','medium','low'));

-- 2) Bildirişlər
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'task','letter','message','deadline','announcement','goal','survey'
  title text NOT NULL,
  body text,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_read ON notifications(user_id, is_read);

-- 3) Elanlar
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by uuid REFERENCES employees(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL,
  is_pinned boolean DEFAULT false,
  expires_at date,
  created_at timestamptz DEFAULT now()
);

-- 4) Hədəflər (OKR)
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by uuid REFERENCES employees(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES employees(id) ON DELETE CASCADE,
  sector_id uuid REFERENCES sectors(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_value numeric NOT NULL DEFAULT 100,
  current_value numeric DEFAULT 0,
  unit text DEFAULT '%',
  period text DEFAULT '2026-Q3',
  status text DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
  due_date date,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_goals_assigned ON goals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_goals_sector ON goals(sector_id);

-- 5) Sorğular
CREATE TABLE IF NOT EXISTS surveys (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by uuid REFERENCES employees(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  expires_at date,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS survey_questions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id uuid REFERENCES surveys(id) ON DELETE CASCADE,
  question text NOT NULL,
  type text NOT NULL CHECK (type IN ('text','rating','choice')),
  options jsonb,
  order_num int DEFAULT 0
);
CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id uuid REFERENCES surveys(id) ON DELETE CASCADE,
  respondent_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  answers jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(survey_id, respondent_id)
);

-- 6) Görüş protokolları
CREATE TABLE IF NOT EXISTS meeting_notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  calendar_event_id uuid REFERENCES calendar_events(id) ON DELETE SET NULL,
  created_by uuid REFERENCES employees(id) ON DELETE SET NULL,
  title text NOT NULL,
  attendees jsonb DEFAULT '[]',
  agenda text,
  decisions text,
  action_items jsonb DEFAULT '[]',
  next_meeting date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
