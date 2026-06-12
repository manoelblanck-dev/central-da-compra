-- =============================================================
--  Central da Compra — Onda 3 (busca inteligente)
--  Cole no Supabase: SQL Editor > New query > RUN
--  (precisa que o melhorias-onda2.sql já tenha sido rodado,
--   pois usa a extensão pg_trgm criada lá)
-- =============================================================

-- Garante a extensão (caso a Onda 2 não tenha rodado ainda)
create extension if not exists pg_trgm;

-- Função de busca que tolera erros de digitação.
-- Retorna produtos que combinam por texto OU por semelhança (trigramas),
-- ordenados pela relevância. lim/off servem para o "carregar mais".
create or replace function buscar_produtos(
  termo text,
  lim int default 12,
  off int default 0
)
returns setof produtos
language sql
stable
as $$
  select *
  from produtos
  where termo is null
     or termo = ''
     or nome ilike '%' || termo || '%'
     or coalesce(descricao, '') ilike '%' || termo || '%'
     or similarity(nome, termo) > 0.2
     or similarity(coalesce(descricao, ''), termo) > 0.2
  order by
    greatest(
      similarity(nome, termo),
      similarity(coalesce(descricao, ''), termo)
    ) desc,
    criado_em desc
  limit lim
  offset off;
$$;
