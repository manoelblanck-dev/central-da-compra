-- =============================================================
--  Central da Compra — Onda 9 (painel de desempenho / cliques por data)
--  Cole no Supabase: SQL Editor > New query > RUN
--  Pode rodar quantas vezes quiser (idempotente).
-- =============================================================

-- Registra cada clique em "Ver Oferta" com a data/hora, para o painel
-- mostrar cliques ao longo do tempo e os produtos que mais bombam na semana.
-- (O contador acumulado em produtos.cliques continua existindo.)
create table if not exists cliques_log (
  id          uuid primary key default gen_random_uuid(),
  produto_id  uuid references produtos(id) on delete cascade,
  criado_em   timestamptz default now()
);

create index if not exists idx_cliques_log_criado_em on cliques_log (criado_em);
create index if not exists idx_cliques_log_produto on cliques_log (produto_id);

-- Segurança: ninguém acessa pelo navegador. Só o servidor (service_role,
-- usado pelo redirecionador /ir e pelo painel) escreve e lê esses dados.
alter table cliques_log enable row level security;
