import React from 'react';

export default function Loading() {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Search Header Skeleton */}
      <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
        <div className="h-14 w-full md:w-96 bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl" />
      </div>

      {/* Filter Panel Skeleton */}
      <div className="h-20 w-full rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800" />

      {/* Grid Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-44 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm" />
        ))}
      </div>
      
      {/* Pagination Skeleton */}
      <div className="flex justify-center mt-12">
        <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
      </div>
    </div>
  );
}
