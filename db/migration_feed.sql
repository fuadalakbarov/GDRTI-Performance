-- İş Lenti (Social Feed)
CREATE TABLE IF NOT EXISTS feed_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feed_reactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('like','love','idea','clap')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS feed_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES feed_posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fp_created ON feed_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fc_post ON feed_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_fr_post ON feed_reactions(post_id);
