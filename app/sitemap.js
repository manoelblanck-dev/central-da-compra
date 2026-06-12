import { supabase } from "@/lib/supabase";
import { CATEGORIAS } from "@/lib/constantes";

const BASE = "https://centraldacompraonline.com.br";

export default async function sitemap() {
  const { data: produtos } = await supabase
    .from("produtos")
    .select("id, criado_em")
    .order("criado_em", { ascending: false })
    .limit(1000);

  const fixas = [
    { url: `${BASE}/`, priority: 1 },
    { url: `${BASE}/ofertas`, priority: 0.9 },
    { url: `${BASE}/privacidade`, priority: 0.3 },
    { url: `${BASE}/termos`, priority: 0.3 },
  ].map((r) => ({ ...r, lastModified: new Date() }));

  const categorias = CATEGORIAS.map((c) => ({
    url: `${BASE}/categoria/${c.slug}`,
    lastModified: new Date(),
    priority: 0.7,
  }));

  const itens = (produtos || []).map((p) => ({
    url: `${BASE}/produto/${p.id}`,
    lastModified: p.criado_em ? new Date(p.criado_em) : new Date(),
    priority: 0.6,
  }));

  return [...fixas, ...categorias, ...itens];
}
