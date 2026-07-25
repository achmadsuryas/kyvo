'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ArrowRight, Sparkles, LayoutDashboard, ExternalLink, LogOut, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { signOut } from '@/actions/auth';
import { NAV_LINKS, APP_CONFIG } from '@/constants';

interface NavbarProps {
  user?: {
    username: string;
    display_name: string;
    avatar_url: string;
  } | null;
}

export function Navbar({ user: initialUser }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const [user, setUser] = React.useState(initialUser);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Fetch current profile if initialUser wasn't provided directly
  React.useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name, avatar_url')
          .eq('id', authUser.id)
          .maybeSingle();

        if (profile) {
          setUser({
            username: (profile as any).username || 'user',
            display_name: (profile as any).display_name || 'Creator',
            avatar_url: (profile as any).avatar_url || '',
          });
        }
      }
    };

    fetchUser();
  }, []);

  // Close user dropdown on outside click
  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Smart Anchor Link Click Handler
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
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-6xl transition-all duration-300">
      {/* Centered Floating Neobrutalism Navbar Container */}
      <div className="rounded-2xl border-[3.5px] border-[#111111] bg-white/95 backdrop-blur-md shadow-[6px_6px_0px_0px_#111111] relative z-50 overflow-visible transition-all">
        {/* Navbar Top Bar */}
        <nav className="px-4 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between">
          {/* Kyvo Favicon Logo & Text */}
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/favicon.svg"
              alt="Kyvo Logo"
              className="w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-105 transition-transform duration-200 drop-shadow-[2px_2px_0px_#111111]"
            />
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#111111] group-hover:scale-105 transition-transform duration-200">
              {APP_CONFIG.name}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 font-black text-sm">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-[#111111] hover:text-[#3B82F6] hover:underline decoration-[2.5px] underline-offset-4 transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop User Menu (Authenticated vs Guest) */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              /* Logged In User Dropdown Menu */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-[2.5px] border-[#111111] bg-[#FFD43B] text-[#111111] shadow-[2.5px_2.5px_0px_0px_#111111] hover:shadow-[4px_4px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 transition-all font-black text-xs cursor-pointer"
                >
                  <Avatar src={user.avatar_url} fallback={user.display_name} size="sm" className="w-7 h-7" />
                  <span className="truncate max-w-[110px]">@{user.username}</span>
                  <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
                </button>

                {/* Dropdown Menu Popup */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border-[3px] border-[#111111] bg-white p-3 shadow-[6px_6px_0px_0px_#111111] space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 border-b-2 border-dashed border-[#111111]/20">
                      <p className="text-[10px] font-black text-[#111111]/60 uppercase">Signed In As</p>
                      <p className="text-xs font-black text-[#111111] truncate">{user.display_name}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-xl border-2 border-[#111111] bg-[#3B82F6] text-white font-extrabold text-xs hover:translate-x-1 transition-transform"
                    >
                      <LayoutDashboard className="w-4 h-4 stroke-[2.5]" />
                      <span>Go to Dashboard</span>
                    </Link>

                    <Link
                      href={`/${user.username}`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-xl border-2 border-[#111111] bg-[#FFD43B] text-[#111111] font-extrabold text-xs hover:translate-x-1 transition-transform"
                    >
                      <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                      <span>My Public Profile</span>
                    </Link>

                    <form action={signOut}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2 p-2 rounded-xl border-2 border-[#111111] bg-[#FF4D6D] text-white font-extrabold text-xs hover:translate-x-1 transition-transform cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 stroke-[2.5]" />
                        <span>Sign Out</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              /* Guest Buttons */
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-extrabold text-xs">
                    Login
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="default" size="sm" className="gap-1.5 font-black text-xs shadow-[2px_2px_0px_0px_#111111]">
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-xl border-[2.5px] border-[#111111] bg-[#FFD43B] shadow-[2.5px_2.5px_0px_0px_#111111] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 stroke-[3]" />
            ) : (
              <Menu className="w-5 h-5 stroke-[3]" />
            )}
          </button>
        </nav>

        {/* Integrated Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-[3px] border-[#111111] bg-[#F8F9FA] p-4 space-y-3 rounded-b-2xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-2.5 font-black text-sm">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleNavClick(e, link.href);
                  }}
                  className="p-3 rounded-xl border-2 border-[#111111] bg-white text-[#111111] hover:bg-[#FFD43B] transition-colors flex items-center justify-between shadow-[2px_2px_0px_0px_#111111] cursor-pointer"
                >
                  <span>{link.label}</span>
                  <Sparkles className="w-4 h-4 text-[#FF4D6D]" />
                </a>
              ))}

              <div className="pt-2 flex flex-col gap-2.5">
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="default" className="w-full justify-center gap-2 text-xs font-black shadow-[2.5px_2.5px_0px_0px_#111111]">
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Go to Dashboard (@{user.username})</span>
                      </Button>
                    </Link>
                    <form action={signOut}>
                      <Button variant="secondary" className="w-full justify-center gap-2 text-xs font-black shadow-[2.5px_2.5px_0px_0px_#111111]">
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </Button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-center text-xs font-black shadow-[2.5px_2.5px_0px_0px_#111111]">
                        Login
                      </Button>
                    </Link>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="default" className="w-full justify-center gap-1.5 text-xs font-black shadow-[2.5px_2.5px_0px_0px_#111111]">
                        <span>Get Started</span>
                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
