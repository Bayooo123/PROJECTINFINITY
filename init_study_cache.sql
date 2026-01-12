-- Phase 2: Study Room Semantic Caching
-- This table stores high-quality RAG explanations for reuse.

create table if not exists study_cache (
  id uuid default uuid_generate_v4() primary key,
  query_text text not null,
  query_embedding vector(768), -- For Google's text-embedding-004
  response_text text not null,
  course_context text,
  metadata jsonb default '{}'::jsonb,
  is_verified boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for vector similarity search
create index on study_cache using hnsw (query_embedding vector_cosine_ops);

-- Enable RLS
alter table study_cache enable row level security;

-- Policies
create policy "Read access for all students"
  on study_cache for select
  using (true);

create policy "Insert access for system"
  on study_cache for insert
  with check (true);

-- RPC for semantic lookup
create or replace function match_study_cache (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_course text default null
)
returns table (
  id uuid,
  query_text text,
  response_text text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    study_cache.id,
    study_cache.query_text,
    study_cache.response_text,
    1 - (study_cache.query_embedding <=> query_embedding) as similarity
  from study_cache
  where (study_cache.course_context = filter_course or filter_course is null)
    and 1 - (study_cache.query_embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;
