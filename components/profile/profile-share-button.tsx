'use client';

import * as React from 'react';
import { Share2, QrCode } from 'lucide-react';
import { QRCodeModal } from '@/components/shared/qr-code-modal';

interface ProfileShareButtonProps {
  username: string;
  displayName: string;
  isDarkBg?: boolean;
}

export function ProfileShareButton({ username, displayName, isDarkBg }: ProfileShareButtonProps) {
  const [qrOpen, setQrOpen] = React.useState(false);

  return (
    <>
      <div className="w-full pt-4 flex justify-center">
        <button
          onClick={() => setQrOpen(true)}
          className={`w-full max-w-xs sm:max-w-sm py-2.5 px-4 rounded-xl border-2 border-[#111111] ${
            isDarkBg ? 'bg-[#18181B] text-white hover:bg-[#FFD43B] hover:text-[#111111]' : 'bg-white text-[#111111] hover:bg-[#FFD43B]'
          } shadow-[2.5px_2.5px_0px_0px_#111111] flex items-center justify-center text-xs font-black transition-all cursor-pointer gap-2`}
        >
          <Share2 className="w-4 h-4 text-[#FF4D6D]" />
          <span>Share Profile & Scan QR Code</span>
          <QrCode className="w-4 h-4 text-[#3B82F6]" />
        </button>
      </div>

      <QRCodeModal
        open={qrOpen}
        onOpenChange={setQrOpen}
        username={username}
        displayName={displayName}
      />
    </>
  );
}
