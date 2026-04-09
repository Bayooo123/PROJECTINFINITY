-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Topics (Categorization)
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  parent_topic_id UUID REFERENCES topics(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Principles (The Abstract Rules)
CREATE TABLE IF NOT EXISTS principles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id),
  content TEXT NOT NULL, -- "Duty of care is owed to neighbours"
  authority_ref TEXT,    -- "Donoghue v Stevenson"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Cases (The Concrete Examples)
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  summary TEXT,
  year INT,
  principle_id UUID REFERENCES principles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Questions (The Retrieval Mechanism)
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  principle_id UUID REFERENCES principles(id),
  case_id UUID REFERENCES cases(id),
  stem TEXT NOT NULL,       -- The question text
  explanation TEXT,         -- LOCKED CONTENT
  type VARCHAR(50) NOT NULL CHECK (type IN ('MCQ', 'ISSUE', 'MATCH')),
  options JSONB DEFAULT '[]', -- JSON array of options: [{"id": "...", "text": "...", "is_correct": true}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Attempts (The Audit Trail)
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- References auth.users or local users table
  question_id UUID REFERENCES questions(id),
  selected_option_id TEXT, -- ID from the options JSON
  is_correct BOOLEAN NOT NULL,
  duration_ms INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_principle ON questions(principle_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id);
