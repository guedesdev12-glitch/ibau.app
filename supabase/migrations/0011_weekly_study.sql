-- IBAU App: estudo semanal (publicado pelos administradores) + horário
-- de término do encontro.

create table public.weekly_studies (
  id uuid primary key default gen_random_uuid(),
  study_date date not null,
  title text not null,
  content text not null,
  file_url text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.weekly_studies is 'Estudo semanal publicado pelos administradores para as células.';

create index weekly_studies_date_idx on public.weekly_studies (study_date desc);

alter table public.cell_meetings add column end_time time;

insert into public.permissions (key, module, label) values
  ('estudos.manage', 'estudos', 'Publicar o estudo semanal');

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r, public.permissions p
where r.name = 'Administrador' and p.key = 'estudos.manage';

alter table public.weekly_studies enable row level security;

create policy "weekly_studies_select" on public.weekly_studies
  for select to authenticated using (true);

create policy "weekly_studies_write" on public.weekly_studies
  for all to authenticated
  using (public.has_permission('estudos.manage'))
  with check (public.has_permission('estudos.manage'));
