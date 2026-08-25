-- IBAU App: informações institucionais para a tela inicial
-- (dias de culto, próximos eventos, sobre a igreja).

create table public.church_settings (
  id boolean primary key default true,
  name text not null default 'IBAU',
  about text,
  address text,
  phone text,
  instagram text,
  updated_at timestamptz not null default now(),
  constraint church_settings_singleton check (id = true)
);

comment on table public.church_settings is 'Configuração única com informações institucionais da igreja.';

insert into public.church_settings (id, name) values (true, 'IBAU');

create table public.church_services (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  label text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.church_services is 'Horários recorrentes de culto/reunião da igreja.';

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  start_time time,
  location text,
  description text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.events is 'Eventos institucionais divulgados na tela inicial.';

create index events_date_idx on public.events (event_date);

insert into public.permissions (key, module, label) values
  ('igreja.manage', 'igreja', 'Editar informações da igreja, cultos e eventos');

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r, public.permissions p
where r.name = 'Administrador' and p.key = 'igreja.manage';

alter table public.church_settings enable row level security;
alter table public.church_services enable row level security;
alter table public.events enable row level security;

create policy "church_settings_select" on public.church_settings
  for select to authenticated using (true);

create policy "church_settings_write" on public.church_settings
  for update to authenticated
  using (public.has_permission('igreja.manage'))
  with check (public.has_permission('igreja.manage'));

create policy "church_services_select" on public.church_services
  for select to authenticated using (true);

create policy "church_services_write" on public.church_services
  for all to authenticated
  using (public.has_permission('igreja.manage'))
  with check (public.has_permission('igreja.manage'));

create policy "events_select" on public.events
  for select to authenticated using (true);

create policy "events_write" on public.events
  for all to authenticated
  using (public.has_permission('igreja.manage'))
  with check (public.has_permission('igreja.manage'));
