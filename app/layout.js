import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";
import Pixels from "@/components/Pixels";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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
    <html lang="pt-BR" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans text-cc-ink bg-white flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <Pixels />
      </body>
    </html>
  );
}
