import React from 'react';
import { LayoutGrid, TrendingUp, Sparkles, Award } from 'lucide-react';

export default function Loading() {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          <div className="h-4 w-48 bg-zinc-100 dark:bg-zinc-900 rounded-lg" />
        </div>
        <div className="h-14 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      </div>

      {/* Primary Grid Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800" />
        ))}
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800" />
        <div className="h-96 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800" />
      </div>

      {/* Achievements Section Skeleton */}
      <div className="space-y-6">
        <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-40 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800" />
          ))}
        </div>
      </div>
    </div>
  );
}
