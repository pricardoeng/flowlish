"use client";
import React from 'react';
import { cn } from '@/lib/utils';

const Logo = ({ className, size = "md" }) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-4xl"
  };

  return (
    <div className={cn("flex items-center font-black tracking-tighter leading-none select-none transition-all", sizeClasses[size], className)}>
      <span className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent drop-shadow-sm">
        m
        <span className="hidden lg:inline-block md:inline-block">ango</span>
      </span>
      {/* Decorative dot from the provided design reference if desired, or keep it clean */}
      <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-orange-500 hidden lg:block" />
    </div>
  );
};

export default Logo;
