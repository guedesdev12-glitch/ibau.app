-- IBAU App: base module — Auth, Membros e Células
-- Convenção: profiles espelha auth.users (1:1). Todo cadastro de membro
-- passa primeiro pelo Supabase Auth; o trigger abaixo cria o profile.

create type public.member_role as enum ('admin', 'lider_celula', 'membro');
create type public.cell_member_role as enum ('lider', 'anfitriao', 'membro');

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  avatar_url text,
  role public.member_role not null default 'membro',
  birth_date date,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Dados de perfil de cada membro/usuário do app IBAU.';

-- ---------------------------------------------------------------------
-- cells (células)
-- ---------------------------------------------------------------------
create table public.cells (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  leader_id uuid references public.profiles (id) on delete set null,
  neighborhood text,
  address text,
  meeting_weekday smallint check (meeting_weekday between 0 and 6),
  meeting_time time,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.cells is 'Células (pequenos grupos) da igreja.';

-- ---------------------------------------------------------------------
-- cell_members (relação N:N entre profiles e cells)
-- ---------------------------------------------------------------------
create table public.cell_members (
  cell_id uuid not null references public.cells (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.cell_member_role not null default 'membro',
  joined_at timestamptz not null default now(),
  primary key (cell_id, profile_id)
);

comment on table public.cell_members is 'Vínculo de cada membro com sua(s) célula(s).';

create index cell_members_profile_id_idx on public.cell_members (profile_id);
create index cells_leader_id_idx on public.cells (leader_id);

-- ---------------------------------------------------------------------
-- Helper: cria profile automaticamente quando um usuário se cadastra
-- ---------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- Helper: verifica papel do usuário logado sem recursão de RLS
-- ---------------------------------------------------------------------
create function public.current_role()
returns public.member_role
language sql
security definer set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.is_cell_leader(target_cell_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.cells
    where id = target_cell_id and leader_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.cells enable row level security;
alter table public.cell_members enable row level security;

-- profiles: todo usuário autenticado pode ver todos os perfis (comum em
-- apps de igreja — diretório de membros), mas só admin edita outros.
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (public.current_role() = 'admin');

-- cells: leitura liberada para autenticados; escrita para admin ou o
-- próprio líder da célula.
create policy "cells_select_authenticated"
  on public.cells for select
  to authenticated
  using (true);

create policy "cells_insert_admin"
  on public.cells for insert
  to authenticated
  with check (public.current_role() = 'admin');

create policy "cells_update_admin_or_leader"
  on public.cells for update
  to authenticated
  using (public.current_role() = 'admin' or leader_id = auth.uid());

create policy "cells_delete_admin"
  on public.cells for delete
  to authenticated
  using (public.current_role() = 'admin');

-- cell_members: membro vê seus próprios vínculos; admin e líder da célula
-- veem/gerenciam todos os vínculos daquela célula.
create policy "cell_members_select"
  on public.cell_members for select
  to authenticated
  using (
    profile_id = auth.uid()
    or public.current_role() = 'admin'
    or public.is_cell_leader(cell_id)
  );

create policy "cell_members_insert"
  on public.cell_members for insert
  to authenticated
  with check (
    public.current_role() = 'admin'
    or public.is_cell_leader(cell_id)
  );

create policy "cell_members_delete"
  on public.cell_members for delete
  to authenticated
  using (
    public.current_role() = 'admin'
    or public.is_cell_leader(cell_id)
  );
