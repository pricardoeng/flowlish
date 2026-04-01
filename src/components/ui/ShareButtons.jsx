"use client"
import React from 'react';
import { Linkedin, Instagram, Share2 } from 'lucide-react';
import Button from '@/components/ui/Button';

const ShareButtons = ({ text = "Estou dominando o inglês com o Mango! 🥭" }) => {
  const url = "https://flowlish.app";
  
  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  const shareInstagram = () => {
    // Instagram doesn't have a direct "share URL" via web API like LinkedIn
    // Usually we just open Instagram or show a "Copied to clipboard" message
    alert("Copiado para o clipboard! Cole no seu Story do Instagram.");
    navigator.clipboard.writeText(`${text} ${url}`);
  };

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950/50 dark:bg-zinc-950/50 p-8 shadow-2xl border border-zinc-800/60 backdrop-blur-sm transition-all hover:scale-[1.01] hover:shadow-primary/5 group">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Share2 size={20} className="drop-shadow-[0_0_8px_rgba(234,88,12,0.4)]" />
            <span className="text-xs font-black uppercase tracking-widest">Desafie seus amigos</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Gostando do seu progresso?</h3>
          <p className="text-sm font-medium text-zinc-400 max-w-md">
            Compartilhe sua jornada de aprendizado no Flowlish e inspire outros a dominarem o inglês também! 🚀
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button 
            onClick={shareLinkedIn}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 border border-zinc-700/50 shadow-lg"
          >
            <Linkedin size={20} className="text-blue-400" />
            <span>Compartilhar</span>
          </button>
          
          <button 
            onClick={shareInstagram}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 border border-zinc-700/50 shadow-lg"
          >
            <Instagram size={20} className="text-pink-500" />
            <span>Story</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareButtons;
