-- =============================================================
--  Central da Compra — Onda 2 (desempenho + cliques)
--  Cole TODO este conteúdo no Supabase:
--  SQL Editor > New query > RUN
--  Pode rodar quantas vezes quiser (é seguro / idempotente).
-- =============================================================

-- 1) Extensão que acelera a busca por texto (e tolera variações)
create extension if not exists pg_trgm;

-- 2) Índices da busca (deixam a busca por nome/descrição rápida)
create index if not exists idx_produtos_nome_trgm
  on produtos using gin (nome gin_trgm_ops);
create index if not exists idx_produtos_desc_trgm
  on produtos using gin (descricao gin_trgm_ops);

-- 3) Índices das listagens (home, categorias, ofertas)
create index if not exists idx_produtos_categoria on produtos (categoria);
create index if not exists idx_produtos_destaque  on produtos (destaque);
create index if not exists idx_produtos_criado     on produtos (criado_em desc);

-- 4) Função ATÔMICA de contagem de cliques
--    (incrementa sem risco de perder cliques simultâneos)
create or replace function increment_cliques(produto_id uuid)
returns void
language sql
as $$
  update produtos set cliques = cliques + 1 where id = produto_id;
$$;
