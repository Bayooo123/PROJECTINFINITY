# Supabase RAG (Vector Search) Setup

## SQL Scripts for Study Room AI

Run these scripts in your Supabase SQL Editor to enable the "Study Room" to search through course materials.

### 1. Enable Vector Extension

This extension allows Supabase to perform mathematical similarity searches on text.

```sql
-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;
```

### 2. Create Course Materials Table

This table will store the text content of your laws, cases, and notes, along with their vector representations.

```sql
create table course_materials (
  id uuid default uuid_generate_v4() primary key,
  course text not null,           -- e.g., "Constitutional Law"
  topic text not null,            -- e.g., "Separation of Powers"
  content text not null,          -- The actual text chunk
  embedding vector(768),          -- 768 dimensions for Gemini embeddings
  metadata jsonb default '{}'::jsonb, -- Extra info (page number, source file, etc.)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table course_materials enable row level security;
# Supabase RAG (Vector Search) Setup

## SQL Scripts for Study Room AI

Run these scripts in your Supabase SQL Editor to enable the "Study Room" to search through course materials.

### 1. Enable Vector Extension

This extension allows Supabase to perform mathematical similarity searches on text.

```sql
-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;
```

### 2. Create Course Materials Table

This table will store the text content of your laws, cases, and notes, along with their vector representations.

```sql
create table course_materials (
  id uuid default uuid_generate_v4() primary key,
  course text not null,           -- e.g., "Constitutional Law"
  topic text not null,            -- e.g., "Separation of Powers"
  content text not null,          -- The actual text chunk
  embedding vector(768),          -- 768 dimensions for Gemini embeddings
  metadata jsonb default '{}'::jsonb, -- Extra info (page number, source file, etc.)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table course_materials enable row level security;

-- Policy: Everyone can read materials (for the AI to search)
create policy "Everyone can read course materials"
  on course_materials for select
  using (true);

-- Policy: Only authenticated users can insert (or restrict to admins later)
create policy "Authenticated users can insert materials"
  on course_materials for insert
  with check (auth.role() = 'authenticated');

### 3. Create Past Questions Table

This table stores past exam questions to enable the "Background Search" feature.

```sql
create table past_questions (
  id uuid default uuid_generate_v4() primary key,
  course text not null,           -- e.g., "Constitutional Law"
  year text,                      -- e.g., "2023"
  question_text text not null,    -- The actual question
  embedding vector(768),          -- Vector representation
  metadata jsonb default '{}'::jsonb, -- Extra info (Section A/B, marks, etc.)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table past_questions enable row level security;

-- Policy: Everyone can read
create policy "Everyone can read past questions"
  on past_questions for select
  using (true);

-- Policy: Only authenticated users can insert
create policy "Authenticated users can insert past questions"
  on past_questions for insert
  with check (auth.role() = 'authenticated');
```

### 4. Create Search Functions

We need two search functions: one for materials and one for past questions.

**Function 1: Search Course Materials**
```sql
create or replace function match_course_materials (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_course text default null
)
returns table (
  id uuid,
  content text,
  course text,
  topic text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    course_materials.id,
    course_materials.content,
    course_materials.course,
    course_materials.topic,
    1 - (course_materials.embedding <=> query_embedding) as similarity
  from course_materials
  where 1 - (course_materials.embedding <=> query_embedding) > match_threshold
  and (filter_course is null or course_materials.course = filter_course)
  order by course_materials.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

**Function 2: Search Past Questions**
```sql
create or replace function match_past_questions (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_course text default null
)
returns table (
  id uuid,
  question_text text,
  course text,
  year text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    past_questions.id,
    past_questions.question_text,
    past_questions.course,
    past_questions.year,
    1 - (past_questions.embedding <=> query_embedding) as similarity
  from past_questions
  where 1 - (past_questions.embedding <=> query_embedding) > match_threshold
  and (filter_course is null or past_questions.course = filter_course)
  order by past_questions.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

### 5. Create Indexes (Recommended)

```sql
create index on course_materials using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

create index on past_questions using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
```
