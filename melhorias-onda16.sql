-- =============================================================
--  Central da Compra — Onda 16 (várias subcategorias por produto)
--  Cole no Supabase: SQL Editor > New query > RUN
--  Pode rodar quantas vezes quiser (idempotente).
-- =============================================================

-- Agora um produto pode ter VÁRIAS subcategorias (lista de atalhos/slugs),
-- ex.: ["camisas","manga-longa"]. Substitui o campo único da Onda 15.
alter table produtos add column if not exists subcategorias jsonb default '[]'::jsonb;

-- Aproveita o que já estava salvo no campo único (subcategoria) e joga pra lista,
-- sem perder nada. Só mexe em quem ainda está com a lista vazia.
update produtos
   set subcategorias = jsonb_build_array(subcategoria)
 where subcategoria is not null
   and subcategoria <> ''
   and (subcategorias is null or subcategorias = '[]'::jsonb);

-- Índice GIN pra filtrar rápido "produtos que contêm a subcategoria X".
create index if not exists idx_produtos_subcategorias on produtos using gin (subcategorias);
