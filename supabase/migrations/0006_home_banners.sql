-- IBAU App: carrossel de avisos/fotos na tela inicial.

create table public.home_banners (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text,
  position integer not null default 0,
  active boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.home_banners is 'Fotos/avisos exibidos no carrossel da tela inicial.';

create index home_banners_position_idx on public.home_banners (position);

alter table public.home_banners enable row level security;

create policy "home_banners_select" on public.home_banners
  for select to authenticated using (true);

create policy "home_banners_write" on public.home_banners
  for all to authenticated
  using (public.has_permission('igreja.manage'))
  with check (public.has_permission('igreja.manage'));

-- storage bucket público para as imagens do carrossel
insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do nothing;

create policy "banners_bucket_read"
  on storage.objects for select
  using (bucket_id = 'banners');

create policy "banners_bucket_write"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'banners' and public.has_permission('igreja.manage'))
  with check (bucket_id = 'banners' and public.has_permission('igreja.manage'));
