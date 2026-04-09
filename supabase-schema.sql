-- Run this in Supabase SQL Editor

create table users (
  id text primary key default gen_random_uuid()::text,
  username text unique not null,
  password text not null
);

create table posts (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  content text not null,
  author text not null,
  author_id text not null references users(id),
  likes integer default 0,
  liked_by text[] default '{}',
  viewed_by text[] default '{}',
  views integer default 0,
  created_at bigint not null
);

create table comments (
  id text primary key default gen_random_uuid()::text,
  post_id text not null references posts(id) on delete cascade,
  author text not null,
  author_id text not null references users(id),
  text text not null,
  created_at bigint not null
);

-- Disable RLS (using service role key)
alter table users disable row level security;
alter table posts disable row level security;
alter table comments disable row level security;
