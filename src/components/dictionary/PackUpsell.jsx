"use client"
import React from 'react';
import { Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const PackUpsell = ({ missingPacks = [], isPro = false }) => {
  if (isPro || missingPacks.length === 0) return null;

  return (
    <section className="relative overflow-hidden rounded-[3rem] bg-zinc-900 p-8 text-white shadow-premium mb-12 border border-zinc-800 transition-colors">
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/30">
            <Sparkles size={12} />
            Expanda sua Biblioteca
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight leading-tight !text-white">
              Desbloqueie +1.200 Chunks especializados
            </h2>
            <p className="text-zinc-400 font-medium">
              Você está vendo apenas o conteúdo básico. Adquira packs por tema ou o acesso total vitalício.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
             {missingPacks.slice(0, 5).map(pack => (
               <span key={pack} className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                 {pack}
               </span>
             ))}
             {missingPacks.length > 5 && (
               <span className="px-3 py-1.5 rounded-xl bg-zinc-800/50 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                 +{missingPacks.length - 5} MAIS
               </span>
             )}
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto min-w-[200px]">
          <Link href="/profile">
            <Button className="w-full bg-primary hover:bg-orange-600 text-white border-0 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 py-6 rounded-2xl font-black uppercase tracking-widest text-xs">
              Ver Loja de Packs <ShoppingBag size={16} strokeWidth={3} />
            </Button>
          </Link>
          <Link href="/profile" className="text-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1">
               Ou vire Pro Vitalício <ArrowRight size={10} />
             </span>
          </Link>
        </div>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
    </section>
  );
};

export default PackUpsell;
