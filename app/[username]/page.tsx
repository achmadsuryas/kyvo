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
import { getBadgeIconComponent } from '@/components/shared/badge-icons';
import { getProfileByUsername } from '@/services/profile';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProfileShareButton } from '@/components/profile/profile-share-button';
import { PublicProfileTracker, TrackedLinkItem } from '@/components/profile/public-profile-tracker';
import { InteractiveAvatar } from '@/components/profile/interactive-avatar';
import { APP_CONFIG } from '@/constants';

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

export default async function PublicProfilePage({ params }: PublicProfileProps) {
  const resolvedParams = await params;
  const profile = await getProfileByUsername(resolvedParams.username);

  if (!profile) {
    notFound();
  }

  const bgColors = ['bg-[#FFD43B]', 'bg-[#3B82F6] text-white', 'bg-[#FF4D6D] text-white', 'bg-[#51CF66]', 'bg-[#A855F7] text-white'];

  const isBanned = profile.status === 'banned';
  const isWarned = profile.status === 'warned';

  // Verified checkmark appears ONLY if user has been granted Verified Creator badge by admin
  const isVerifiedByAdmin = profile.badges?.some(
    (b) => b.name.toLowerCase().includes('verified') || b.icon === 'CheckCircle2'
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between items-center p-3 sm:p-6 font-sans selection:bg-[#FFD43B]">
      {/* Top Header Bar */}
      <header className="w-full max-w-sm sm:max-w-md flex items-center justify-between py-1.5">
        <Link href="/" className="flex items-center gap-1.5 font-black text-xl sm:text-2xl text-[#111111] hover:scale-105 transition-transform">
          <span>{APP_CONFIG.name}</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D6D] border-2 border-[#111111]" />
        </Link>
        <Link href="/login">
          <Button variant="yellow" size="sm" className="text-[11px] font-black h-7 px-2.5 gap-1 shadow-[1.5px_1.5px_0px_0px_#111111]">
            <Sparkles className="w-3 h-3" />
            <span>Create Your Own</span>
          </Button>
        </Link>
      </header>

      {/* ACCOUNT BANNED OR WARNED SCREEN */}
      {isBanned || isWarned ? (
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
        /* SLEEK & COMPACT PUBLIC PROFILE CARD */
        <main className="w-full max-w-sm sm:max-w-md my-4 sm:my-6">
          <div className="rounded-3xl border-[3.5px] border-[#111111] bg-white p-4 sm:p-6 shadow-[6px_6px_0px_0px_#111111] relative overflow-hidden space-y-5">
            {/* Header Decorative Banner */}
            <div className="h-16 sm:h-20 w-full rounded-2xl border-[2.5px] border-[#111111] bg-[#3B82F6] relative overflow-hidden p-3 flex items-start justify-between">
              <PublicProfileTracker profileId={profile.id} initialViews={profile.views_count || 0} />
              
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-[#111111] bg-[#FF4D6D]" />
                <span className="w-2.5 h-2.5 rounded-full border border-[#111111] bg-[#FFD43B]" />
                <span className="w-2.5 h-2.5 rounded-full border border-[#111111] bg-[#51CF66]" />
              </div>
            </div>

            {/* User Info Section */}
            <div className="flex flex-col items-center text-center -mt-12 sm:-mt-14 relative z-10 space-y-2">
              <InteractiveAvatar
                src={profile.avatar_url}
                fallback={profile.display_name || profile.username}
                displayName={profile.display_name || profile.username}
              />
              
              <div className="space-y-0.5">
                <div className="flex items-center justify-center gap-1.5">
                  <h1 className="text-xl sm:text-2xl font-black text-[#111111]">
                    {profile.display_name || profile.username}
                  </h1>
                  {isVerifiedByAdmin && (
                    <span title="Verified Creator">
                      <CheckCircle2 className="w-5 h-5 text-[#3B82F6] fill-[#3B82F6] stroke-white" />
                    </span>
                  )}
                </div>
                <p className="text-xs font-black text-[#3B82F6] uppercase tracking-wide">
                  @{profile.username}
                </p>

                {/* Granted Badges Pills */}
                {profile.badges && profile.badges.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1.5">
                    {profile.badges.map((b) => {
                      const BadgeIcon = getBadgeIconComponent(b.icon);

                      return (
                        <span
                          key={b.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-[#111111] font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_0px_#111111] transition-transform hover:-translate-y-0.5 cursor-default"
                          style={{ backgroundColor: b.bg_color || '#FFD43B', color: b.color || '#111111' }}
                        >
                          <BadgeIcon className="w-3 h-3 stroke-[2.5]" />
                          <span>{b.name}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {profile.bio && (
                <p className="text-xs sm:text-sm font-extrabold text-[#111111]/80 max-w-xs leading-relaxed pt-0.5">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Links List with Click Tracking */}
            <div className="space-y-2.5 pt-1">
              {profile.links.map((link, idx) => (
                <TrackedLinkItem
                  key={link.id}
                  link={link}
                  bgClass={bgColors[idx % bgColors.length]}
                />
              ))}
            </div>

            {/* Share Profile & QR Code Action */}
            <ProfileShareButton username={profile.username} displayName={profile.display_name || profile.username} />
          </div>
        </main>
      )}

      {/* Footer Branding */}
      <footer className="w-full max-w-sm sm:max-w-md text-center py-2 space-y-0.5">
        <p className="text-[11px] font-black text-[#111111]/60">
          Powered by <Link href="/" className="underline font-black text-[#111111]">Kyvo</Link>
        </p>
      </footer>
    </div>
  );
}
