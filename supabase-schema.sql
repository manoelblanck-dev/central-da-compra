-- =============================================================
--  Central da Compra — estrutura do banco de dados
--  Cole TODO este conteúdo no Supabase:
--  Painel do Supabase > SQL Editor > New query > Cole > RUN
-- =============================================================

-- 1) Tabela de produtos
create table if not exists produtos (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  descricao     text,
  preco         numeric(10, 2),
  preco_antigo  numeric(10, 2),
  imagem_url    text,
  link_afiliado text not null,
  plataforma    text not null default 'shopee',
  categoria     text not null default 'outros',
  destaque      boolean default false,
  cliques       integer default 0,
  criado_em     timestamptz default now()
);

-- 2) Segurança (RLS): qualquer pessoa pode LER os produtos,
--    mas ninguém pode criar/editar/apagar pelo navegador.
--    As alterações só acontecem pelo servidor (painel admin),
--    que usa a chave secreta service_role.
alter table produtos enable row level security;

drop policy if exists "leitura publica" on produtos;
create policy "leitura publica"
  on produtos for select
  using (true);

-- 3) (Opcional) Produtos de exemplo, só pra você ver a loja preenchida.
--    Depois apague pelo painel admin e cadastre os reais.
insert into produtos (nome, descricao, preco, preco_antigo, imagem_url, link_afiliado, plataforma, categoria, destaque) values
('Fone Bluetooth TWS', 'Fone sem fio com cancelamento de ruído e estojo de carga. Bateria de longa duração.', 89.90, 149.90, 'https://placehold.co/600x600/FFF8EC/211C15?text=Fone+TWS', 'https://shopee.com.br/', 'shopee', 'eletronicos', true),
('Smartwatch Esportivo', 'Relógio inteligente com monitor de batimentos, passos e notificações.', 129.90, 199.90, 'https://placehold.co/600x600/FFF8EC/211C15?text=Smartwatch', 'https://mercadolivre.com.br/', 'mercado_livre', 'eletronicos', true),
('Luminária de Mesa LED', 'Luminária articulada com 3 tons de luz e ajuste de brilho. Ideal para home office.', 59.90, 89.90, 'https://placehold.co/600x600/FFF8EC/211C15?text=Luminaria', 'https://shopee.com.br/', 'shopee', 'casa', true),
('Tênis Casual Unissex', 'Tênis leve e confortável para o dia a dia. Disponível em vários tamanhos.', 119.90, null, 'https://placehold.co/600x600/FFF8EC/211C15?text=Tenis', 'https://mercadolivre.com.br/', 'mercado_livre', 'moda', false),
('Kit Skincare Facial', 'Kit com sérum, hidratante e protetor. Para todos os tipos de pele.', 74.90, 99.90, 'https://placehold.co/600x600/FFF8EC/211C15?text=Skincare', 'https://shopee.com.br/', 'shopee', 'beleza', false),
('Garrafa Térmica 1L', 'Mantém a temperatura por até 12h. Aço inox, livre de BPA.', 49.90, null, 'https://placehold.co/600x600/FFF8EC/211C15?text=Garrafa', 'https://shopee.com.br/', 'shopee', 'esporte', false);
