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
    <div className="flex flex-col gap-4 p-6 rounded-3xl bg-primary-light border border-primary/10">
      <div className="flex items-center gap-2 text-primary">
        <Share2 size={18} />
        <span className="text-xs font-black uppercase tracking-widest">Desafie seus amigos</span>
      </div>
      <p className="text-sm font-medium text-zinc-600">Gostando do progresso? Compartilhe sua jornada!</p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={shareLinkedIn} className="flex-1 bg-white">
          <Linkedin size={16} /> LinkedIn
        </Button>
        <Button variant="secondary" size="sm" onClick={shareInstagram} className="flex-1 bg-white">
          <Instagram size={16} /> Instagram
        </Button>
      </div>
    </div>
  );
};

export default ShareButtons;
