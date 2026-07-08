-- ===== QİYMƏTLƏNDİRMƏ SİSTEMİ (Nazirlər Kabineti Qərar №89, 2021) =====

-- Əsas qiymətləndirmə cədvəli
CREATE TABLE IF NOT EXISTS evaluations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  evaluator_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  year int NOT NULL DEFAULT EXTRACT(YEAR FROM now())::int,
  status text DEFAULT 'draft' CHECK (status IN ('draft','in_progress','completed','appealed')),

  -- Rüblük qeydlər (2.1, 3.2)
  q1_notes text, -- Mart
  q2_notes text, -- İyun
  q3_notes text, -- Sentyabr
  q4_notes text, -- Dekabr

  -- Tapşırıqlar üzrə ümumi qiymət (T) — avtomatik hesablanır
  task_score numeric(5,2) DEFAULT 0,

  -- Meyarlar üzrə ümumi qiymət (M) — avtomatik hesablanır
  criteria_score numeric(5,2) DEFAULT 0,

  -- Əmək intizamı (ÄI) — 2,3,4,5
  discipline_grade int CHECK (discipline_grade BETWEEN 2 AND 5),
  discipline_notes text,

  -- Yekun qiymət: YQ = T*50% + M*40% + ÄI*10%
  final_score numeric(5,2) DEFAULT 0,

  -- Müsahibə
  interview_notes text,
  employee_comments text,
  employee_agrees boolean,

  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(employee_id, year)
);

-- Tapşırıqlar (hər qiymətləndirmə üçün) — 4.3, 4.5, 4.6
CREATE TABLE IF NOT EXISTS evaluation_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id uuid REFERENCES evaluations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  importance_pct numeric(5,2) NOT NULL, -- Mühümlük dərəcəsi %
  deadline date,
  grade int CHECK (grade BETWEEN 2 AND 5), -- 2=Qeyri-kafi, 3=Kafi, 4=Yaxşı, 5=Əla
  grade_notes text,
  order_num int DEFAULT 0
);

-- Meyarlar (hər qiymətləndirmə üçün) — 4.7, 4.8, 4.9, 4.12
CREATE TABLE IF NOT EXISTS evaluation_criteria (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id uuid REFERENCES evaluations(id) ON DELETE CASCADE,
  name text NOT NULL,
  importance_pct numeric(5,2) NOT NULL, -- Mühümlük dərəcəsi %
  grade int CHECK (grade BETWEEN 2 AND 5),
  grade_notes text,
  is_manager_criterion boolean DEFAULT false, -- 4.8 meyarları
  order_num int DEFAULT 0
);

-- İndekslər
CREATE INDEX IF NOT EXISTS idx_eval_emp ON evaluations(employee_id);
CREATE INDEX IF NOT EXISTS idx_eval_year ON evaluations(year);
CREATE INDEX IF NOT EXISTS idx_eval_tasks ON evaluation_tasks(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_eval_crit ON evaluation_criteria(evaluation_id);
