import Link from 'next/link';
import { Home, Sparkles, ArrowLeft, SearchX, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { APP_CONFIG } from '@/constants';
import { KyvoLogo } from '@/components/shared/kyvo-logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-between p-4 md:p-8 font-sans selection:bg-[#FFD43B]">
      {/* Top Header */}
      <header className="w-full max-w-xl flex items-center justify-between py-4">
        <KyvoLogo href="/" size="md" />
      </header>

      {/* Main 404 Error Content Box */}
      <main className="w-full max-w-xl my-auto py-8">
        <div className="rounded-3xl border-[4px] border-[#111111] bg-white p-8 md:p-12 shadow-[10px_10px_0px_0px_#111111] text-center space-y-8 relative overflow-hidden">
          {/* Top Decorative Alert Bar */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border-2 border-[#111111] bg-[#FF4D6D] text-white text-xs font-black shadow-[3px_3px_0px_0px_#111111] uppercase tracking-wider">
            <SearchX className="w-4 h-4" />
            <span>404 NOT FOUND</span>
          </div>

          {/* Large Neobrutalism 404 Graphic Box */}
          <div className="rounded-2xl border-[3px] border-[#111111] bg-[#FFD43B] p-6 shadow-[6px_6px_0px_0px_#111111] space-y-2 max-w-sm mx-auto transform -rotate-1">
            <h1 className="text-7xl font-black text-[#111111] tracking-tight">404</h1>
            <p className="text-base font-extrabold text-[#111111]/90 uppercase tracking-wide">
              Creator / Link Not Found
            </p>
          </div>

          {/* Error Description Text */}
          <div className="space-y-3 max-w-md mx-auto">
            <h2 className="text-2xl font-black text-[#111111]">
              Oops! You stumbled upon an empty link. 🔍
            </h2>
            <p className="text-base font-extrabold text-[#111111]/70 leading-relaxed">
              The Kyvo profile or page you are looking for doesn't exist, may have changed username, or was removed.
            </p>
          </div>

          {/* Helpful Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/" className="w-full sm:w-auto">
              <Button size="lg" variant="default" className="w-full sm:w-auto font-black text-base gap-2.5 shadow-[4px_4px_0px_0px_#111111]">
                <Home className="w-5 h-5 stroke-[2.5]" />
                <span>Back to Home Page</span>
              </Button>
            </Link>

            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-black text-base gap-2.5 shadow-[4px_4px_0px_0px_#111111]">
                <Sparkles className="w-5 h-5 text-[#FF4D6D]" />
                <span>Claim This Username</span>
              </Button>
            </Link>
          </div>

          {/* Footer Card Accent */}
          <div className="pt-4 border-t-2 border-dashed border-[#111111]/20 flex items-center justify-center text-xs font-black text-[#111111]/60 gap-1.5">
            <HelpCircle className="w-4 h-4 text-[#3B82F6]" />
            <span>Need help? Double check the URL spelling or search on Kyvo.</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-xl text-center py-4 text-xs font-black text-[#111111]/60">
        © 2026 {APP_CONFIG.name}. One Link. Everywhere.
      </footer>
    </div>
  );
}
