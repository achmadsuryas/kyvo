'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, Loader2, User, AtSign } from 'lucide-react';
import { Profile } from '@/types';
import { checkUsernameAvailable, completeOnboarding } from '@/actions/profile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { APP_CONFIG } from '@/constants';

interface OnboardingFormProps {
  profile: Profile;
}

export function OnboardingForm({ profile }: OnboardingFormProps) {
  const router = useRouter();

  const defaultUsername = profile.username.startsWith('user_') ? '' : profile.username;
  const [username, setUsername] = React.useState(defaultUsername);
  const [displayName, setDisplayName] = React.useState(profile.display_name || '');
  
  const [isChecking, setIsChecking] = React.useState(false);
  const [availability, setAvailability] = React.useState<{ available: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Debounced Username Availability Check
  React.useEffect(() => {
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (!clean || clean.length < 2) {
      setAvailability(null);
      return;
    }

    setIsChecking(true);
    const timer = setTimeout(async () => {
      const res = await checkUsernameAvailable(clean);
      setAvailability(res);
      setIsChecking(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (!cleanUsername || cleanUsername.length < 2) {
      toast.error('Username must be at least 2 characters long.');
      return;
    }

    if (availability && !availability.available) {
      toast.error(availability.message);
      return;
    }

    setIsSubmitting(true);
    const res = await completeOnboarding({
      username: cleanUsername,
      display_name: displayName || cleanUsername,
    });
    setIsSubmitting(false);

    if (res.success) {
      toast.success(res.message);
      router.push('/dashboard');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="w-full max-w-lg space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border-2 border-[#111111] bg-[#FFD43B] text-[#111111] font-black text-xs uppercase tracking-wide shadow-[3px_3px_0px_0px_#111111]">
          <Sparkles className="w-4 h-4 text-[#FF4D6D]" />
          <span>WELCOME TO {APP_CONFIG.name.toUpperCase()}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-[#111111]">
          Claim Your Username
        </h1>
        <p className="text-base font-extrabold text-[#111111]/75 max-w-md mx-auto">
          Choose your unique URL before accessing your creator dashboard.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="rounded-3xl border-[4px] border-[#111111] bg-white p-6 md:p-8 shadow-[8px_8px_0px_0px_#111111] space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input with Prefix & Status Badge */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-[#111111] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AtSign className="w-4 h-4 text-[#3B82F6]" />
                <span>Your Kyvo Username</span>
              </span>
              {isChecking ? (
                <span className="text-[11px] font-bold text-[#111111]/60 flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking...
                </span>
              ) : availability ? (
                availability.available ? (
                  <span className="text-[11px] font-black text-[#51CF66] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Available!
                  </span>
                ) : (
                  <span className="text-[11px] font-black text-[#FF4D6D] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Taken
                  </span>
                )
              ) : null}
            </label>

            <div className="flex items-center rounded-2xl border-[3px] border-[#111111] bg-[#F8F9FA] overflow-hidden focus-within:ring-2 focus-within:ring-[#3B82F6] shadow-[3px_3px_0px_0px_#111111]">
              <span className="px-4 py-3 bg-[#FFD43B] text-[#111111] font-black text-sm border-r-2 border-[#111111]">
                kyvo.fun/
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="yourusername"
                className="w-full bg-transparent p-3 font-black text-base text-[#111111] outline-none"
                maxLength={20}
                required
                autoFocus
              />
            </div>
            <p className="text-[11px] font-extrabold text-[#111111]/60">
              Only letters, numbers, and underscores allowed (e.g. kyvo.fun/{username || 'username'}).
            </p>
          </div>

          {/* Display Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-[#111111] flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#A855F7]" />
              <span>Display Name</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Achmad Surya"
              className="w-full rounded-2xl border-[3px] border-[#111111] bg-[#F8F9FA] p-3.5 font-bold text-sm text-[#111111] outline-none shadow-[3px_3px_0px_0px_#111111]"
              required
            />
          </div>

          {/* Submit Action Button */}
          <Button
            type="submit"
            disabled={isSubmitting || (availability !== null && !availability.available)}
            variant="default"
            size="lg"
            className="w-full py-6 text-base font-black gap-2 shadow-[4px_4px_0px_0px_#111111]"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Complete Setup & Continue to Dashboard</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
