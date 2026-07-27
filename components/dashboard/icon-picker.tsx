'use client';

import * as React from 'react';
import { PRESET_ICONS } from '@/components/shared/social-icons';
import { cn } from '@/lib/utils';

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
}

export function IconPicker({ selectedIcon, onSelectIcon }: IconPickerProps) {
  const isNoIcon = !selectedIcon || selectedIcon === 'none' || selectedIcon === 'None' || selectedIcon === '';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase text-[#111111]/70">
          Button Icon (Optional)
        </label>
        {isNoIcon && (
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded border border-[#111111] bg-[#F8F9FA] text-[#111111]">
            Text Only (No Icon)
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-9 gap-2 p-2.5 rounded-xl border-2 border-[#111111] bg-white max-h-48 overflow-y-auto">
        {/* Option for No Icon / Text Only */}
        <button
          type="button"
          onClick={() => onSelectIcon('none')}
          className={cn(
            'aspect-square p-2 rounded-xl border-2 border-[#111111] flex flex-col items-center justify-center transition-all cursor-pointer select-none text-[9px] font-black leading-tight',
            isNoIcon
              ? 'bg-[#FF4D6D] text-white shadow-[2px_2px_0px_0px_#111111] scale-105'
              : 'bg-[#F8F9FA] text-[#111111]/70 hover:bg-[#FFD43B] hover:text-[#111111]'
          )}
          title="No Icon (Text Only)"
        >
          <span>No Icon</span>
        </button>

        {PRESET_ICONS.map((item) => {
          const IconComp = item.component;
          const isSelected = !isNoIcon && selectedIcon.toLowerCase() === item.name.toLowerCase();

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
