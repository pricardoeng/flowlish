"use client"
import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { User, Mail, Target, Award, Bell, LogOut, Check, Sparkles, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateUserProfile } from '@/actions/learning';
import { uploadProfilePicture } from '@/actions/auth';
import { useModals } from '@/context/ModalContext';
import { getLevelConfig } from '@/config/levels';

const LevelButton = ({ lvl, isSelected, onClick }) => {
  const cfg = getLevelConfig(lvl);
  return (
    <button 
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-20 flex-col items-center justify-center rounded-2xl transition-all border-2",
        isSelected 
          ? "text-white shadow-lg" 
          : "bg-white dark:bg-zinc-950 text-zinc-400 dark:text-zinc-600 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
      )}
      style={isSelected ? { backgroundColor: cfg.color, borderColor: cfg.color, boxShadow: `0 0 20px ${cfg.color}40` } : {}}
    >
      <span className="text-2xl font-black">{lvl}</span>
      <span className="text-[8px] font-black uppercase tracking-widest opacity-80">{cfg.ptLabel}</span>
    </button>
  );
};

const ProfileForm = ({ user }) => {
  const { openUpgrade } = useModals();
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    goal: user.goal || 'Regular',
    level: user.currentLevel || 'B2',
    interests: Array.isArray(user.interests) ? user.interests : [],
    unlockedPacks: Array.isArray(user.unlockedPacks) ? user.unlockedPacks : []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(`/uploads/${user.id}.jpg`);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [selectedPackForPurchase, setSelectedPackForPurchase] = useState(null);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const packCategories = [
    { 
      label: 'Temas Profissionais', 
      packs: ['Tecnologia', 'Medicina', 'Jurídico', 'Financeiro', 'Projetos', 'Engenharia', 'Corporativo'] 
    },
    { 
      label: 'Experiência de Vida', 
      packs: ['Viajar', 'Viver', 'Estudar', 'Trabalhar'] 
    },
    { 
      label: 'Especialidades', 
      packs: ['Avançado', 'Acadêmico'] 
    }
  ];
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

  const confirmPurchase = async () => {
    if (!selectedPackForPurchase) return;
    
    setIsProcessingPurchase(true);
    const res = await unlockPack(user.id, selectedPackForPurchase);
    setIsProcessingPurchase(false);
    
    if (res.success) {
      setFormData(prev => ({
        ...prev,
        unlockedPacks: [...prev.unlockedPacks, selectedPackForPurchase]
      }));
      setSelectedPackForPurchase(null);
    }
  };

  const handleUnlockClick = (pack) => {
    setSelectedPackForPurchase(pack);
  };

  const isPro = user.purchases?.some(p => p.status === 'active' && !p.packId);
  const activePacks = user.unlockedPacks || [];
  const hasIndividualPacks = activePacks.length > 0 && !isPro;

  return (
    <div className="space-y-10">
      {/* Dynamic Plan Banner */}
      <section className={cn(
        "group relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-premium transition-all",
        isPro ? "bg-gradient-to-br from-orange-600 to-zinc-900" : "bg-zinc-900"
      )}>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className={cn(
              "flex h-16 w-16 items-center justify-center rounded-3xl text-white shadow-lg",
              isPro ? "bg-primary shadow-primary/20" : "bg-zinc-800 shadow-black/20"
            )}>
              {isPro ? <Sparkles size={32} /> : <Award size={32} className="text-zinc-400" />}
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight !text-white">
                {isPro ? "Mango Pro Vitalício" : hasIndividualPacks ? "Membro Individual" : "Plano Gratuito"}
              </h2>
              <p className="text-white/75 font-medium">
                {isPro 
                  ? "Acesso ilimitado a +1500 chunks e vozes neurais." 
                  : hasIndividualPacks 
                    ? `Você possui acesso vitalício a ${activePacks.length} packs específicos.` 
                    : "Comece sua jornada com o conteúdo básico gratuito."}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            {!isPro && (
              <Button 
                variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-zinc-900 transition-colors"
                onClick={openUpgrade}
              >
                Upgrade para Pro
              </Button>
            )}
            {isPro && (
               <div className="px-6 py-2 rounded-2xl bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest">
                 Plano Ativo
               </div>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-64 w-64 rounded-full bg-primary/20 blur-3xl group-hover:bg-primary/30 transition-colors"></div>
      </section>

      {/* Packs Adquiridos Summary (If any and not Pro) */}
      {hasIndividualPacks && (
        <section className="rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 p-8 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white">
                 <Check size={24} strokeWidth={3} />
              </div>
              <div>
                <h3 className="font-bold text-emerald-900 dark:text-emerald-400">Packs Adquiridos</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                   {activePacks.map(p => (
                     <span key={p} className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-lg">
                       {p}
                     </span>
                   ))}
                </div>
              </div>
           </div>
        </section>
      )}

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
              <LevelButton 
                key={lvl}
                lvl={lvl}
                isSelected={formData.level === lvl}
                onClick={() => setFormData({...formData, level: lvl})}
              />
            ))}
          </div>
        </div>

        {/* Specialized Packs */}
        <div className="rounded-[2.5rem] bg-white dark:bg-zinc-900 p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-8 lg:col-span-2 transition-colors">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={20} />
            <h3 className="font-bold uppercase tracking-widest text-xs">Packs de Especialidades</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packCategories.map((cat) => (
              <div key={cat.label} className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">{cat.label}</h4>
                <div className="flex flex-col gap-3">
                  {cat.packs.map(pack => {
                    const isSelected = formData.interests.includes(pack);
                    const isUnlocked = formData.unlockedPacks.includes(pack);
                    
                    return (
                      <div key={pack} className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            const newInterests = isSelected
                              ? formData.interests.filter(i => i !== pack)
                              : [...formData.interests, pack];
                            setFormData({ ...formData, interests: newInterests });
                          }}
                          className={cn(
                            "flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all border w-full relative overflow-hidden",
                            isPro || isUnlocked
                              ? "bg-emerald-500/5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                              : isSelected
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-zinc-50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:border-primary/30"
                          )}
                        >
                          <div className="flex items-center gap-2">
                             <span>{pack}</span>
                             {(isPro || isUnlocked) && <span className="text-[8px] font-black uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded-md">ADQUIRIDO</span>}
                          </div>
                          {(isSelected || isPro || isUnlocked) && <Check size={14} strokeWidth={(isPro || isUnlocked) ? 4 : 2} />}
                        </button>
                        
                        {!isPro && !isUnlocked && isSelected && (
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              handleUnlockClick(pack);
                            }}
                            className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 py-2 rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors"
                          >
                            🔓 Desbloquear Premium
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-[10px] text-zinc-500 font-medium italic">
            * Selecione seus interesses para que o Curador Inteligente priorize chunks relevantes para você.
          </p>
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

      {/* Purchase Modal Overlay */}
      {selectedPackForPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="relative w-full max-w-md overflow-hidden rounded-[3rem] bg-white dark:bg-zinc-900 p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-zinc-100 dark:border-zinc-800">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">Desbloquear Pack</h3>
                    <p className="text-zinc-500 font-bold text-sm tracking-tight">{selectedPackForPurchase}</p>
                  </div>
                </div>

                <div className="py-6 border-y border-zinc-100 dark:border-zinc-800 space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Preço Individual</span>
                      <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">R$ 1,00</span>
                   </div>
                   <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                         <Check size={14} className="text-emerald-500" strokeWidth={3} />
                         Acesso vitalício ao tema {selectedPackForPurchase}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                         <Check size={14} className="text-emerald-500" strokeWidth={3} />
                         Selo visual identificando o conteúdo nos cards
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                   <Button 
                     className="w-full py-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
                     onClick={confirmPurchase}
                     disabled={isProcessingPurchase}
                   >
                     {isProcessingPurchase ? "Processando..." : "Finalizar Pagamento (R$ 1,00)"}
                   </Button>
                   <button 
                     onClick={() => {
                        setSelectedPackForPurchase(null);
                        openUpgrade();
                     }}
                     className="w-full text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors py-2"
                   >
                     Ou desbloqueie TUDO com Mango Pro
                   </button>
                   <button 
                     onClick={() => setSelectedPackForPurchase(null)}
                     className="w-full text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-zinc-500 transition-colors"
                   >
                     Cancelar
                   </button>
                </div>
              </div>
              
              {/* Decorative background */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
           </div>
        </div>
      )}
    </div>
  );
};

export default ProfileForm;
