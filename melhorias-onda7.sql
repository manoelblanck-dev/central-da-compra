-- =============================================================
--  Central da Compra — Onda 7 (atualização automática de preços)
--  Cole no Supabase: SQL Editor > New query > RUN
--  Pode rodar quantas vezes quiser (idempotente).
-- =============================================================

-- Guarda o código do anúncio no Mercado Livre (ex: "MLB1234567890"),
-- descoberto automaticamente a partir do link de afiliado.
-- Evita ter que resolver o link de novo a cada atualização de preço.
alter table produtos add column if not exists ml_item_id text;

create index if not exists idx_produtos_ml_item_id on produtos (ml_item_id);
