-- =====================================================
-- DBAPAGE SUPABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- =====================================================

-- 1. PROFILES TABLE
-- Stores custom user data (extends auth.users)
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text not null,
  email       text not null,
  course      text not null,  -- 'Oracle DBA' | 'Oracle Developer' | 'PostgreSQL DBA' | 'PostgreSQL Developer'
  approved    boolean not null default false,
  created_at  timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can insert their own profile on signup
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Service role (admin) can do everything
create policy "Service role full access on profiles"
  on public.profiles for all
  using (auth.role() = 'service_role');


-- 2. VIDEOS TABLE
create table if not exists public.videos (
  id            serial primary key,
  title         text not null,
  description   text,
  video_url     text not null,
  thumbnail_url text,
  course        text not null,  -- must match profile.course values
  is_public     boolean not null default false,  -- true = shown on public /videos page
  duration      text,           -- e.g. '45:30'
  created_at    timestamptz default now()
);

-- Enable RLS
alter table public.videos enable row level security;

-- Public videos visible to everyone
create policy "Anyone can read public videos"
  on public.videos for select
  using (is_public = true);

-- Approved users can read videos matching their course
create policy "Approved users can read their course videos"
  on public.videos for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.approved = true
        and p.course = videos.course
    )
  );

-- Service role full access
create policy "Service role full access on videos"
  on public.videos for all
  using (auth.role() = 'service_role');


-- 3. CONTACT MESSAGES TABLE
create table if not exists public.contact_messages (
  id         serial primary key,
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  created_at timestamptz default now()
);

alter table public.contact_messages enable row level security;

-- Anyone can insert (contact form)
create policy "Anyone can send a contact message"
  on public.contact_messages for insert
  with check (true);

-- Only service role can read messages
create policy "Service role reads contact messages"
  on public.contact_messages for select
  using (auth.role() = 'service_role');


-- =====================================================
-- SEED: Sample videos for all courses
-- =====================================================
insert into public.videos (title, description, video_url, course, is_public, duration) values
  -- Oracle DBA videos
  ('Oracle Architecture Overview',      'Deep dive into Oracle memory and process architecture',              'https://www.youtube.com/watch?v=LXb3EKWsInQ', 'Oracle DBA',            true,  '45:00'),
  ('Truncate vs Delete in Oracle',      'Explains the difference between TRUNCATE and DELETE in Oracle',    'https://www.youtube.com/watch?v=LXb3EKWsInQ', 'Oracle DBA',            true,  '22:00'),
  ('RMAN Backup Strategies',            'Complete RMAN backup and recovery configuration guide',             'https://www.youtube.com/watch?v=LXb3EKWsInQ', 'Oracle DBA',            false, '60:00'),
  ('Performance Tuning with AWR',       'Using AWR and ADDM reports for Oracle performance tuning',         'https://www.youtube.com/watch?v=LXb3EKWsInQ', 'Oracle DBA',            false, '55:00'),
  ('Oracle Data Guard Setup',           'Step-by-step Oracle Data Guard primary/standby configuration',     'https://www.youtube.com/watch?v=LXb3EKWsInQ', 'Oracle DBA',            false, '75:00'),

  -- Oracle Developer videos
  ('PL/SQL Stored Procedures',          'Creating and executing stored procedures in Oracle PL/SQL',         'https://www.youtube.com/watch?v=LXb3EKWsInQ', 'Oracle Developer',       true,  '38:00'),
  ('Cursors in PL/SQL',                 'Explicit and implicit cursors with practical examples',              'https://www.youtube.com/watch?v=LXb3EKWsInQ', 'Oracle Developer',       false, '42:00'),
  ('Oracle Analytical Functions',       'Using ROW_NUMBER, RANK, LAG, LEAD and other analytical functions',  'https://www.youtube.com/watch?v=LXb3EKWsInQ', 'Oracle Developer',       false, '50:00'),

  -- PostgreSQL DBA videos
  ('PostgreSQL Streaming Replication',  'Setting up streaming replication in PostgreSQL',                    'https://www.youtube.com/watch?v=LXb3EKWsInQ', 'PostgreSQL DBA',         true,  '48:00'),
  ('PostgreSQL Vacuum & Autovacuum',    'Understanding and configuring PostgreSQL VACUUM',                   'https://www.youtube.com/watch?v=LXb3EKWsInQ', 'PostgreSQL DBA',         false, '35:00'),
  ('Patroni High Availability Setup',   'Building a HA PostgreSQL cluster with Patroni',                    'https://www.youtube.com/watch?v=LXb3EKWsInQ', 'PostgreSQL DBA',         false, '90:00'),

  -- PostgreSQL Developer videos
  ('PostgreSQL Window Functions',       'Mastering window functions in PostgreSQL',                          'https://www.youtube.com/watch?v=LXb3EKWsInQ', 'PostgreSQL Developer',   true,  '40:00'),
  ('JSONB in PostgreSQL',               'Working with JSON and JSONB data types in PostgreSQL',              'https://www.youtube.com/watch?v=LXb3EKWsInQ', 'PostgreSQL Developer',   false, '45:00'),
  ('PostgreSQL Full-Text Search',       'Implementing full-text search using tsvector and tsquery',          'https://www.youtube.com/watch?v=LXb3EKWsInQ', 'PostgreSQL Developer',   false, '38:00')
on conflict do nothing;


-- =====================================================
-- ADMIN HELPER: Approve a user by email
-- Run this after a student registers to approve them:
--
--   update public.profiles
--   set approved = true
--   where email = 'student@example.com';
--
-- Or list all pending approvals:
--
--   select id, name, email, course, created_at
--   from public.profiles
--   where approved = false
--   order by created_at desc;
--
-- =====================================================
