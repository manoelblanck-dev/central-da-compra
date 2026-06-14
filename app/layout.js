import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";
import Consentimento from "@/components/Consentimento";

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const BASE = "https://centraldacompraonline.com.br";

// Dados estruturados do site (Organização + WebSite com busca interna).
// Ajudam o Google a entender a marca e podem habilitar a caixa de busca
// nos resultados.
const schemaSite = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${BASE}/#organization`,
      name: "Central da Compra",
      url: BASE,
      logo: `${BASE}/logo.png`,
    },
    {
      "@type": "WebSite",
      "@id": `${BASE}/#website`,
      url: BASE,
      name: "Central da Compra",
      inLanguage: "pt-BR",
      publisher: { "@id": `${BASE}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE}/busca?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export const metadata = {
  metadataBase: new URL("https://centraldacompraonline.com.br"),
  title: "Central da Compra — As melhores ofertas em um só lugar",
  description:
    "Ofertas selecionadas da Shopee, Mercado Livre e TikTok Shop. Encontre, compare e compre com segurança.",
  openGraph: {
    title: "Central da Compra — As melhores ofertas em um só lugar",
    description:
      "Ofertas da semana garimpadas pra você, da Shopee e Mercado Livre. ⚽ Especial Copa.",
    type: "website",
    locale: "pt_BR",
    siteName: "Central da Compra",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${instrument.variable} ${inter.variable}`}>
      <body className="font-sans text-cc-ink bg-white flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaSite).replace(/</g, "\\u003c"),
          }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <Consentimento />
      </body>
    </html>
  );
}
