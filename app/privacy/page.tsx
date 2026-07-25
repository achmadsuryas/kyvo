import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, FileText, Home } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '@/constants';

export const metadata: Metadata = {
  title: `Privacy Policy — ${APP_CONFIG.name}`,
  description: 'Learn how Kyvo collects, protects, and handles your creator profile data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans selection:bg-[#FFD43B] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-28 pb-16 w-full space-y-8">
        {/* Top Header Banner */}
        <div className="rounded-3xl border-[4px] border-[#111111] bg-[#FFD43B] p-6 md:p-10 shadow-[8px_8px_0px_0px_#111111] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs font-black text-[#111111] gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>LEGAL DOCUMENTATION</span>
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#111111]">
              Privacy Policy
            </h1>
            <p className="text-base font-extrabold text-[#111111]/80">
              Last updated: July 2026 • Your data privacy & security guidelines
            </p>
          </div>

          <Link href="/">
            <Button variant="outline" className="font-black gap-2 shadow-[3px_3px_0px_0px_#111111]">
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>

        {/* Policy Content Card */}
        <div className="rounded-3xl border-[4px] border-[#111111] bg-white p-6 md:p-10 shadow-[8px_8px_0px_0px_#111111] space-y-8 font-bold text-base leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-[#111111] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF4D6D] border-2 border-[#111111]" />
              1. Information We Collect
            </h2>
            <p className="text-[#111111]/80">
              When you register for a Kyvo creator account using Google Authentication or OAuth, we collect basic account credentials including your name, email address, profile photo, and custom username.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-[#111111] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#3B82F6] border-2 border-[#111111]" />
              2. How We Use Your Data
            </h2>
            <p className="text-[#111111]/80">
              Your profile data is strictly used to render your custom Neobrutalism Link-in-Bio page at <span className="underline font-black">kyvo.fun/[username]</span>, manage your creator links, and verify your account status. We do not sell your personal data to third-party advertisers.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-[#111111] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#51CF66] border-2 border-[#111111]" />
              3. Data Security & Storage
            </h2>
            <p className="text-[#111111]/80">
              All profile records and user links are safely protected using enterprise-grade database encryption and Row-Level Security (RLS) policies.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-[#111111] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#A855F7] border-2 border-[#111111]" />
              4. Your Creator Rights
            </h2>
            <p className="text-[#111111]/80">
              You have the complete right to update your profile details, edit or remove any destination link, or delete your creator account at any time through your dashboard settings.
            </p>
          </div>

          {/* Bottom Accent */}
          <div className="pt-6 border-t-2 border-dashed border-[#111111]/20 flex items-center justify-between text-xs font-black text-[#111111]/60">
            <span>© {new Date().getFullYear()} {APP_CONFIG.name} Platform</span>
            <span>One Link. Everywhere.</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
