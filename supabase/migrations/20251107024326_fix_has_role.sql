-- Atualiza a função has_role para usar a tabela user_roles
create or replace function public.has_role(
  _role public.app_role,
  _user_id uuid
)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = _user_id
      and ur.role = _role
  );
$$;
