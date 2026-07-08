-- Müzakirə Lövhəsi
CREATE TABLE IF NOT EXISTS wb_boards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  created_by uuid REFERENCES employees(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wb_cards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id uuid REFERENCES wb_boards(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text DEFAULT '',
  pos_x int DEFAULT 80,
  pos_y int DEFAULT 80,
  color text DEFAULT '#6366f1',
  created_by uuid REFERENCES employees(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wb_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id uuid REFERENCES wb_cards(id) ON DELETE CASCADE,
  author_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wb_cards_board ON wb_cards(board_id);
CREATE INDEX IF NOT EXISTS idx_wb_comments_card ON wb_comments(card_id);
