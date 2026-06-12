import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";

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
  title: "Central da Compra — Os melhores achados em um só lugar",
  description:
    "Ofertas selecionadas da Shopee, Mercado Livre e TikTok Shop. Encontre, compare e compre com segurança.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans text-cc-ink bg-white flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
