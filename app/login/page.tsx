import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { GoogleLoginForm } from '@/components/forms/google-login-form';
import { Badge } from '@/components/ui/badge';
import { APP_CONFIG } from '@/constants';

interface LoginPageProps {
  searchParams: Promise<{
    claimed?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedParams = await searchParams;
  const claimedUsername = resolvedParams.claimed;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-4 selection:bg-[#FFD43B]">
      {/* Back to Home Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 font-black text-sm text-[#111111] p-3 rounded-xl border-[3px] border-[#111111] bg-white shadow-[3px_3px_0px_0px_#111111] hover:bg-[#FFD43B] transition-colors"
      >
        <ArrowLeft className="w-5 h-5 stroke-[3]" />
        <span>Back to Kyvo</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Neobrutalism Login Card */}
        <div className="rounded-3xl border-[4px] border-[#111111] bg-white p-8 md:p-10 shadow-[8px_8px_0px_0px_#111111] space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <span className="text-4xl font-black tracking-tight text-[#111111] group-hover:scale-105 transition-transform">
                {APP_CONFIG.name}
              </span>
              <span className="w-3.5 h-3.5 rounded-full bg-[#FF4D6D] border-2 border-[#111111]" />
            </Link>
            
            <div className="flex justify-center">
              <Badge variant="default" className="text-xs font-black">
                1-CLICK AUTH
              </Badge>
            </div>

            <h1 className="text-2xl font-black text-[#111111]">
              Sign in to Kyvo
            </h1>
            <p className="text-sm font-bold text-[#111111]/75">
              Access your dashboard & manage your Kyvo profile
            </p>
          </div>

          {/* Claimed Username Banner */}
          {claimedUsername && (
            <div className="rounded-2xl border-[3px] border-[#111111] bg-[#51CF66] p-4 text-[#111111] shadow-[3px_3px_0px_0px_#111111] space-y-1">
              <div className="flex items-center gap-2 font-black text-sm uppercase">
                <CheckCircle2 className="w-5 h-5 stroke-[3]" />
                <span>Username Reserved</span>
              </div>
              <p className="text-sm font-extrabold">
                You are claiming <span className="underline text-lg">kyvo.fun/{claimedUsername}</span>! Log in with Google to finish setting up your page.
              </p>
            </div>
          )}

          {/* Form Content */}
          <div className="space-y-6">
            <GoogleLoginForm />

            <div className="rounded-xl border-2 border-[#111111] bg-[#FFD43B]/20 p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#3B82F6] flex-shrink-0 mt-0.5 stroke-[2.5]" />
              <p className="text-xs font-bold text-[#111111]/80 leading-relaxed">
                By continuing, your profile will automatically be created on <span className="underline font-extrabold text-[#111111]">kyvo.fun</span> using your Google account details.
              </p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t-2 border-dashed border-[#111111]/20 text-center">
            <p className="text-xs font-extrabold text-[#111111]/60 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#FF4D6D]" />
              <span>One Link. Everywhere.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
