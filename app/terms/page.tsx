import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText, Scale, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '@/constants';

export const metadata: Metadata = {
  title: `Terms of Service — ${APP_CONFIG.name}`,
  description: 'Terms of service and platform usage rules for Kyvo link-in-bio creators.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans selection:bg-[#FFD43B] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-28 pb-16 w-full space-y-8">
        {/* Top Header Banner */}
        <div className="rounded-3xl border-[4px] border-[#111111] bg-[#3B82F6] text-white p-6 md:p-10 shadow-[8px_8px_0px_0px_#111111] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs font-black text-[#111111] gap-1 bg-[#FFD43B]">
                <Scale className="w-3.5 h-3.5 text-[#111111]" />
                <span>PLATFORM RULES & TERMS</span>
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white">
              Terms of Service
            </h1>
            <p className="text-base font-extrabold text-white/90">
              Last updated: July 2026 • Usage agreements for creators & visitors
            </p>
          </div>

          <Link href="/">
            <Button variant="yellow" className="font-black gap-2 shadow-[3px_3px_0px_0px_#111111]">
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>

        {/* Terms Content Card */}
        <div className="rounded-3xl border-[4px] border-[#111111] bg-white p-6 md:p-10 shadow-[8px_8px_0px_0px_#111111] space-y-8 font-bold text-base leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-[#111111] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FFD43B] border-2 border-[#111111]" />
              1. Acceptance of Terms
            </h2>
            <p className="text-[#111111]/80">
              By accessing or creating an account on Kyvo (<span className="underline font-black">kyvo.fun</span>), you agree to comply with and be bound by these Terms of Service and all applicable platform guidelines.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-[#111111] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF4D6D] border-2 border-[#111111]" />
              2. Acceptable Content & Link Guidelines
            </h2>
            <p className="text-[#111111]/80">
              Creators are solely responsible for the links, titles, and bios published on their public page. Kyvo strictly prohibits malicious links, phishing schemes, illegal content, or hate speech. Accounts violating these rules are subject to administrative warnings or permanent bans.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-[#111111] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#51CF66] border-2 border-[#111111]" />
              3. Username Ownership & Reservation
            </h2>
            <p className="text-[#111111]/80">
              Usernames are claimed on a first-come, first-served basis. Kyvo reserves the right to reclaim or reassign usernames in cases of trademark infringement or prolonged account inactivity.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-[#111111] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#A855F7] border-2 border-[#111111]" />
              4. Account Suspension & Administrative Action
            </h2>
            <p className="text-[#111111]/80">
              Platform administrators hold full authority to issue warnings, suspend public profile visibility, or terminate accounts that breach platform standards.
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
