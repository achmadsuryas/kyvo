'use client';

import * as React from 'react';
import { Share2, QrCode } from 'lucide-react';
import { QRCodeModal } from '@/components/shared/qr-code-modal';

interface ProfileShareButtonProps {
  username: string;
  displayName: string;
}

export function ProfileShareButton({ username, displayName }: ProfileShareButtonProps) {
  const [qrOpen, setQrOpen] = React.useState(false);

  return (
    <>
      <button
        onClick={() => setQrOpen(true)}
        className="w-full pt-4 border-t-2 border-dashed border-[#111111]/20 flex items-center justify-center text-xs font-black text-[#111111] hover:text-[#3B82F6] transition-colors cursor-pointer gap-2"
      >
        <Share2 className="w-4 h-4 text-[#FF4D6D]" />
        <span>Share Profile & Scan QR Code</span>
        <QrCode className="w-4 h-4 text-[#3B82F6]" />
      </button>

      <QRCodeModal
        open={qrOpen}
        onOpenChange={setQrOpen}
        username={username}
        displayName={displayName}
      />
    </>
  );
}
