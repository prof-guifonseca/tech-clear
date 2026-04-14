import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import { AuthProvider } from "@/store/AuthContext";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tech Clear - A Epica Jornada da Reciclagem",
  description: "Aplicativo gamificado de reciclagem com lixeira inteligente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${cinzel.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-navy text-parchment">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
