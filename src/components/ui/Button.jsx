import React from 'react';
import { cn } from '@/lib/utils';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  ...props 
}) => {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm active:scale-95',
    secondary: 'bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 active:scale-95',
    outline: 'bg-transparent text-primary border-2 border-primary hover:bg-primary-light active:scale-95',
    ghost: 'bg-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-bold',
    md: 'px-5 py-2.5 text-sm font-bold',
    lg: 'px-8 py-4 text-base font-black uppercase tracking-widest',
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 focus:outline-hidden",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
