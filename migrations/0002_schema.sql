create table if not exists works (
  id text primary key,
  code text not null,
  name text not null,
  active boolean not null default true
);

create table if not exists streets (
  id text primary key,
  name text not null,
  work_id text not null references works (id),
  active boolean not null default true
);

create table if not exists activities (
  id text primary key,
  name text not null,
  kind text not null,
  code text
);

create table if not exists equipment (
  id text primary key,
  code text not null,
  name text not null,
  kind text not null,
  plate text,
  activity_ids jsonb not null default '[]'::jsonb,
  active boolean not null default true
);

create table if not exists apontamentos (
  id text primary key,
  date date not null,
  start_time text not null,
  end_time text,
  work_id text not null,
  work_name text not null,
  street_id text not null,
  street_name text not null,
  equipment_id text not null,
  equipment_name text not null,
  equipment_kind text not null,
  activity_id text not null,
  activity_name text not null,
  estaca text not null default '',
  pv text not null default '',
  quantity double precision,
  notes text not null default '',
  description text not null default '',
  lat double precision,
  lng double precision,
  accuracy double precision,
  location_label text not null default '',
  device_id text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists apontamentos_date_idx on apontamentos (date desc, start_time desc);

create table if not exists presence (
  device_id text primary key,
  label text not null default '',
  lat double precision not null,
  lng double precision not null,
  accuracy double precision,
  work_id text,
  equipment_id text,
  street_id text,
  updated_at timestamptz not null default now()
);
