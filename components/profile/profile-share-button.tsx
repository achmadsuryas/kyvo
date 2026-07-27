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
      <div className="w-full pt-2 flex justify-center">
        <button
          onClick={() => setQrOpen(true)}
          className={`inline-flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-black transition-all cursor-pointer hover:opacity-80 ${
            isDarkBg ? 'text-white' : 'text-[#111111]'
          }`}
        >
          <Share2 className="w-4 h-4 text-[#FF4D6D]" />
          <span className="underline decoration-2 underline-offset-4">Share Profile & Scan QR Code</span>
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
