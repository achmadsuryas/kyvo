import Link from 'next/link';
import { ArrowRight, Sparkles, LayoutDashboard } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion } from '@/components/ui/accordion';
import { HeroMockup } from '@/components/cards/hero-mockup';
import { FeatureCard } from '@/components/cards/feature-card';
import { ClaimUsernameForm } from '@/components/forms/claim-username-form';
import { getCurrentUserProfile } from '@/services/profile';
import { FEATURES, FAQS, APP_CONFIG } from '@/constants';
import { WelcomeScreen } from '@/components/landing/welcome-screen';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const profile = await getCurrentUserProfile();

  return (
    <div className="min-h-screen bg-[#F8F9FA] bg-grid-lines flex flex-col font-sans selection:bg-[#FFD43B] relative overflow-hidden">
      {/* 5-second Neobrutalism Welcome Screen Overlay */}
      <WelcomeScreen />

      {/* Floating Centered Navbar */}
      <Navbar
        user={
          profile
            ? {
                username: profile.username,
                display_name: profile.display_name || profile.username,
                avatar_url: profile.avatar_url || '',
              }
            : null
        }
      />

      {/* Subtle Neobrutalist Floating Background Accent Shapes */}
      <div className="absolute top-28 left-10 w-24 h-24 rounded-full border-[3px] border-[#111111] bg-[#FFD43B]/20 pointer-events-none -z-10 animate-bounce duration-1000 hidden md:block" />
      <div className="absolute top-96 right-12 w-32 h-32 rounded-3xl border-[3px] border-[#111111] bg-[#3B82F6]/15 rotate-12 pointer-events-none -z-10 hidden md:block" />
      <div className="absolute bottom-60 left-1/4 w-20 h-20 rounded-2xl border-[3px] border-[#111111] bg-[#FF4D6D]/20 -rotate-6 pointer-events-none -z-10 hidden md:block" />

      <main className="flex-1">
        {/* HERO SECTION WITH TOP PADDING ADJUSTED FOR FLOATING NAVBAR */}
        <section className="relative pt-28 pb-20 md:pt-36 md:pb-32 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-7xl font-black text-[#111111] tracking-tight leading-[1.05]">
                One Link.{' '}
                <span className="inline-block bg-[#FFD43B] px-3 py-1 rounded-2xl border-[3px] border-[#111111] shadow-[5px_5px_0px_0px_#111111] rotate-[-1deg]">
                  Everywhere.
                </span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#111111]/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {APP_CONFIG.description}
              </p>

              {/* CLAIM USERNAME FORM (Only visible to guest users, hidden when logged in) */}
              {!profile ? (
                <div className="pt-2">
                  <ClaimUsernameForm />
                </div>
              ) : (
                /* Authenticated User Banner */
                <div className="pt-2">
                  <div className="rounded-2xl border-[3px] border-[#111111] bg-[#FFD43B] p-5 text-[#111111] shadow-[5px_5px_0px_0px_#111111] space-y-3 max-w-xl mx-auto lg:mx-0">
                    <div className="flex items-center gap-2 font-black text-base">
                      <Sparkles className="w-5 h-5 text-[#FF4D6D]" />
                      <span>Welcome back, @{profile.username}!</span>
                    </div>
                    <p className="text-sm font-extrabold text-[#111111]/80">
                      You are logged in. Access your dashboard to manage your links, profile bio, and event badges.
                    </p>
                    <Link href="/dashboard" className="block pt-1">
                      <Button variant="default" className="w-full sm:w-auto font-black gap-2 text-base shadow-[3px_3px_0px_0px_#111111]">
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Go to Dashboard</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Interactive Profile Mockup Card */}
            <div className="lg:col-span-5 flex justify-center">
              <HeroMockup />
            </div>
          </div>
        </section>

        {/* FEATURES SECTION WITH DOT GRID BACKGROUND */}
        <section id="features" className="py-20 bg-white bg-grid-dots border-y-[3px] border-[#111111] px-4 md:px-8">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <Badge variant="primary" className="text-sm font-black px-4 py-1.5">
                FEATURES
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-[#111111] tracking-tight">
                Everything You Need to Showcase Yourself
              </h2>
              <p className="text-lg md:text-xl font-bold text-[#111111]/75">
                Designed for creators, professionals, developers, and brands who want a bold, high-converting bio link.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {FEATURES.map((feature, idx) => (
                <FeatureCard key={feature.id} feature={feature} index={idx} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION WITH LINE GRID BACKGROUND */}
        <section id="faq" className="py-24 px-4 md:px-8 max-w-4xl mx-auto relative">
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <Badge variant="secondary" className="text-sm font-black px-4 py-1.5">
                GOT QUESTIONS?
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black text-[#111111]">
                Frequently Asked Questions
              </h2>
              <p className="text-lg font-bold text-[#111111]/75">
                Have questions about Kyvo? Here are answers to common questions.
              </p>
            </div>

            <Accordion items={FAQS} />
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto">
          <div className="rounded-3xl border-[4px] border-[#111111] bg-[#FFD43B] p-8 md:p-14 shadow-[8px_8px_0px_0px_#111111] text-center space-y-6">
            <h2 className="text-4xl md:text-6xl font-black text-[#111111]">
              Ready to Claim Your Kyvo Link?
            </h2>
            <p className="text-xl font-extrabold text-[#111111]/80 max-w-2xl mx-auto">
              Join thousands of creators sharing their world with One Link. Everywhere.
            </p>
            <div className="pt-2 flex justify-center">
              <Link href={profile ? '/dashboard' : '/login'}>
                <Button size="lg" variant="default" className="text-xl font-black px-10 py-6 gap-3">
                  <span>{profile ? 'Go to Your Dashboard' : 'Create Your Free Kyvo Page'}</span>
                  <ArrowRight className="w-6 h-6 stroke-[3]" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
