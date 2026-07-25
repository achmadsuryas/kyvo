'use client';

import * as React from 'react';
import QRCode from 'qrcode';
import { QrCode as QrIcon, X, Download, Copy, Check, Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  displayName?: string;
}

export function QRCodeModal({ open, onOpenChange, username, displayName }: QRCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = React.useState<string>('');
  const [copied, setCopied] = React.useState(false);

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${username}`
    : `https://kyvo.fun/${username}`;

  React.useEffect(() => {
    if (open) {
      QRCode.toDataURL(profileUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#111111',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error generating QR Code:', err));
    }
  }, [open, profileUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success('Profile link copied to clipboard! 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link.');
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `kyvo-qr-${username}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('QR Code downloaded successfully! 🚀');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen min-h-screen z-[9999] bg-[#111111]/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-sm bg-white border-[4px] border-[#111111] rounded-3xl p-6 shadow-[8px_8px_0px_0px_#111111] space-y-6 animate-in zoom-in-95 duration-150 relative text-center">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-dashed border-[#111111]/20 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl border-2 border-[#111111] bg-[#FFD43B] text-[#111111] shadow-[2px_2px_0px_0px_#111111]">
              <QrIcon className="w-5 h-5 stroke-[2.5]" />
            </span>
            <h3 className="text-xl font-black text-[#111111]">Share & Scan QR</h3>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-xl border-2 border-[#111111] bg-[#FF4D6D] text-white shadow-[2px_2px_0px_0px_#111111]"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* QR Code Graphic Box */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl border-[3px] border-[#111111] bg-[#FFD43B] shadow-[5px_5px_0px_0px_#111111] inline-block mx-auto">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code for ${username}`}
                className="w-52 h-52 rounded-xl border-2 border-[#111111] bg-white p-2 shadow-[2px_2px_0px_0px_#111111]"
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center font-black text-xs">
                Generating QR...
              </div>
            )}
          </div>

          <div>
            <h4 className="text-lg font-black text-[#111111]">{displayName || `@${username}`}</h4>
            <p className="text-xs font-bold text-[#3B82F6] truncate max-w-xs mx-auto">
              kyvo.fun/{username}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button
            onClick={handleCopyLink}
            variant="default"
            size="sm"
            className="w-full justify-center font-black gap-2 shadow-[3px_3px_0px_0px_#111111]"
          >
            {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Profile Link'}</span>
          </Button>

          <Button
            onClick={handleDownloadQR}
            variant="yellow"
            size="sm"
            className="w-full justify-center font-black gap-2 shadow-[3px_3px_0px_0px_#111111]"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Download QR Code (PNG)</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
