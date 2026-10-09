CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  url TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  content TEXT,
  domain TEXT,
  crawled_at INTEGER,
  rank_score REAL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_pages_domain ON pages(domain);
CREATE INDEX IF NOT EXISTS idx_pages_rank ON pages(rank_score DESC);
