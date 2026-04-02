"use client"
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

const Pagination = ({ currentPage, totalPages }) => {
  const searchParams = useSearchParams();
  
  const createPageUrl = (pageNumber) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `?${params.toString()}`;
  };

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    // Show first, last, and pages around current
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages.push('...');
    }
  }

  // Remove duplicate elipses
  const uniquePages = pages.filter((v, i, a) => v !== '...' || a[i - 1] !== '...');

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2 mt-12 pb-10">
      <Link
        href={currentPage > 1 ? createPageUrl(currentPage - 1) : '#'}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 transition-all",
          currentPage <= 1 ? "pointer-events-none opacity-30" : "hover:border-primary hover:text-primary bg-white dark:bg-zinc-900 shadow-sm"
        )}
      >
        <ChevronLeft size={20} />
      </Link>

      <div className="flex items-center gap-1">
        {uniquePages.map((page, idx) => (
          <React.Fragment key={idx}>
            {page === '...' ? (
              <span className="px-2 text-zinc-400 font-bold select-none">...</span>
            ) : (
              <Link
                href={createPageUrl(page)}
                className={cn(
                  "flex h-10 min-w-10 items-center justify-center px-3 rounded-xl border font-black text-xs transition-all",
                  currentPage === page
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-primary hover:text-primary shadow-sm"
                )}
              >
                {page}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>

      <Link
        href={currentPage < totalPages ? createPageUrl(currentPage + 1) : '#'}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 transition-all",
          currentPage >= totalPages ? "pointer-events-none opacity-30" : "hover:border-primary hover:text-primary bg-white dark:bg-zinc-900 shadow-sm"
        )}
      >
        <ChevronRight size={20} />
      </Link>
    </nav>
  );
};

export default Pagination;
