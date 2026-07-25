'use client';

import * as React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void;
  isLoading?: boolean;
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  isLoading = false,
}: AlertDialogProps) {
  if (!open) return null;

  const headerColors = {
    danger: 'bg-[#FF4D6D] text-white',
    warning: 'bg-[#FFD43B] text-[#111111]',
    default: 'bg-[#3B82F6] text-white',
  };

  return (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen min-h-screen z-[9999] bg-[#111111]/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white border-[4px] border-[#111111] rounded-3xl p-6 shadow-[8px_8px_0px_0px_#111111] space-y-6 animate-in zoom-in-95 duration-150 relative">
        {/* Top Header Tag */}
        <div className="flex items-center justify-between border-b-2 border-dashed border-[#111111]/20 pb-4">
          <div className="flex items-center gap-2">
            <span className={`p-2 rounded-xl border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111] ${headerColors[variant]}`}>
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </span>
            <h3 className="text-xl font-black text-[#111111]">{title}</h3>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-xl border-2 border-[#111111] bg-gray-100 hover:bg-[#FF4D6D] hover:text-white transition-colors"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Description Body */}
        <p className="text-sm font-extrabold text-[#111111]/80 leading-relaxed">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t-2 border-dashed border-[#111111]/20">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="font-black"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'secondary' : 'yellow'}
            size="sm"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            disabled={isLoading}
            className="font-black"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
