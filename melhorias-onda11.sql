-- =============================================================
--  Central da Compra — Onda 11 (galeria de fotos no produto)
--  Cole no Supabase: SQL Editor > New query > RUN
--  Pode rodar quantas vezes quiser (idempotente).
-- =============================================================

-- Guarda fotos extras do produto (galeria), além da imagem principal
-- (imagem_url). É uma lista de URLs, ex.: ["https://...1.jpg","https://...2.jpg"].
alter table produtos add column if not exists imagens jsonb default '[]'::jsonb;
