-- Create a table for logging automatically generated topic titles
create table if not exists auto_topic_logs (
  id uuid primary key default uuid_generate_v4(),
  course text not null,
  generated_title text not null,
  source_sample text not null, -- A sample of the questions that triggered the generation
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table auto_topic_logs enable row level security;

-- Policies
create policy "Allow public read access to logs"
  on auto_topic_logs for select
  using (true);

create policy "Allow authenticated service role to insert logs"
  on auto_topic_logs for insert
  with check (true);
