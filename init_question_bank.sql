create table if not exists question_bank (
  id uuid default uuid_generate_v4() primary key,
  course text not null,
  topic text not null,
  type text not null check (type in ('objective', 'theory')),
  question_data jsonb not null, -- Stores the full question object
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table question_bank enable row level security;

-- Policies
create policy "Everyone can read questions"
  on question_bank for select
  using (true);

create policy "Admins can insert questions"
  on question_bank for insert
  with check (true);
