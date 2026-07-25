'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (
      (i === currentPage - 2 && i > 1) ||
      (i === currentPage + 2 && i < totalPages)
    ) {
      pages.push('...');
    }
  }

  // Remove duplicate '...' entries
  const cleanPages = pages.filter((item, index) => item !== '...' || pages[index - 1] !== '...');

  return (
    <nav className="flex items-center justify-center gap-2 pt-4 select-none">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="gap-1 font-black shadow-[3px_3px_0px_0px_#111111]"
      >
        <ChevronLeft className="w-4 h-4 stroke-[3]" />
        <span className="hidden sm:inline">Prev</span>
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5">
        {cleanPages.map((page, idx) => {
          if (typeof page === 'string') {
            return (
              <span key={`dots-${idx}`} className="px-2 font-black text-sm text-[#111111]/60">
                ...
              </span>
            );
          }

          const isActive = currentPage === page;

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 rounded-xl border-[2.5px] border-[#111111] font-black text-xs transition-all flex items-center justify-center cursor-pointer ${
                isActive
                  ? 'bg-[#FFD43B] text-[#111111] shadow-[3px_3px_0px_0px_#111111] scale-105'
                  : 'bg-white text-[#111111] hover:bg-[#F8F9FA] shadow-[2px_2px_0px_0px_#111111]'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="gap-1 font-black shadow-[3px_3px_0px_0px_#111111]"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4 stroke-[3]" />
      </Button>
    </nav>
  );
}
