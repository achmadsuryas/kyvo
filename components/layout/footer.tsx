'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DiscordIcon } from '@/components/shared/social-icons';
import { APP_CONFIG } from '@/constants';
import { KyvoLogo } from '@/components/shared/kyvo-logo';

export function Footer() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      
      if (pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', `#${targetId}`);
        }
      } else {
        e.preventDefault();
        router.push(`/#${targetId}`);
      }
    }
  };

  return (
    <footer className="mt-24 border-t-[3px] border-[#111111] bg-white pt-16 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <KyvoLogo href="/" size="lg" />
          <p className="text-base md:text-lg font-bold text-[#111111]/80 max-w-md">
            {APP_CONFIG.tagline} {APP_CONFIG.description}
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://discord.gg/yrUHcVr2q8"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl border-2 border-[#111111] bg-[#5865F2] text-white shadow-[3px_3px_0px_0px_#111111] hover:-translate-y-1 transition-transform cursor-pointer"
              aria-label="Discord"
            >
              <DiscordIcon className="w-5 h-5 text-white" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-xl font-black uppercase tracking-wider text-[#111111]">
            Product
          </h4>
          <ul className="space-y-2 font-bold text-base text-[#111111]/80">
            <li>
              <a
                href="/#features"
                onClick={(e) => handleNavClick(e, '/#features')}
                className="hover:text-[#3B82F6] hover:underline decoration-2 cursor-pointer"
              >
                Features
              </a>
            </li>
            <li>
              <a
                href="/#faq"
                onClick={(e) => handleNavClick(e, '/#faq')}
                className="hover:text-[#3B82F6] hover:underline decoration-2 cursor-pointer"
              >
                FAQ
              </a>
            </li>
            <li>
              <Link href="/login" className="hover:text-[#3B82F6] hover:underline decoration-2">
                Claim Username
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Policies */}
        <div className="space-y-3">
          <h4 className="text-xl font-black uppercase tracking-wider text-[#111111]">
            Legal & Terms
          </h4>
          <ul className="space-y-2 font-bold text-base text-[#111111]/80">
            <li>
              <Link href="/privacy" className="hover:text-[#3B82F6] hover:underline decoration-2">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-[#3B82F6] hover:underline decoration-2">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t-2 border-dashed border-[#111111]/20 flex flex-col md:flex-row items-center justify-between gap-4 text-center font-bold text-sm">
        <p>© {new Date().getFullYear()} Kyvo Platform. All rights reserved.</p>
      </div>
    </footer>
  );
}
