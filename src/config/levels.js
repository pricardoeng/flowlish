/**
 * Unified CEFR Level Configuration
 * Contains colors, labels, and Tailwind classes for consistency across the app.
 */

export const LEVEL_CONFIG = {
  A1: {
    id: 'A1',
    label: 'Beginner | A1',
    ptLabel: 'Iniciante',
    color: '#10B981', // Emerald-500
    bg: 'bg-emerald-500',
    border: 'border-emerald-500/20',
    gradient: 'from-[#10B981] to-[#06B6D4]', // Emerald to Cyan
    glow: 'shadow-[0_0_40px_rgba(16,185,129,0.3)]',
    text: 'text-emerald-500'
  },
  A2: {
    id: 'A2',
    label: 'Elementary | A2',
    ptLabel: 'Básico',
    color: '#F59E0B', // Amber-500
    bg: 'bg-amber-500',
    border: 'border-amber-500/20',
    gradient: 'from-[#F59E0B] to-[#EF4444]', // Amber to Red
    glow: 'shadow-[0_0_40px_rgba(245,158,11,0.3)]',
    text: 'text-amber-500'
  },
  B1: {
    id: 'B1',
    label: 'Intermediate | B1',
    ptLabel: 'Intermediário',
    color: '#800020', // Burgundy
    bg: 'bg-[#800020]',
    border: 'border-[#800020]/20',
    gradient: 'from-[#800020] to-[#B31B1B]', // Burgundy Gradient
    glow: 'shadow-[0_0_40px_rgba(128,0,32,0.4)]',
    text: 'text-[#800020]'
  },
  B2: {
    id: 'B2',
    label: 'Upper Int | B2',
    ptLabel: 'Avançado Base',
    color: '#8B5CF6', // Violet-500
    bg: 'bg-violet-500',
    border: 'border-violet-500/20',
    gradient: 'from-[#8B5CF6] to-[#D946EF]', // Violet to Fuchsia
    glow: 'shadow-[0_0_40px_rgba(139,92,246,0.3)]',
    text: 'text-violet-500'
  },
  C1: {
    id: 'C1',
    label: 'Advanced | C1',
    ptLabel: 'Avançado',
    color: '#2563EB', // Blue-600
    bg: 'bg-blue-600',
    border: 'border-blue-600/20',
    gradient: 'from-[#2563EB] to-[#1D4ED8]', // Blue to Indigo
    glow: 'shadow-[0_0_40px_rgba(37,99,235,0.4)]',
    text: 'text-blue-600'
  },
  C2: {
    id: 'C2',
    label: 'Proficient | C2',
    ptLabel: 'Proficiente',
    color: '#E11D48', // Rose-600
    bg: 'bg-rose-600',
    border: 'border-rose-600/20',
    gradient: 'from-[#E11D48] to-[#FB7185]', // Rose to Rose-light
    glow: 'shadow-[0_0_40px_rgba(225,29,72,0.4)]',
    text: 'text-rose-600'
  }
};

export const getLevelConfig = (levelId) => {
  return LEVEL_CONFIG[levelId] || LEVEL_CONFIG.A1;
};
