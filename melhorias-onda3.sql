-- =============================================================
--  Central da Compra — Busca inteligente (versão melhorada)
--  Cole no Supabase: SQL Editor > New query > RUN
--  Pode rodar quantas vezes quiser (idempotente).
-- =============================================================

-- Extensões: trigramas (semelhança) + unaccent (ignorar acentos)
create extension if not exists pg_trgm;
create extension if not exists unaccent;

-- Função de busca:
--  - ignora acentos e maiúsculas/minúsculas
--  - acha por trecho (ilike) E por semelhança (tolera erro de digitação)
--  - ordena pelos resultados mais parecidos
--  - lim/off servem para o "carregar mais"
create or replace function buscar_produtos(
  termo text,
  lim int default 12,
  off int default 0
)
returns setof produtos
language sql
stable
as $$
  with p as (
    select unaccent(lower(coalesce(termo, ''))) as t
  )
  select prod.*
  from produtos prod, p
  where p.t = ''
     or unaccent(lower(prod.nome)) ilike '%' || p.t || '%'
     or unaccent(lower(coalesce(prod.descricao, ''))) ilike '%' || p.t || '%'
     or similarity(unaccent(lower(prod.nome)), p.t) > 0.15
     or word_similarity(p.t, unaccent(lower(prod.nome))) > 0.3
  order by
    greatest(
      similarity(unaccent(lower(prod.nome)), p.t),
      word_similarity(p.t, unaccent(lower(prod.nome)))
    ) desc,
    prod.criado_em desc
  limit lim
  offset off;
$$;
