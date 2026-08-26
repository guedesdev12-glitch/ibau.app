-- IBAU App: painel de controle de usuários — email denormalizado, status
-- ativo/bloqueado, e marcação de categorias sensíveis (só Admin atribui).

alter table public.profiles add column email text;
alter table public.profiles add column active boolean not null default true;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id;

-- atualiza o trigger de novo usuário para também gravar o e-mail
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    (select id from public.roles where name = 'Visitante')
  );
  return new;
end;
$$;

-- categorias sensíveis: só Administrador (ou Desenvolvedor) pode atribuir
alter table public.roles add column admin_only boolean not null default false;

update public.roles set admin_only = true where name in ('Pastor', 'Discipulador');

comment on column public.roles.admin_only is 'Se true, só quem é Administrador ou Desenvolvedor pode atribuir essa categoria a alguém.';
