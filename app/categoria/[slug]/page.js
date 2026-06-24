import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { nomeCategoria } from "@/lib/constantes";
import { getTodasCategorias } from "@/lib/categorias";
import { getSubcategoriasMapa, subcategoriasDe } from "@/lib/subcategorias";
import ListagemComFiltro from "@/components/ListagemComFiltro";

export const revalidate = 300; // cache inteligente (ISR), atualiza a cada 5 min

// Diz ao Next quais categorias existem (fixas + criadas pelo usuário), pra
// já deixar as páginas no cache. Categorias novas geram sob demanda também.
export async function generateStaticParams() {
  try {
    const todas = await getTodasCategorias();
    return todas.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

const POR_PAGINA = 12;

async function getInicial(slug) {
  const { data } = await supabase
    .from("produtos")
    .select("*")
    .neq("oculto", true)
    .eq("categoria", slug)
    .order("criado_em", { ascending: false })
    .range(0, POR_PAGINA - 1);
  return data || [];
}

export default async function CategoriaPage({ params }) {
  const slug = params.slug;

  const [todas, inicial, subMapa] = await Promise.all([
    getTodasCategorias(),
    getInicial(slug),
    getSubcategoriasMapa(),
  ]);
  const subcategorias = subcategoriasDe(subMapa, slug);

  // Aceita a categoria se ela existe (fixa ou criada) OU se já tem produtos.
  const existe = todas.some((c) => c.slug === slug) || inicial.length > 0;
  if (!existe) notFound();

  const nome = nomeCategoria(slug, todas);

  const base = "https://centraldacompraonline.com.br";
  const schemaBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: base },
      { "@type": "ListItem", position: 2, name: nome, item: `${base}/categoria/${slug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb).replace(/</g, "\\u003c") }}
      />
      <h1 className="mb-6 cc-mono text-3xl text-cc-ink">{nome}</h1>
      <ListagemComFiltro
        inicial={inicial}
        contexto={{ tipo: "categoria", slug }}
        porPagina={POR_PAGINA}
        categorias={todas}
        subcategorias={subcategorias}
      />
    </div>
  );
}
