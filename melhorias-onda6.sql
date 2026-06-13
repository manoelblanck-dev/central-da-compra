-- =============================================================
--  Central da Compra — Onda 6 (Tema & Engajamento)
--  Cole no Supabase: SQL Editor > New query > RUN
--  Pode rodar quantas vezes quiser (idempotente).
-- =============================================================

-- 1) Tabela de configuração (guarda o "próximo jogo do Brasil" e
--    serve para futuras configurações do site).
create table if not exists config (
  chave text primary key,
  valor jsonb,
  atualizado_em timestamptz default now()
);

alter table config enable row level security;

-- Leitura pública (o site lê o próximo jogo). Escrita só pelo painel
-- (que usa a chave de serviço e ignora o RLS).
drop policy if exists "config leitura publica" on config;
create policy "config leitura publica" on config for select using (true);

-- 2) Prova social: nota (0 a 5) e número de avaliações nos produtos.
alter table produtos add column if not exists nota numeric(2,1);
alter table produtos add column if not exists avaliacoes int;
