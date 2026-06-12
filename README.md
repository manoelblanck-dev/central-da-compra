# 🛒 Central da Compra

Site de afiliados feito em **Next.js + Supabase**, pronto para publicar na **Vercel**.
Você cadastra produtos (com seus links de afiliado da Shopee, Mercado Livre e TikTok Shop)
num painel protegido por senha, e os visitantes navegam, buscam e são redirecionados
para a loja para comprar.

---

## ✅ O que você vai precisar

- **Node.js** instalado no seu computador (versão 18 ou maior) → https://nodejs.org (baixe a versão "LTS")
- Uma conta no **Supabase** (você já criou) → https://supabase.com
- Uma conta no **GitHub** → https://github.com
- Uma conta na **Vercel** → https://vercel.com (pode entrar com o GitHub)

> Tudo isso é **gratuito** para começar. Só o domínio (no final) é pago (~R$40/ano).

---

## 🗂️ Passo 1 — Configurar o Supabase (banco de dados)

1. Entre no seu projeto no Supabase.
2. No menu lateral, abra **SQL Editor** → **New query**.
3. Abra o arquivo **`supabase-schema.sql`** (que veio neste projeto), copie **todo** o conteúdo, cole no editor e clique em **RUN**.
   - Isso cria a tabela `produtos`, libera a leitura pública e já insere 6 produtos de exemplo.
4. Agora pegue suas chaves. No menu, vá em **Project Settings** (engrenagem) → **API**. Anote três coisas:
   - **Project URL** → algo como `https://xxxxx.supabase.co`
   - **anon public** (chave anônima) → uma chave longa
   - **service_role** (chave secreta) → outra chave longa ⚠️ **nunca mostre essa para ninguém**

---

## 💻 Passo 2 — Rodar o site no seu computador

1. Abra a pasta do projeto no terminal (Prompt de Comando, PowerShell ou Terminal).
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie o arquivo de senhas. Copie o arquivo `.env.local.example` para um novo arquivo chamado **`.env.local`** e preencha com as chaves do Passo 1:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=cole-a-anon-public-aqui
   SUPABASE_SERVICE_ROLE_KEY=cole-a-service_role-aqui
   ADMIN_PASSWORD=escolha-uma-senha-forte
   ```
4. Rode o site:
   ```bash
   npm run dev
   ```
5. Abra no navegador: **http://localhost:3000** 🎉

Você deve ver a loja com os 6 produtos de exemplo.

---

## 🔐 Passo 3 — Usar o painel admin

1. Acesse **http://localhost:3000/admin**
2. Digite a senha que você colocou em `ADMIN_PASSWORD`.
3. Dentro do painel você pode:
   - **+ Novo produto** → cadastrar um produto
   - **Editar** / **Excluir** qualquer produto
   - Ver métricas (total de produtos, destaques e cliques nas ofertas)
   - Marcar um produto como **destaque** (aparece na seção principal da home)

> Dica: comece apagando os 6 produtos de exemplo e cadastrando os reais.

### Como pegar o link de afiliado de cada plataforma
- **Shopee** → painel em `affiliate.shopee.com.br` → gere o link do produto e cole no campo "Link de afiliado".
- **Mercado Livre** → painel de Afiliados do ML → gere o link e cole.
- **TikTok Shop** → o link de afiliado é mais voltado para vídeos/lives no app; use os outros dois como carro-chefe do site no começo.

No campo **URL da imagem**, cole o endereço de uma foto do produto (clique com o botão direito na imagem na loja → "Copiar endereço da imagem").

---

## ☁️ Passo 4 — Subir o código para o GitHub

1. Crie um repositório novo (e **privado**) em https://github.com/new
2. No terminal, dentro da pasta do projeto:
   ```bash
   git init
   git add .
   git commit -m "Central da Compra"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/central-da-compra.git
   git push -u origin main
   ```
   (troque `SEU-USUARIO` pelo seu usuário do GitHub)

> O arquivo `.env.local` **não** vai para o GitHub (ele está protegido no `.gitignore`). Isso é proposital: suas senhas ficam só com você.

---

## 🚀 Passo 5 — Publicar na Vercel

1. Entre em https://vercel.com e faça login com o GitHub.
2. Clique em **Add New… → Project** e importe o repositório `central-da-compra`.
3. Antes de clicar em Deploy, abra **Environment Variables** e adicione as **mesmas 4 variáveis** do seu `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
4. Clique em **Deploy**. Em ~2 minutos seu site estará no ar num endereço tipo
   `central-da-compra.vercel.app`.

> Sempre que você der `git push`, a Vercel publica a nova versão automaticamente.

---

## 🌐 Passo 6 — Domínio próprio (centraldacompraonline.com.br)

1. Compre o domínio no **Registro.br** (~R$40/ano).
2. Na Vercel, abra seu projeto → **Settings → Domains** → adicione `centraldacompraonline.com.br`.
3. A Vercel vai te mostrar as configurações (tipo um registro `A` ou `CNAME`) para colar no painel do Registro.br.
4. Em alguns minutos/horas o domínio começa a funcionar. Pronto! ✅

---

## 📁 Estrutura do projeto

```
app/
  page.js                 → página inicial (home)
  busca/page.js           → resultados da busca
  categoria/[slug]/page.js→ produtos por categoria
  produto/[id]/page.js    → página do produto + botão de compra
  ir/[id]/route.js        → redireciona pro link de afiliado e conta o clique
  admin/page.js           → painel (cadastrar/editar/excluir)
  admin/login/page.js     → tela de senha
  api/                    → rotas internas (login, logout, salvar produtos)
components/               → header, cards, badges, rodapé
lib/
  supabase.js             → conexão de leitura (pública)
  supabaseAdmin.js        → conexão de escrita (secreta, só no servidor)
  constantes.js           → categorias, plataformas, formatação de preço
supabase-schema.sql       → cria o banco de dados
.env.local.example        → modelo das variáveis de ambiente
```

---

## ❓ Dúvidas comuns

**A loja abre, mas não aparece nenhum produto.**
Confirme que você rodou o `supabase-schema.sql` e que as chaves no `.env.local`
estão certas (sem espaços sobrando).

**Não consigo entrar no /admin.**
A senha é a que está em `ADMIN_PASSWORD`. Se mudar essa variável na Vercel,
precisa fazer login de novo.

**As fotos dos produtos não aparecem.**
Verifique se a "URL da imagem" é um link direto para uma imagem (termina em
`.jpg`, `.png`, etc.) e abre sozinha no navegador.

**É seguro?**
A chave secreta (`service_role`) só roda no servidor, nunca no navegador.
O painel é protegido por senha. Para um projeto maior, dá para evoluir depois
para o login oficial do Supabase (Supabase Auth).

---

Feito com ☕ para a Central da Compra.
