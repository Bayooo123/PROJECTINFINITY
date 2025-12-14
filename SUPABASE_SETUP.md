# Supabase Database Setup

## SQL Scripts to Run in Supabase SQL Editor

After creating your Supabase project, run these SQL scripts in the SQL Editor:

### 1. Create user_profiles table

```sql
create table user_profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  university text not null,
  level text not null,
  courses text[] not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table user_profiles enable row level security;

-- Policies
create policy "Users can view own profile"
  on user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on user_profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on user_profiles for insert
  with check (auth.uid() = id);
```
-- Enable RLS
alter table quiz_history enable row level security;

-- Policies
create policy "Users can view own quiz history"
  on quiz_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own quiz results"
  on quiz_history for insert
  with check (auth.uid() = user_id);
```

### 3. Create user_progress table

```sql
create table user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  course text not null,
  topics_completed text[] default array[]::text[],
  total_quizzes_taken integer default 0,
  total_questions_answered integer default 0,
  total_correct_answers integer default 0,
  last_practiced_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, course)
);

-- Enable RLS
alter table user_progress enable row level security;

-- Policies
create policy "Users can view own progress"
  on user_progress for select
  using (auth.uid() = user_id);

create policy "Users can update own progress"
  on user_progress for update
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on user_progress for insert
  with check (auth.uid() = user_id);
```

### 4. Create question_bank table

This table stores pre-generated questions to ensure constant availability.

```sql
create table question_bank (
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
  with check (true); -- For now allow all, strictly should be admin only
```

## Environment Variables

Add these to your `.env.local` file:

```
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Vercel Deployment

Add the same environment variables in Vercel:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add all three variables for Production, Preview, and Development environments
