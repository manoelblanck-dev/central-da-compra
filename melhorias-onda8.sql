-- =============================================================
--  Central da Compra — Onda 8 (comissão de afiliado por produto)
--  Cole no Supabase: SQL Editor > New query > RUN
--  Pode rodar quantas vezes quiser (idempotente).
-- =============================================================

-- Guarda a porcentagem de comissão do programa de afiliado para cada
-- produto (ex.: 10.5 = 10,5%). Usada no painel para calcular quanto você
-- ganha por venda. É um dado interno (não é exibido no site).
alter table produtos add column if not exists comissao_percent numeric(5, 2);
