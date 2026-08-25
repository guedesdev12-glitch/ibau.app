-- IBAU App: Encontros de célula (registro de reunião, equipe presente,
-- visitantes, oferta e observações) + resumo mensal.

create type public.meeting_team_role as enum ('lider', 'co_lider', 'auxiliar');
create type public.offering_type as enum ('voluntaria', 'dizimo', 'oferta_especial');

-- ---------------------------------------------------------------------
-- visitors: pessoas convidadas para um encontro, sem necessariamente
-- terem conta no app.
-- ---------------------------------------------------------------------
create table public.visitors (
  id uuid primary key default gen_random_uuid(),
  cell_id uuid not null references public.cells (id) on delete cascade,
  full_name text not null,
  phone text,
  created_at timestamptz not null default now()
);

comment on table public.visitors is 'Visitantes convidados para encontros de uma célula.';

-- ---------------------------------------------------------------------
-- cell_meetings: um encontro (reunião) de célula.
-- ---------------------------------------------------------------------
create table public.cell_meetings (
  id uuid primary key default gen_random_uuid(),
  cell_id uuid not null references public.cells (id) on delete cascade,
  meeting_date date not null,
  start_time time,
  duration_minutes integer,
  location text,
  theme text,
  offering_amount numeric(10, 2),
  offering_type public.offering_type,
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.cell_meetings is 'Encontros (reuniões) registrados de uma célula.';

create index cell_meetings_cell_id_date_idx on public.cell_meetings (cell_id, meeting_date desc);

-- ---------------------------------------------------------------------
-- cell_meeting_team: membros da equipe presentes num encontro.
-- ---------------------------------------------------------------------
create table public.cell_meeting_team (
  meeting_id uuid not null references public.cell_meetings (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.meeting_team_role not null default 'auxiliar',
  primary key (meeting_id, profile_id)
);

comment on table public.cell_meeting_team is 'Membros da equipe presentes em um encontro.';

-- ---------------------------------------------------------------------
-- cell_meeting_visitors: visitantes presentes num encontro.
-- ---------------------------------------------------------------------
create table public.cell_meeting_visitors (
  meeting_id uuid not null references public.cell_meetings (id) on delete cascade,
  visitor_id uuid not null references public.visitors (id) on delete cascade,
  primary key (meeting_id, visitor_id)
);

comment on table public.cell_meeting_visitors is 'Visitantes presentes em um encontro.';

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.visitors enable row level security;
alter table public.cell_meetings enable row level security;
alter table public.cell_meeting_team enable row level security;
alter table public.cell_meeting_visitors enable row level security;

-- helper: usuário pertence à célula (como membro, não só líder)
create function public.is_cell_member(target_cell_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.cell_members
    where cell_id = target_cell_id and profile_id = auth.uid()
  ) or public.is_cell_leader(target_cell_id);
$$;

create policy "visitors_select"
  on public.visitors for select
  to authenticated
  using (
    public.current_role() = 'admin'
    or public.is_cell_member(cell_id)
  );

create policy "visitors_write"
  on public.visitors for all
  to authenticated
  using (public.current_role() = 'admin' or public.is_cell_leader(cell_id))
  with check (public.current_role() = 'admin' or public.is_cell_leader(cell_id));

create policy "cell_meetings_select"
  on public.cell_meetings for select
  to authenticated
  using (
    public.current_role() = 'admin'
    or public.is_cell_member(cell_id)
  );

create policy "cell_meetings_write"
  on public.cell_meetings for all
  to authenticated
  using (public.current_role() = 'admin' or public.is_cell_leader(cell_id))
  with check (public.current_role() = 'admin' or public.is_cell_leader(cell_id));

create policy "cell_meeting_team_select"
  on public.cell_meeting_team for select
  to authenticated
  using (
    exists (
      select 1 from public.cell_meetings m
      where m.id = meeting_id
        and (public.current_role() = 'admin' or public.is_cell_member(m.cell_id))
    )
  );

create policy "cell_meeting_team_write"
  on public.cell_meeting_team for all
  to authenticated
  using (
    exists (
      select 1 from public.cell_meetings m
      where m.id = meeting_id
        and (public.current_role() = 'admin' or public.is_cell_leader(m.cell_id))
    )
  )
  with check (
    exists (
      select 1 from public.cell_meetings m
      where m.id = meeting_id
        and (public.current_role() = 'admin' or public.is_cell_leader(m.cell_id))
    )
  );

create policy "cell_meeting_visitors_select"
  on public.cell_meeting_visitors for select
  to authenticated
  using (
    exists (
      select 1 from public.cell_meetings m
      where m.id = meeting_id
        and (public.current_role() = 'admin' or public.is_cell_member(m.cell_id))
    )
  );

create policy "cell_meeting_visitors_write"
  on public.cell_meeting_visitors for all
  to authenticated
  using (
    exists (
      select 1 from public.cell_meetings m
      where m.id = meeting_id
        and (public.current_role() = 'admin' or public.is_cell_leader(m.cell_id))
    )
  )
  with check (
    exists (
      select 1 from public.cell_meetings m
      where m.id = meeting_id
        and (public.current_role() = 'admin' or public.is_cell_leader(m.cell_id))
    )
  );

-- ---------------------------------------------------------------------
-- RPC: resumo mensal da célula (encontros, participantes, visitantes, ofertas)
-- Regra de negócio compartilhável por web e futuro app nativo.
-- ---------------------------------------------------------------------
create function public.cell_monthly_summary(p_cell_id uuid, p_year int, p_month int)
returns table (
  encontros_count bigint,
  participantes_count bigint,
  visitantes_count bigint,
  ofertas_total numeric
)
language sql
security definer set search_path = public
stable
as $$
  select
    count(distinct cm.id) as encontros_count,
    coalesce((
      select count(*)
      from public.cell_meeting_team t
      join public.cell_meetings m2 on m2.id = t.meeting_id
      where m2.cell_id = p_cell_id
        and extract(year from m2.meeting_date) = p_year
        and extract(month from m2.meeting_date) = p_month
    ), 0) as participantes_count,
    coalesce((
      select count(*)
      from public.cell_meeting_visitors v
      join public.cell_meetings m3 on m3.id = v.meeting_id
      where m3.cell_id = p_cell_id
        and extract(year from m3.meeting_date) = p_year
        and extract(month from m3.meeting_date) = p_month
    ), 0) as visitantes_count,
    coalesce(sum(cm.offering_amount), 0) as ofertas_total
  from public.cell_meetings cm
  where cm.cell_id = p_cell_id
    and extract(year from cm.meeting_date) = p_year
    and extract(month from cm.meeting_date) = p_month;
$$;
