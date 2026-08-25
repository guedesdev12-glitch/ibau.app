-- IBAU App: categoria Discipulador (pode cadastrar células) + campos
-- completos de célula (líder auxiliar, geração, foto).

insert into public.roles (name) values ('Discipulador')
on conflict (name) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r, public.permissions p
where r.name = 'Discipulador' and p.key in ('celulas.manage', 'celulas.view', 'membros.view', 'encontros.manage');

alter table public.cells
  add column co_leader_id uuid references public.profiles (id) on delete set null,
  add column generation text,
  add column photo_url text;

comment on column public.cells.co_leader_id is 'Líder auxiliar da célula.';
comment on column public.cells.generation is 'Geração da célula (ex: Kids, Adolescentes, Jovens, Adultos).';
comment on column public.cells.photo_url is 'Foto de capa da célula.';

insert into storage.buckets (id, name, public)
values ('cells', 'cells', true)
on conflict (id) do nothing;

create policy "cells_bucket_read"
  on storage.objects for select
  using (bucket_id = 'cells');

create policy "cells_bucket_write"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'cells' and public.has_permission('celulas.manage'))
  with check (bucket_id = 'cells' and public.has_permission('celulas.manage'));
