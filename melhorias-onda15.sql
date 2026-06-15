-- =============================================================
--  Central da Compra — Onda 15 (subcategorias)
--  Cole no Supabase: SQL Editor > New query > RUN
--  Pode rodar quantas vezes quiser (idempotente).
-- =============================================================

-- Subcategoria do produto (ex.: dentro de "Moda" -> "camisas", "vestidos").
-- Guarda só o atalho (slug). A lista de subcategorias de cada categoria fica
-- no painel (config > "subcategorias"), igual às categorias criadas por você.
alter table produtos add column if not exists subcategoria text;

-- Índice pra filtrar rápido por subcategoria nas páginas de categoria.
create index if not exists idx_produtos_subcategoria on produtos (subcategoria);
