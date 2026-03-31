"use client"
import React from 'react';
import { X, Crown, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';

const UpgradeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePayment = () => {
    window.open('https://buy.stripe.com/test_aFa00j3Acgl4aAI1qc8Zq00', '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-8 shadow-2xl md:p-12 animate-scale-in transition-colors">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-all"
        >
          <X size={24} />
        </button>

        <div className="text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-white shadow-lg shadow-primary/20">
            <Crown size={40} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Vire Pro para sempre</h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium px-4">Acesso vitalício a todo o conteúdo e recursos avançados por um pagamento único.</p>
          </div>

          <div className="space-y-4 py-4">
            {[
              "Acesso a +1500 Chunks exclusivos",
              "Vozes neurais de alta fidelidade",
              "Treino de Shadowing ilimitado",
              "Sem anúncios ou mensalidades"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-left">
                <CheckCircle2 size={20} className="text-primary flex-shrink-0" />
                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{feature}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-zinc-400 font-bold text-lg line-through">R$ 599</span>
              <span className="text-4xl font-black text-zinc-900 dark:text-white">R$ 300</span>
              <span className="rounded-lg bg-emerald-100 dark:bg-emerald-900/40 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Vitalício</span>
            </div>
            <Button size="lg" className="w-full text-lg h-16 shadow-premium" onClick={handlePayment}>
               Comprar Agora
            </Button>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Pagamento seguro via Stripe</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
