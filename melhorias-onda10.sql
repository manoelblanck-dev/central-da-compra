-- =============================================================
--  Central da Compra — Onda 10 (ordenar por desconto)
--  Cole no Supabase: SQL Editor > New query > RUN
--  Pode rodar quantas vezes quiser (idempotente).
-- =============================================================

-- Coluna calculada com o % de desconto (preço antigo -> preço atual).
-- É atualizada sozinha sempre que o preço muda. Usada para ordenar as
-- listagens por "maior desconto". Produtos sem desconto ficam com 0.
alter table produtos
  add column if not exists desconto_percent numeric
  generated always as (
    case
      when preco_antigo is not null and preco_antigo > 0
           and preco is not null and preco < preco_antigo
      then round((1 - preco / preco_antigo) * 100)
      else 0
    end
  ) stored;
