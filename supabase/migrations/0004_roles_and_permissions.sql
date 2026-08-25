-- IBAU App: sistema de categorias e permissões (substitui o enum fixo
-- admin/lider_celula/membro por categorias editáveis, com permissões
-- atribuídas por categoria, não por usuário).

-- ---------------------------------------------------------------------
-- roles (categorias de cadastro)
-- ---------------------------------------------------------------------
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_developer boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.roles is 'Categorias de cadastro (Desenvolvedor, Administrador, Pastor, Líder...). is_developer=true tem acesso total, sempre.';

-- ---------------------------------------------------------------------
-- permissions (ações por módulo)
-- ---------------------------------------------------------------------
create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  module text not null,
  label text not null,
  created_at timestamptz not null default now()
);

comment on table public.permissions is 'Permissões individuais por módulo/ação (ex: celulas.manage).';

-- ---------------------------------------------------------------------
-- role_permissions (o que cada categoria pode fazer)
-- ---------------------------------------------------------------------
create table public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  primary key (role_id, permission_id)
);

-- ---------------------------------------------------------------------
-- seed: categorias
-- ---------------------------------------------------------------------
insert into public.roles (name, is_developer) values
  ('Desenvolvedor', true),
  ('Administrador', false),
  ('Pastor', false),
  ('Líder', false),
  ('Co-líder', false),
  ('Timóteo', false),
  ('Visitante', false);

-- ---------------------------------------------------------------------
-- seed: permissões dos módulos existentes
-- ---------------------------------------------------------------------
insert into public.permissions (key, module, label) values
  ('membros.view', 'membros', 'Ver diretório de membros'),
  ('membros.manage', 'membros', 'Criar, editar e mudar categoria de membros'),
  ('celulas.view', 'celulas', 'Ver células'),
  ('celulas.manage', 'celulas', 'Criar, editar e remover células'),
  ('encontros.manage', 'celulas', 'Registrar encontros de qualquer célula');

-- Administrador recebe tudo por padrão (equivalente ao antigo role=admin)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r, public.permissions p
where r.name = 'Administrador';

-- ---------------------------------------------------------------------
-- profiles: troca o enum fixo por role_id (categoria editável)
-- ---------------------------------------------------------------------
alter table public.profiles add column role_id uuid references public.roles (id);

update public.profiles p
set role_id = (
  select id from public.roles
  where name = case when p.role = 'admin' then 'Desenvolvedor' else 'Visitante' end
);

alter table public.profiles alter column role_id set not null;

-- ---------------------------------------------------------------------
-- helpers de autorização baseados em categoria/permissão
-- ---------------------------------------------------------------------
create function public.is_developer()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((
    select r.is_developer
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = auth.uid()
  ), false);
$$;

create function public.has_permission(p_key text)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select public.is_developer() or exists (
    select 1
    from public.profiles pr
    join public.role_permissions rp on rp.role_id = pr.role_id
    join public.permissions perm on perm.id = rp.permission_id
    where pr.id = auth.uid() and perm.key = p_key
  );
$$;

-- ---------------------------------------------------------------------
-- atualiza o trigger de novo usuário: categoria padrão = Visitante
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    (select id from public.roles where name = 'Visitante')
  );
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- remove o enum antigo (role) e a função current_role(), agora obsoletos
-- ---------------------------------------------------------------------
drop policy "profiles_update_admin" on public.profiles;
drop policy "cells_insert_admin" on public.cells;
drop policy "cells_update_admin_or_leader" on public.cells;
drop policy "cells_delete_admin" on public.cells;
drop policy "cell_members_select" on public.cell_members;
drop policy "cell_members_insert" on public.cell_members;
drop policy "cell_members_delete" on public.cell_members;
drop policy "visitors_select" on public.visitors;
drop policy "visitors_write" on public.visitors;
drop policy "cell_meetings_select" on public.cell_meetings;
drop policy "cell_meetings_write" on public.cell_meetings;
drop policy "cell_meeting_team_select" on public.cell_meeting_team;
drop policy "cell_meeting_team_write" on public.cell_meeting_team;
drop policy "cell_meeting_visitors_select" on public.cell_meeting_visitors;
drop policy "cell_meeting_visitors_write" on public.cell_meeting_visitors;

create policy "profiles_update_manage"
  on public.profiles for update
  to authenticated
  using (public.has_permission('membros.manage'));

