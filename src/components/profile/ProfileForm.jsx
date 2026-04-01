"use client"
import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { User, Mail, Target, Award, Bell, LogOut, Check, Sparkles, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateUserProfile } from '@/actions/learning';
import { uploadProfilePicture } from '@/actions/auth';
import { useModals } from '@/context/ModalContext';

const ProfileForm = ({ user }) => {
  const { openUpgrade } = useModals();
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    goal: user.goal || 'Regular',
    level: user.currentLevel || 'B2'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(`/uploads/${user.id}.jpg`);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const goals = [
    { id: 'Casual', label: 'Casual', desc: '4 Chunks / dia' },
    { id: 'Regular', label: 'Regular', desc: '8 Chunks / dia' },
    { id: 'Intenso', label: 'Intenso', desc: '12 Chunks / dia' }
  ];

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append("image", file);

    const res = await uploadProfilePicture(formData);
    setIsUploadingPhoto(false);

    if (res.success && res.avatarUrl) {
      setAvatarSrc(res.avatarUrl); // Timestamp ensures cache break
    } else {
      alert("Falha ao salvar a imagem. Tente novamente.");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await updateUserProfile(user.id, formData);
    setIsSaving(false);
    if (res.success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-10">
      {/* Pro Banner */}
      <section className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-orange-600 to-zinc-900 p-8 text-white shadow-premium transition-colors">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-white shadow-lg shadow-primary/20">
              <Sparkles size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight !text-white">Mango Pro Vitalício</h2>
              <p className="text-white/75 font-medium">Acesso ilimitado a +1500 chunks e vozes neurais.</p>
            </div>
          </div>
          <Button 
            variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-zinc-900"
            onClick={openUpgrade}
          >
            Gerenciar Plano
          </Button>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-64 w-64 rounded-full bg-primary/20 blur-3xl group-hover:bg-primary/30 transition-colors"></div>
      </section>

      {/* Profile Form */}
      <section className="rounded-[2.5rem] bg-white dark:bg-zinc-950 p-8 shadow-sm border border-zinc-100 dark:border-zinc-800 transition-colors">
        <div className="space-y-8">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-8 border-b border-zinc-100 dark:border-zinc-800 relative">
            <div 
              className="group relative h-24 w-24 rounded-full border-4 border-zinc-50 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shadow-sm cursor-pointer transition-transform hover:scale-105"
              onClick={() => document.getElementById('profilePhotoUpload').click()}
            >
              <img 
                src={avatarSrc} 
                alt="Profile" 
                className={cn("w-full h-full object-cover", isUploadingPhoto && "opacity-50 blur-sm")}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="absolute inset-0 items-center justify-center hidden bg-zinc-100 dark:bg-zinc-800">
                <User size={32} className="text-zinc-400" />
              </div>

              {/* Upload Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white mb-1" />
                <span className="text-[8px] font-black uppercase text-white tracking-widest">Alterar</span>
              </div>
            </div>
            
            <input 
              id="profilePhotoUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />

            <div>
              <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Sua Foto</h3>
              <p className="text-sm font-medium text-zinc-500">
                {isUploadingPhoto ? "Enviando fotinha nova..." : "Clique na foto para alterar seu avatar atual."}
              </p>
            </div>
          </div>


      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Basic Info */}
        <div className="rounded-[2.5rem] bg-white dark:bg-zinc-900 p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-6 transition-colors">
          <div className="flex items-center gap-2 text-primary">
            <User size={20} />
            <h3 className="font-bold uppercase tracking-widest text-xs">Dados Pessoais</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Nome Completo</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-5 py-4 text-sm font-semibold outline-hidden focus:border-primary focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">E-mail</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-5 py-4 text-sm font-semibold outline-hidden focus:border-primary focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>

        {/* Study Goal */}
        <div className="rounded-[2.5rem] bg-white dark:bg-zinc-900 p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-6 transition-colors">
          <div className="flex items-center gap-2 text-primary">
            <Target size={20} />
            <h3 className="font-bold uppercase tracking-widest text-xs">Meta de Estudo</h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {goals.map(g => (
              <button 
                key={g.id}
                onClick={() => setFormData({...formData, goal: g.id})}
                className={cn(
                  "flex items-center justify-between rounded-2xl p-5 border transition-all text-left",
                  formData.goal === g.id 
                    ? "border-primary bg-primary-light dark:bg-orange-500/10 ring-2 ring-primary/10" 
                    : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-primary/30"
                )}
              >
                <div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">{g.label}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{g.desc}</p>
                </div>
                {formData.goal === g.id && <Check className="text-primary" size={20} />}
              </button>
            ))}
          </div>
        </div>

        {/* Level Selection */}
        <div className="rounded-[2.5rem] bg-white dark:bg-zinc-900 p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-6 lg:col-span-2 transition-colors">
          <div className="flex items-center gap-2 text-primary">
            <Award size={20} />
            <h3 className="font-bold uppercase tracking-widest text-xs">Nível CEFR Atual</h3>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {levels.map(lvl => (
              <button 
                key={lvl}
                onClick={() => setFormData({...formData, level: lvl})}
                className={cn(
                  "flex h-20 items-center justify-center rounded-2xl text-xl font-black transition-all border",
                  formData.level === lvl 
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                    : "bg-white dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 border-zinc-100 dark:border-zinc-800 hover:border-primary/30 dark:hover:border-primary/30 hover:text-primary dark:hover:text-primary"
                )}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 pt-10">
        <Button variant="ghost" className="text-zinc-400">
           <LogOut size={18} /> Sair da conta
        </Button>
        <Button 
          size="lg" 
          onClick={handleSave} 
          disabled={isSaving}
          className={cn(isSaved && "bg-zinc-900 text-white")}
        >
           {isSaving ? "Salvando..." : isSaved ? <><Check size={18} /> Salvo!</> : "Salvar Alterações"}
        </Button>
      </div>
        </div>
      </section>
    </div>
  );
};

export default ProfileForm;
