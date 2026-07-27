import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  CheckCircle2, 
  Sparkles,
  AlertTriangle,
  Ban,
  ShieldAlert,
  Home,
} from 'lucide-react';
import { getProfileByUsername } from '@/services/profile';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PublicProfileContainer } from '@/components/profile/public-profile-container';
import { APP_CONFIG } from '@/constants';
import { KyvoLogo } from '@/components/shared/kyvo-logo';

export const dynamic = 'force-dynamic';

interface PublicProfileProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: PublicProfileProps): Promise<Metadata> {
  const resolvedParams = await params;
  const profile = await getProfileByUsername(resolvedParams.username);

  if (!profile) {
    return {
      title: `User Not Found — ${APP_CONFIG.name}`,
    };
  }

  return {
    title: `${profile.display_name || profile.username} (@${profile.username}) — Kyvo`,
    description: profile.bio || `Check out ${profile.display_name}'s social links on Kyvo.`,
  };
}

function isDarkColor(hexColor?: string | null): boolean {
  if (!hexColor || !hexColor.startsWith('#')) return false;
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return false;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance <= 0.5;
}

export default async function PublicProfilePage({ params }: PublicProfileProps) {
  const resolvedParams = await params;
  const profile = await getProfileByUsername(resolvedParams.username);

  if (!profile) {
    notFound();
  }

  const bgColors = ['bg-[#FFD43B]', 'bg-[#3B82F6] text-white', 'bg-[#FF4D6D] text-white', 'bg-[#51CF66]', 'bg-[#A855F7] text-white'];

  const isBanned = profile.status === 'banned' || profile.status === 'suspended';
  const isWarned = profile.status === 'warned';

  // Verified checkmark appears ONLY if user has been granted Verified Creator badge by admin
  const isVerifiedByAdmin = Boolean(
    profile.badges?.some(
      (b) => b.name.toLowerCase().includes('verified') || b.icon === 'CheckCircle2'
    )
  );

  const outerBgColor = profile.theme_bg_color || '#F8F9FA';
  const isDarkBg = isDarkColor(outerBgColor);

  return (
    <div
      className="min-h-screen flex flex-col justify-between items-center p-3 sm:p-6 font-sans selection:bg-[#FFD43B] transition-colors duration-300"
      style={{ backgroundColor: outerBgColor }}
    >
      {/* Top Header Bar with Custom Favicon Logo */}
      <header className="w-full max-w-sm sm:max-w-md flex items-center justify-between py-1.5">
        <KyvoLogo href="/" size="sm" textColor={isDarkBg ? "text-white" : "text-[#111111]"} />

        <Link href="/login">
          <Button variant="yellow" size="sm" className="text-[11px] font-black h-7 px-2.5 gap-1 shadow-[1.5px_1.5px_0px_0px_#111111]">
            <Sparkles className="w-3 h-3 text-[#FF4D6D]" />
            <span>Create Your Own</span>
          </Button>
        </Link>
      </header>

      {/* ACCOUNT BANNED / SUSPENDED SCREEN (Profile Hidden) */}
      {isBanned ? (
        <main className="w-full max-w-sm sm:max-w-md my-auto">
          <div className="rounded-3xl border-[3.5px] border-[#111111] bg-white p-5 sm:p-6 shadow-[6px_6px_0px_0px_#111111] text-center space-y-5 relative overflow-hidden">
            <div className="flex justify-center">
              <Badge
                variant={isBanned ? 'secondary' : 'default'}
                className={`text-[10px] font-black gap-1 px-2.5 py-0.5 ${isWarned ? 'bg-[#FF922B] text-[#111111]' : ''}`}
              >
                {isBanned ? <Ban className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5 text-[#111111]" />}
                <span>{isBanned ? 'ACCOUNT SUSPENDED / BANNED' : 'OFFICIAL WARNING ISSUED'}</span>
              </Badge>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Avatar
                src={profile.avatar_url}
                fallback={profile.display_name || profile.username}
                size="md"
              />
              <div>
                <h1 className="text-xl font-black text-[#111111]">@{profile.username}</h1>
                <p className="text-xs font-bold text-[#111111]/70">{profile.display_name}</p>
              </div>
            </div>

            <div className={`rounded-2xl border-[2.5px] border-[#111111] p-4 text-left space-y-2 shadow-[3px_3px_0px_0px_#111111] ${
              isBanned ? 'bg-[#FF4D6D]/15' : 'bg-[#FF922B]/20'
            }`}>
              <div className="flex items-center gap-1.5 font-black text-xs text-[#111111]">
                <ShieldAlert className={`w-4 h-4 ${isBanned ? 'text-[#FF4D6D]' : 'text-[#FF922B]'}`} />
                <span>{isBanned ? 'Access Restrictions' : 'Warning Details'}</span>
              </div>
              <p className="text-[11px] font-extrabold text-[#111111]/90 leading-relaxed">
                {isBanned
                  ? 'This creator profile has been suspended by administration for violating Kyvo Terms of Service.'
                  : 'This creator account has received an official administrative warning.'}
              </p>
              
              {profile.status_reason && (
                <div className="pt-1.5 border-t border-black/20 text-[11px] font-black text-[#111111]">
                  <span className="uppercase text-[9px] opacity-70 block">Reason Provided:</span>
                  <span className="underline">{profile.status_reason}</span>
                </div>
              )}
            </div>

            <div className="pt-1">
              <Link href="/">
                <Button variant="yellow" size="sm" className="w-full justify-center font-black gap-1.5 text-xs shadow-[2.5px_2.5px_0px_0px_#111111]">
                  <Home className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Return to Landing Page</span>
                </Button>
              </Link>
            </div>
          </div>
        </main>
      ) : (
        /* SLEEK PUBLIC PROFILE CONTAINER */
        <PublicProfileContainer
          profile={profile}
          isVerifiedByAdmin={isVerifiedByAdmin}
          bgColors={bgColors}
        />
      )}
    </div>
  );
}
