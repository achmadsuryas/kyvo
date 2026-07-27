'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

interface InteractiveAvatarProps {
  src: string | null;
  fallback: string;
  displayName: string;
}

export function InteractiveAvatar({
  src,
  fallback,
  displayName,
}: InteractiveAvatarProps) {
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <>
      {/* Clean Compact Clickable Profile Picture */}
      <button
        onClick={() => setModalOpen(true)}
        type="button"
        className="group relative p-1 rounded-full border-[3px] border-[#111111] bg-[#FFD43B] shadow-[3px_3px_0px_0px_#111111] hover:scale-105 transition-transform duration-200 cursor-pointer"
        title="Click to view photo clearly"
      >
        <Avatar
          src={src}
          fallback={fallback}
          size="lg"
          className="w-20 h-20 sm:w-24 sm:h-24 ring-2 ring-white"
        />
      </button>

      {/* CLEAN LARGE PROFILE PHOTO LIGHTBOX MODAL */}
      {modalOpen && (
        <div 
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen min-h-screen z-[9999] bg-[#111111]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative bg-white border-[4px] border-[#111111] rounded-3xl p-4 md:p-6 shadow-[10px_10px_0px_0px_#111111] max-w-sm w-full animate-in zoom-in-95 duration-150 flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute -top-3 -right-3 p-2 rounded-2xl border-[3px] border-[#111111] bg-[#FF4D6D] text-white shadow-[3px_3px_0px_0px_#111111] hover:scale-110 transition-transform cursor-pointer z-10"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>

            {/* Clear Large Profile Photo Image View */}
            <div className="w-64 h-64 md:w-72 md:h-72 rounded-2xl border-[3.5px] border-[#111111] bg-[#FFD43B] p-2 shadow-[4px_4px_0px_0px_#111111] overflow-hidden flex items-center justify-center">
              {src ? (
                <img
                  src={src}
                  alt={displayName}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-[#FFD43B] text-[#111111] font-black text-6xl flex items-center justify-center rounded-xl uppercase">
                  {fallback.slice(0, 2)}
                </div>
              )}
            </div>

            <p className="text-xs font-black text-[#111111]/70 uppercase tracking-wide">
              {displayName}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
