-- =============================================================
--  Central da Compra — limpeza dos produtos de exemplo
--  Cole no Supabase: SQL Editor > New query > RUN
--  ⚠️ Isso apaga TODOS os produtos. Use antes de cadastrar os reais.
-- =============================================================

delete from produtos;

-- Confirma que zerou:
select count(*) as total_produtos from produtos;
