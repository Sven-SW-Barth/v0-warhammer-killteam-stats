-- Create bug_reports table
CREATE TABLE IF NOT EXISTS bug_reports (
  id SERIAL PRIMARY KEY,
  reporter_name TEXT NOT NULL,
  reporter_email TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  page_url TEXT,
  browser_info TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'wont_fix')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at DESC);
