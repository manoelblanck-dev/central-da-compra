import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CATEGORIAS, nomeCategoria } from "@/lib/constantes";
import ListagemComFiltro from "@/components/ListagemComFiltro";

export const revalidate = 300; // cache inteligente (ISR), atualiza a cada 5 min

// Diz ao Next quais categorias existem, pra ele já deixar as páginas prontas
// no cache durante o build (lista fixa, sem consultar o banco).
export function generateStaticParams() {
  return CATEGORIAS.map((c) => ({ slug: c.slug }));
}

const POR_PAGINA = 12;

async function getInicial(slug) {
  const { data } = await supabase
    .from("produtos")
    .select("*")
    .eq("categoria", slug)
    .order("criado_em", { ascending: false })
    .range(0, POR_PAGINA - 1);
  return data || [];
}

export default async function CategoriaPage({ params }) {
  const slug = params.slug;
  if (!CATEGORIAS.some((c) => c.slug === slug)) notFound();

  const inicial = await getInicial(slug);

  const base = "https://centraldacompraonline.com.br";
  const schemaBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: base },
      { "@type": "ListItem", position: 2, name: nomeCategoria(slug), item: `${base}/categoria/${slug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb).replace(/</g, "\\u003c") }}
      />
      <h1 className="mb-6 cc-mono text-3xl text-cc-ink">{nomeCategoria(slug)}</h1>
      <ListagemComFiltro
        inicial={inicial}
        contexto={{ tipo: "categoria", slug }}
        porPagina={POR_PAGINA}
      />
    </div>
  );
}
