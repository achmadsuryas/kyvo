'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Profile } from '@/types';
import { signOut } from '@/actions/auth';
import { KyvoLogo } from '@/components/shared/kyvo-logo';

interface SidebarProps {
  profile: Profile | null;
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

  const displayName = profile?.display_name || 'Kyvo Creator';
  const email = profile?.email || 'creator@kyvo.fun';
  const username = profile?.username || 'user';
  const avatarUrl = profile?.avatar_url || '';
  const isAdmin = profile?.role === 'admin';

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#F8F9FA] border-b-[3px] border-[#111111] p-4 flex items-center justify-between">
        <KyvoLogo href="/" size="sm" />
        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="p-2 rounded-xl border-2 border-[#111111] bg-[#FFD43B] shadow-[2px_2px_0px_0px_#111111]"
          aria-label="Toggle Dashboard Menu"
        >
          {mobileDrawerOpen ? <X className="w-6 h-6 stroke-[3]" /> : <Menu className="w-6 h-6 stroke-[3]" />}
        </button>
      </div>

      {/* Desktop Sidebar Container */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 left-0 bg-white border-r-[3px] border-[#111111] p-6 justify-between z-30">
        <div className="space-y-8">
          {/* Brand Logo */}
          <div className="pt-2">
            <KyvoLogo href="/" size="md" />
          </div>

          {/* User Brief Info Card */}
          <div className="rounded-2xl border-[3px] border-[#111111] bg-[#FFD43B]/20 p-4 flex items-center gap-3 shadow-[3px_3px_0px_0px_#111111]">
            <Avatar src={avatarUrl} fallback={displayName || username} size="sm" />
            <div className="overflow-hidden space-y-0.5">
              <div className="flex items-center gap-1">
                <h4 className="text-sm font-black text-[#111111] truncate">{displayName}</h4>
              </div>
              <p className="text-xs font-bold text-[#111111]/70 truncate">@{username}</p>
              {isAdmin && (
                <Badge variant="purple" className="text-[9px] font-black px-1.5 py-0.5">
                  ADMIN
                </Badge>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between p-3.5 rounded-xl border-[3px] border-[#111111] font-extrabold text-sm transition-all ${
                    isActive
                      ? 'bg-[#3B82F6] text-white shadow-[4px_4px_0px_0px_#111111]'
                      : 'bg-white text-[#111111] shadow-[3px_3px_0px_0px_#111111] hover:bg-[#F8F9FA] hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions Section (Admin Control placed right above Sign Out) */}
        <div className="space-y-3">
          {isAdmin && (
            <Link
              href="/dashboard/admin"
              className={`flex items-center justify-between p-3.5 rounded-xl border-[3px] border-[#111111] font-extrabold text-sm transition-all shadow-[4px_4px_0px_0px_#111111] ${
                pathname === '/dashboard/admin'
                  ? 'bg-[#A855F7] text-white'
                  : 'bg-[#A855F7] text-white hover:bg-[#A855F7]/90 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                <span>Admin Control</span>
              </div>
              <Badge variant="default" className="text-[9px] font-black text-[#111111]">
                ADMIN
              </Badge>
            </Link>
          )}

          <form action={signOut}>
            <Button
              type="submit"
              variant="secondary"
              className="w-full justify-center gap-2 border-[3px] border-[#111111] py-6 font-black shadow-[4px_4px_0px_0px_#111111]"
            >
              <LogOut className="w-5 h-5 stroke-[3]" />
              <span>Sign Out</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile Drawer (Visible when open) */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#111111]/50 backdrop-blur-none flex justify-end">
          <div className="w-4/5 max-w-xs bg-white border-l-[3px] border-[#111111] h-full p-6 flex flex-col justify-between shadow-[-6px_0px_0px_0px_#111111]">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <KyvoLogo href="/" size="sm" />
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-2 rounded-xl border-2 border-[#111111] bg-[#FF4D6D] text-white"
                >
                  <X className="w-5 h-5 stroke-[3]" />
                </button>
              </div>

              <div className="rounded-2xl border-[3px] border-[#111111] bg-[#FFD43B]/20 p-4 flex items-center gap-3">
                <Avatar src={avatarUrl} fallback={displayName || username} size="sm" />
                <div className="overflow-hidden">
                  <h4 className="text-sm font-black truncate">{displayName}</h4>
                  <p className="text-xs font-bold text-[#111111]/70 truncate">{email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className="flex items-center gap-3 p-3.5 rounded-xl border-[3px] border-[#111111] bg-white font-extrabold text-sm shadow-[3px_3px_0px_0px_#111111]"
                    >
                      <Icon className="w-5 h-5 stroke-[2.5]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-2">
              {isAdmin && (
                <Link
                  href="/dashboard/admin"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-xl border-[3px] border-[#111111] bg-[#A855F7] text-white font-extrabold text-sm shadow-[3px_3px_0px_0px_#111111]"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                    <span>Admin Control</span>
                  </div>
                  <Badge variant="default" className="text-[9px] font-black text-[#111111]">
                    ADMIN
                  </Badge>
                </Link>
              )}

              <form action={signOut}>
                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full justify-center gap-2 border-[3px] border-[#111111]"
                >
                  <LogOut className="w-5 h-5 stroke-[3]" />
                  <span>Sign Out</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