create policy "cells_insert_manage"
  on public.cells for insert
  to authenticated
  with check (public.has_permission('celulas.manage'));

create policy "cells_update_manage_or_leader"
  on public.cells for update
  to authenticated
  using (public.has_permission('celulas.manage') or leader_id = auth.uid());

create policy "cells_delete_manage"
  on public.cells for delete
  to authenticated
  using (public.has_permission('celulas.manage'));

create policy "cell_members_select"
  on public.cell_members for select
  to authenticated
  using (
    profile_id = auth.uid()
    or public.has_permission('celulas.manage')
    or public.is_cell_leader(cell_id)
  );

create policy "cell_members_insert"
  on public.cell_members for insert
  to authenticated
  with check (public.has_permission('celulas.manage') or public.is_cell_leader(cell_id));

create policy "cell_members_delete"
  on public.cell_members for delete
  to authenticated
  using (public.has_permission('celulas.manage') or public.is_cell_leader(cell_id));

create policy "visitors_select"
  on public.visitors for select
  to authenticated
  using (public.has_permission('encontros.manage') or public.is_cell_member(cell_id));

create policy "visitors_write"
  on public.visitors for all
  to authenticated
  using (public.has_permission('encontros.manage') or public.is_cell_leader(cell_id))
  with check (public.has_permission('encontros.manage') or public.is_cell_leader(cell_id));

create policy "cell_meetings_select"
  on public.cell_meetings for select
  to authenticated
  using (public.has_permission('encontros.manage') or public.is_cell_member(cell_id));

create policy "cell_meetings_write"
  on public.cell_meetings for all
  to authenticated
  using (public.has_permission('encontros.manage') or public.is_cell_leader(cell_id))
  with check (public.has_permission('encontros.manage') or public.is_cell_leader(cell_id));

create policy "cell_meeting_team_select"
  on public.cell_meeting_team for select
  to authenticated
  using (
    exists (
      select 1 from public.cell_meetings m
      where m.id = meeting_id
        and (public.has_permission('encontros.manage') or public.is_cell_member(m.cell_id))
    )
  );

create policy "cell_meeting_team_write"
  on public.cell_meeting_team for all
  to authenticated
  using (
    exists (
      select 1 from public.cell_meetings m
      where m.id = meeting_id
        and (public.has_permission('encontros.manage') or public.is_cell_leader(m.cell_id))
    )
  )
  with check (
    exists (
      select 1 from public.cell_meetings m
      where m.id = meeting_id
        and (public.has_permission('encontros.manage') or public.is_cell_leader(m.cell_id))
    )
  );

create policy "cell_meeting_visitors_select"
  on public.cell_meeting_visitors for select
  to authenticated
  using (
    exists (
      select 1 from public.cell_meetings m
      where m.id = meeting_id
        and (public.has_permission('encontros.manage') or public.is_cell_member(m.cell_id))
    )
  );

create policy "cell_meeting_visitors_write"
  on public.cell_meeting_visitors for all
  to authenticated
  using (
    exists (
      select 1 from public.cell_meetings m
      where m.id = meeting_id
        and (public.has_permission('encontros.manage') or public.is_cell_leader(m.cell_id))
    )
  )
  with check (
    exists (
      select 1 from public.cell_meetings m
      where m.id = meeting_id
        and (public.has_permission('encontros.manage') or public.is_cell_leader(m.cell_id))
    )
  );

alter table public.profiles drop column role;
drop function public.current_role();
drop type public.member_role;

-- ---------------------------------------------------------------------
-- RLS das novas tabelas: só Desenvolvedor gerencia categorias/permissões
-- ---------------------------------------------------------------------
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

create policy "roles_write_developer"
  on public.roles for all
  to authenticated
  using (public.is_developer())
  with check (public.is_developer());

create policy "permissions_select_developer"
  on public.permissions for select
  to authenticated
  using (public.is_developer());

create policy "role_permissions_select_developer"
  on public.role_permissions for select
  to authenticated
  using (public.is_developer());

create policy "role_permissions_write_developer"
  on public.role_permissions for all
  to authenticated
  using (public.is_developer())
  with check (public.is_developer());

-- profiles precisa poder mostrar o nome da categoria pra qualquer
-- autenticado (já é público via profiles_select_authenticated), então
-- roles também precisa ser legível minimamente para exibição de nome —
-- criamos uma policy adicional só de leitura do nome via join seguro:
create policy "roles_select_for_display"
  on public.roles for select
  to authenticated
  using (true);
