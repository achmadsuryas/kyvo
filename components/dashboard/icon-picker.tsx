'use client';

import * as React from 'react';
import { PRESET_ICONS } from '@/components/shared/social-icons';
import { cn } from '@/lib/utils';

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
}

export function IconPicker({ selectedIcon, onSelectIcon }: IconPickerProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-black uppercase text-[#111111]/70">
        Select Icon
      </label>
      <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 p-2.5 rounded-xl border-2 border-[#111111] bg-white max-h-48 overflow-y-auto">
        {PRESET_ICONS.map((item) => {
          const IconComp = item.component;
          const isSelected = selectedIcon.toLowerCase() === item.name.toLowerCase();

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => onSelectIcon(item.name)}
              className={cn(
                'aspect-square p-2.5 rounded-xl border-2 border-[#111111] flex items-center justify-center transition-all cursor-pointer select-none',
                isSelected
                  ? 'bg-[#FFD43B] text-[#111111] shadow-[3px_3px_0px_0px_#111111] scale-105'
                  : 'bg-[#F8F9FA] text-[#111111]/80 hover:bg-[#3B82F6] hover:text-white hover:border-[#111111]'
              )}
              title={item.label}
            >
              <IconComp className="w-5 h-5 flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
