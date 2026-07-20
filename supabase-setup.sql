-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

CREATE TABLE IF NOT EXISTS daily_sales (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  items_json JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE daily_sales DISABLE ROW LEVEL SECURITY;
GRANT ALL ON daily_sales TO anon;
GRANT USAGE ON SEQUENCE daily_sales_id_seq TO anon;-- Admin table for password (hidden from source code)
CREATE TABLE IF NOT EXISTS admins (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
GRANT ALL ON admins TO anon;

-- Insert admin user with SHA-256 hashed password (plain: "password123")
-- Hash: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
INSERT INTO admins (username, password_hash) VALUES ('admin', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f')
ON CONFLICT (username) DO NOTHING;
