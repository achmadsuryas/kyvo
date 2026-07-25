'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { checkUsernameAvailable } from '@/actions/profile';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function ClaimUsernameForm() {
  const router = useRouter();
  const [username, setUsername] = React.useState('');
  const [isChecking, setIsChecking] = React.useState(false);
  const [status, setStatus] = React.useState<{ available: boolean; message: string } | null>(null);

  // Debounced live check
  React.useEffect(() => {
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!clean || clean.length < 3) {
      setStatus(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      const res = await checkUsernameAvailable(clean);
      setStatus(res);
      setIsChecking(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (!clean || clean.length < 3) {
      toast.error('Please enter a username with at least 3 characters.');
      return;
    }

    if (status && !status.available) {
      toast.error(status.message);
      return;
    }

    // Save claimed username in cookie for OAuth callback
    document.cookie = `kyvo_claimed_username=${clean}; path=/; max-age=3600; SameSite=Lax`;
    
    toast.success(`Username @${clean} claimed! Redirecting to sign in...`);
    router.push(`/login?claimed=${clean}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="text-center space-y-1">
        <h3 className="text-xl md:text-2xl font-black text-[#111111] flex items-center justify-center gap-2">
          <span>Claim your profile and create an account in minutes!</span>
          <Sparkles className="w-5 h-5 text-[#FF4D6D] fill-[#FF4D6D]" />
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="rounded-2xl border-[4px] border-[#111111] bg-white p-2 shadow-[6px_6px_0px_0px_#111111] flex flex-col sm:flex-row items-center gap-2 transition-all">
          {/* Prefix + Input */}
          <div className="flex-1 w-full flex items-center px-4 py-2 font-black text-lg md:text-xl text-[#111111]">
            <span className="text-[#111111]/50 flex-shrink-0 select-none">
              kyvo.fun/
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="username"
              maxLength={20}
              className="w-full bg-transparent border-none outline-none font-black text-[#111111] placeholder:text-[#111111]/30 px-1 focus:ring-0"
            />
            {isChecking && (
              <Loader2 className="w-5 h-5 animate-spin text-[#3B82F6] flex-shrink-0" />
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="purple"
            size="lg"
            disabled={isChecking || (status !== null && !status.available)}
            className="w-full sm:w-auto px-8 py-4 text-lg font-black gap-2 shadow-[3px_3px_0px_0px_#111111] hover:shadow-[5px_5px_0px_0px_#111111]"
          >
            <span>Claim Now</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </Button>
        </div>

        {/* Real-time Status Feedback */}
        {status && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200">
            {status.available ? (
              <div className="inline-flex items-center gap-2 rounded-xl border-2 border-[#111111] bg-[#51CF66] px-4 py-2 text-sm font-black text-[#111111] shadow-[2px_2px_0px_0px_#111111]">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                <span>{status.message} Click "Claim Now" to secure it!</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-xl border-2 border-[#111111] bg-[#FF4D6D] px-4 py-2 text-sm font-black text-white shadow-[2px_2px_0px_0px_#111111]">
                <AlertTriangle className="w-4 h-4 stroke-[3]" />
                <span>{status.message} Please try a different username.</span>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
