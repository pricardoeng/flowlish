import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import Link from 'next/link';
import { Crown } from 'lucide-react';

export const metadata = {
  title: "Flowlish - Aprenda Inglês por Chunks",
  description: "A plataforma definitiva para fluência real através de blocos de linguagem.",
};

import { ModalProvider } from "@/context/ModalContext";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased text-zinc-900 bg-zinc-50">
        <ModalProvider>
          <div className="flex min-h-screen flex-col lg:flex-row">
            {/* Mobile Top Header */}
            <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md lg:hidden">
              <Link href="/">
                <img 
                  src="/images/logo_icon.png" 
                  alt="Flowlish" 
                  className="h-8 w-auto object-contain"
                />
              </Link>
              <div className="flex items-center gap-4">
                 <button className="text-zinc-400 hover:text-zinc-900">
                    <Crown size={20} className="text-primary" />
                 </button>
              </div>
            </div>

            <Sidebar />
            
            <main className="flex-1 lg:pl-64 pb-24 lg:pb-10">
              <div className="mx-auto max-w-5xl p-6 md:p-10">
                {children}
              </div>
            </main>
            
            <MobileNav />
          </div>
        </ModalProvider>
      </body>
    </html>
  );
}
