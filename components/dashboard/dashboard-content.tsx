'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, User, Mail, AtSign, CheckCircle2, Edit3, Check, X, Loader2, AlignLeft, ShieldCheck, Upload, Trash2, Camera, Home, QrCode, BarChart3, Link as LinkIcon, AlertTriangle, Music, Disc, Sparkles, Award, Ban, Palette } from 'lucide-react';
import { Profile, LinkItem, BadgeItem, UserBadgeItem } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { LinkManager } from '@/components/dashboard/link-manager';
import { AdBannerCard } from '@/components/dashboard/ad-banner-card';
import { UserBadgeShowcase } from '@/components/dashboard/user-badge-showcase';
import { AnalyticsSection } from '@/components/dashboard/analytics-section';
import { QRCodeModal } from '@/components/shared/qr-code-modal';
import { updateUserUsername, checkUsernameAvailable, updateUserProfileDetails, deleteOwnAccount, deleteProfileMusic } from '@/actions/profile';
import { getMusicSignedUploadUrl, uploadProfileMusic } from '@/actions/upload-music';
import { signOut } from '@/actions/auth';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

/**
 * Client-Side Instant Image Compressor (Resizes photos to ultra-lightweight ~100KB WebP)
 * (Skipped for animated .gif files so animations are 100% preserved!)
 */
const compressImage = (file: File, maxWidth = 512, maxHeight = 512, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Export compressed WebP or JPEG
        const compressedDataUrl = canvas.toDataURL('image/webp', quality) || canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
  });
};

interface DashboardContentProps {
  profile: Profile | null;
  initialLinks: LinkItem[];
  availableBadges: BadgeItem[];
  userBadgeItems?: UserBadgeItem[];
}

export function DashboardContent({ profile, initialLinks, availableBadges, userBadgeItems = [] }: DashboardContentProps) {
  const router = useRouter();

  const [displayName, setDisplayName] = React.useState(profile?.display_name || 'Kyvo User');
  const [bio, setBio] = React.useState(profile?.bio || 'Welcome to my Kyvo page!');
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(profile?.avatar_url || null);
  const [musicUrl, setMusicUrl] = React.useState<string | null>((profile as any)?.music_url || null);
  const [musicTitle, setMusicTitle] = React.useState<string>((profile as any)?.music_title || '');
  const email = profile?.email || 'user@kyvo.fun';
  const currentUsername = profile?.username || 'user';
  const role = profile?.role || 'user';

  // Dashboard Tab state ('overview' | 'badges' | 'links' | 'analytics')
  const [activeTab, setActiveTab] = React.useState<'overview' | 'badges' | 'links' | 'analytics'>('overview');

  // QR Modal state & Delete Account Modal State
  const [qrOpen, setQrOpen] = React.useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = React.useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false);
  const [isDeletingMusic, setIsDeletingMusic] = React.useState(false);
  const [isSavingTitle, setIsSavingTitle] = React.useState(false);

  // File size error alert message state
  const [fileSizeError, setFileSizeError] = React.useState<string | null>(null);

  // Verified checkmark appears ONLY if user has been granted Verified Creator badge by admin and it is equipped
  const isVerified = userBadgeItems.some(
    (ub) => ub.badge?.name.toLowerCase().includes('verified') && ub.is_displayed !== false
  );

  // Editing states
  const [isEditingUsername, setIsEditingUsername] = React.useState(false);
  const [newUsername, setNewUsername] = React.useState(currentUsername);
  
  const [isEditingDetails, setIsEditingDetails] = React.useState(false);
  const [editName, setEditName] = React.useState(displayName);
  const [editBio, setEditBio] = React.useState(bio);
  const [editAvatarUrl, setEditAvatarUrl] = React.useState<string | null>(avatarUrl);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isCompressing, setIsCompressing] = React.useState(false);
  const [isAudioProcessing, setIsAudioProcessing] = React.useState(false);

  // Theme Cards & Custom Outer Background state
  const [selectedTheme, setSelectedTheme] = React.useState<string>(profile?.theme || 'neobrutalism');
  const [customBgColor, setCustomBgColor] = React.useState<string>(profile?.theme_bg_color || '#F8F9FA');
  const [isSavingTheme, setIsSavingTheme] = React.useState(false);

  const THEME_CARDS = [
    {
      id: 'neobrutalism',
      name: 'Default Neobrutalism',
      description: 'Classic yellow neobrutalism theme',
      previewCardBg: 'bg-white text-[#111111] border-[#111111]',
      accentBg: '#FFD43B',
      defaultOuterBg: '#F8F9FA',
      badgeText: 'DEFAULT',
    },
    {
      id: 'feminine',
      name: 'Cute Pink',
      description: 'Soft pastel pink theme for girls',
      previewCardBg: 'bg-[#FFF0F5] text-[#111111] border-[#FF4D6D]',
      accentBg: '#FF4D6D',
      defaultOuterBg: '#FFE4E1',
      badgeText: 'FEMININE',
    },
    {
      id: 'dark',
      name: 'Cyberpunk Dark',
      description: 'Sleek dark mode theme with purple accents',
      previewCardBg: 'bg-[#18181B] text-white border-[#A855F7]',
      accentBg: '#A855F7',
      defaultOuterBg: '#09090B',
      badgeText: 'DARK',
    },
  ];

  const handleSaveTheme = async (themeId: string, bgCol: string) => {
    setIsSavingTheme(true);
    const res = await updateUserProfileDetails({
      display_name: displayName,
      bio: bio,
      avatar_url: avatarUrl,
      theme: themeId,
      theme_bg_color: bgCol,
    });
    setIsSavingTheme(false);

    if (res.success) {
      toast.success('Theme & Background color updated!');
      setSelectedTheme(themeId);
      setCustomBgColor(bgCol);
      router.refresh();
    } else {
      toast.error(res.message);
    }
  };

  // File Upload Handler with GIF Animation Support & Instant Auto Compression for static images (Max 4.5 MB)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE_MB = 4.5;
    const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;
    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);

    if (file.size > MAX_BYTES) {
      const errorMsg = `⚠️ File size exceeds limit! Selected image (${fileSizeMb} MB) is larger than the 4.5 MB limit. Please upload a file smaller than 4.5 MB.`;
      toast.error(errorMsg, { duration: 6000 });
      setFileSizeError(`Image "${file.name}" is ${fileSizeMb} MB. Maximum allowed limit is 4.5 MB.`);
      e.target.value = '';
      return;
    }

    setFileSizeError(null);

    try {
      setIsCompressing(true);

      const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');

      if (isGif) {
        toast.loading('Processing animated GIF photo...', { id: 'compressing-toast' });
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setEditAvatarUrl(event.target.result as string);
            setIsCompressing(false);
            toast.dismiss('compressing-toast');
            toast.success('Animated GIF photo ready! Click "Save Profile Changes" to apply.');
          }
        };
        reader.readAsDataURL(file);
      } else {
        toast.loading('Optimizing image for super-fast speed...', { id: 'compressing-toast' });
        const compressedDataUrl = await compressImage(file, 512, 512, 0.82);
        setEditAvatarUrl(compressedDataUrl);
        setIsCompressing(false);
        toast.dismiss('compressing-toast');
        toast.success('Photo optimized & compressed! Click "Save Profile Changes" to apply.');
      }
    } catch (err) {
      setIsCompressing(false);
      toast.dismiss('compressing-toast');
      toast.error('Failed to process image file.');
    }
  };

  // Pre-Signed Audio Upload Handler (.mp3, .wav, Max 4.5 MB)
  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE_MB = 4.5;
    const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;
    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);

    if (file.size > MAX_BYTES) {
      const errorMsg = `⚠️ File size exceeds limit! Selected audio track (${fileSizeMb} MB) is larger than the 4.5 MB limit. Please upload an audio file smaller than 4.5 MB.`;
      toast.error(errorMsg, { duration: 6000 });
      setFileSizeError(`Audio track "${file.name}" is ${fileSizeMb} MB. Maximum allowed limit is 4.5 MB.`);
      e.target.value = '';
      return;
    }

    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav'];
    const ext = file.name.toLowerCase().split('.').pop();
    if (!validTypes.includes(file.type) && ext !== 'mp3' && ext !== 'wav') {
      const typeError = 'Invalid audio format! Only .MP3 and .WAV audio files are supported.';
      toast.error(typeError);
      setFileSizeError(typeError);
      e.target.value = '';
      return;
    }

    setFileSizeError(null);

    try {
      setIsAudioProcessing(true);
      toast.loading('Uploading background audio track...', { id: 'audio-toast' });

      let finalMusicUrl = '';

      // TIER 1: Pre-Signed Upload URL (Uploads directly to Supabase S3)
      const signedRes = await getMusicSignedUploadUrl(file.name);

      if (signedRes.success && signedRes.signedUrl && signedRes.path && signedRes.publicUrl) {
        const supabase = createClient();
        let uploadSuccess = false;

        if (signedRes.token) {
          const { error: uploadErr } = await supabase.storage
            .from('avatars')
            .uploadToSignedUrl(signedRes.path, signedRes.token, file);
          
          if (!uploadErr) uploadSuccess = true;
        }

        if (!uploadSuccess) {
          const putRes = await fetch(signedRes.signedUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type || 'audio/mpeg',
              'x-upsert': 'true',
            },
            body: file,
          });

          if (putRes.ok) uploadSuccess = true;
        }

        if (uploadSuccess) {
          finalMusicUrl = signedRes.publicUrl;
        }
      }

      // TIER 2: Server Action Fallback for smaller files
      if (!finalMusicUrl) {
        const formData = new FormData();
        formData.append('file', file);
        const serverRes = await uploadProfileMusic(formData);
        if (serverRes.success && serverRes.music_url) {
          finalMusicUrl = serverRes.music_url;
        } else {
          throw new Error(serverRes.message || 'Cloud storage upload failed.');
        }
      }

      const trackTitle = file.name.replace(/\.[^/.]+$/, '');

      const res = await updateUserProfileDetails({
        display_name: displayName,
        bio: bio,
        avatar_url: avatarUrl,
        music_url: finalMusicUrl,
        music_title: trackTitle,
      });

      setIsAudioProcessing(false);
      toast.dismiss('audio-toast');

      if (res.success) {
        setMusicUrl(finalMusicUrl);
        setMusicTitle(trackTitle);
        toast.success('Background music uploaded & active on public profile!');
        router.refresh();
      } else {
        toast.error(res.message);
        setFileSizeError(res.message);
      }
    } catch (err: any) {
      setIsAudioProcessing(false);
      toast.dismiss('audio-toast');
      const errMsg = err?.message || 'Failed to process audio file.';
      toast.error(errMsg, { duration: 6000 });
      setFileSizeError(errMsg);
    }
  };

  // Save Song Title Change
  const handleSaveSongTitle = async () => {
    if (!musicUrl) return;
    setIsSavingTitle(true);

    const res = await updateUserProfileDetails({
      display_name: displayName,
      bio: bio,
      avatar_url: avatarUrl,
      music_url: musicUrl,
      music_title: musicTitle,
    });
    setIsSavingTitle(false);

    if (res.success) {
      toast.success('Song title saved!');
    } else {
      toast.error(res.message);
    }
  };

  // Direct Quick Remove Music Handler
  const handleRemoveMusicDirect = async () => {
    setIsDeletingMusic(true);
    const res = await deleteProfileMusic();
    setIsDeletingMusic(false);

    if (res.success) {
      toast.success(res.message);
      setMusicUrl(null);
      setMusicTitle('');
    } else {
      toast.error(res.message);
    }
  };

  // Update Username Handler
  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

    if (clean === currentUsername) {
      setIsEditingUsername(false);
      return;
    }

    setIsSaving(true);
    const availability = await checkUsernameAvailable(clean);

    if (!availability.available && clean !== currentUsername) {
      toast.error(availability.message);
      setIsSaving(false);
      return;
    }

    const res = await updateUserUsername(clean);
    setIsSaving(false);

    if (res.success) {
      toast.success(res.message);
      setIsEditingUsername(false);
    } else {
      toast.error(res.message);
    }
  };

  // Update Profile Details Handler
  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error('Display Name cannot be empty.');
      return;
    }

    setIsSaving(true);
    const res = await updateUserProfileDetails({
      display_name: editName,
      bio: editBio,
      avatar_url: editAvatarUrl,
    });
    setIsSaving(false);

    if (res.success) {
      toast.success(res.message);
      setDisplayName(editName);
      setBio(editBio);
      setAvatarUrl(editAvatarUrl);
      setIsEditingDetails(false);
    } else {
      toast.error(res.message);
    }
  };

  // Permanently Delete User Account & Free Up Username
  const handleConfirmDeleteAccount = async () => {
    setIsDeletingAccount(true);
    const res = await deleteOwnAccount();
    setIsDeletingAccount(false);

    if (res.success) {
      toast.success(res.message);
      setDeleteAccountOpen(false);
      router.push('/');
    } else {
      toast.error(res.message);
    }
  };

  // Account Status handling ('active' | 'warned' | 'banned' | 'suspended')
  const accountStatus = (profile?.status || 'active').toLowerCase();
  const statusReason = profile?.status_reason || 'Community Guidelines Review';
  
  // Warning modal open state (opens automatically on load when accountStatus === 'warned')
  const [warningModalOpen, setWarningModalOpen] = React.useState(accountStatus === 'warned');

  React.useEffect(() => {
    if (accountStatus === 'warned') {
      setWarningModalOpen(true);
    }
  }, [accountStatus]);

  if (accountStatus === 'banned' || accountStatus === 'suspended') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <Card className="max-w-xl w-full bg-[#FF4D6D] border-[4px] border-[#111111] shadow-[10px_10px_0px_0px_#111111] p-6 sm:p-10 text-white space-y-6 text-center select-none">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-[3.5px] border-[#111111] bg-white text-[#FF4D6D] mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_#111111]">
            <Ban className="w-10 h-10 stroke-[3]" />
          </div>

          <div className="space-y-2">
            <Badge variant="default" className="text-xs font-black text-[#111111] bg-[#FFD43B] border-2 border-[#111111]">
              ACCOUNT SUSPENDED / BANNED
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Access Restricted
            </h1>
            <p className="text-sm sm:text-base font-extrabold text-white/90">
              Your Kyvo account and profile bio have been suspended by System Administrators.
            </p>
          </div>

          <div className="rounded-2xl border-[3px] border-[#111111] bg-white p-4 text-[#111111] text-left space-y-1 shadow-[3px_3px_0px_0px_#111111]">
            <p className="text-xs font-black text-[#FF4D6D] uppercase tracking-wider">Reason for Suspension:</p>
            <p className="text-sm font-extrabold text-[#111111]">
              "{statusReason}"
            </p>
          </div>

          <p className="text-xs font-bold text-white/80 leading-relaxed">
            Your public link-in-bio page has been disabled from visitors. If you believe this is an error, please contact Kyvo Support.
          </p>

          <form action={signOut} className="pt-2">
            <Button type="submit" variant="default" size="lg" className="w-full font-black text-base py-6 text-[#111111] bg-[#FFD43B] hover:bg-white shadow-[4px_4px_0px_0px_#111111]">
              <span>Sign Out Account</span>
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full overflow-hidden">
      {/* WARNING POPUP MODAL DIALOG (Opens automatically on load/login, closable by user) */}
      <AlertDialog
        open={warningModalOpen}
        onOpenChange={setWarningModalOpen}
        title="⚠️ SYSTEM WARNING NOTICE"
        description={`Notice from System Administration: "${statusReason}". Please make sure your profile bio and content comply with Kyvo Community Guidelines. You can continue using your dashboard normally after acknowledging this notice.`}
        variant="warning"
        confirmText="I Understand & Close"
        cancelText="Close"
        onConfirm={() => setWarningModalOpen(false)}
      />

      {/* Full-width Top Banner Header */}
      <div className="rounded-3xl border-[4px] border-[#111111] bg-[#FFD43B] p-5 sm:p-6 md:p-8 shadow-[8px_8px_0px_0px_#111111] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 w-full">
        <div className="space-y-2 min-w-0 w-full lg:w-auto flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs font-black">
              {role === 'admin' ? 'SYSTEM ADMIN' : 'CREATOR DASHBOARD'}
            </Badge>
            {role === 'admin' && (
              <Badge variant="purple" className="text-xs font-black gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ADMIN ROLE</span>
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111111] break-words">
            Welcome back, {displayName}!
          </h1>
          <p className="text-sm sm:text-base font-extrabold text-[#111111]/80 break-all sm:break-words">
            Your Kyvo page is live at <span className="underline font-black text-[#111111]">kyvo.fun/{currentUsername}</span>
          </p>
        </div>

        {/* Top Header Buttons: Landing Page, Share QR Code & Public Profile */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <Link href="/" className="flex-1 sm:flex-initial">
            <Button variant="outline" size="lg" className="w-full justify-center gap-2 text-xs sm:text-sm font-black shadow-[3px_3px_0px_0px_#111111]">
              <Home className="w-4 h-4 stroke-[2.5]" />
              <span>Landing Page</span>
            </Button>
          </Link>

          <Button
            onClick={() => setQrOpen(true)}
            variant="purple"
            size="lg"
            className="flex-1 sm:flex-initial justify-center gap-2 text-xs sm:text-sm font-black shadow-[3px_3px_0px_0px_#111111]"
          >
            <QrCode className="w-4 h-4 stroke-[2.5]" />
            <span>Share & QR Code</span>
          </Button>

          <Link href={`/${currentUsername}`} target="_blank" className="flex-1 sm:flex-initial">
            <Button variant="default" size="lg" className="w-full justify-center gap-2 text-xs sm:text-sm font-black shadow-[3px_3px_0px_0px_#111111]">
              <span>View Public Page</span>
              <ExternalLink className="w-4 h-4 stroke-[3]" />
            </Button>
          </Link>
        </div>
      </div>

      {/* FILE SIZE OVERFLOW WARNING ALERT BANNER */}
      {fileSizeError && (
        <div className="rounded-2xl border-[3px] border-[#111111] bg-[#FF4D6D] text-white p-4 shadow-[5px_5px_0px_0px_#111111] flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertTriangle className="w-5 h-5 shrink-0 stroke-[2.5]" />
            <p className="text-xs sm:text-sm font-black break-words">{fileSizeError}</p>
          </div>
          <button
            onClick={() => setFileSizeError(null)}
            className="p-1 rounded-lg border-2 border-white bg-black/20 hover:bg-black/40 transition-colors shrink-0"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}

      {/* Main 2-Column Dashboard Grid */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 w-full items-start">
        {/* Right Column / KYVO EVENTS (On Mobile: Rendered FIRST at Top / order-1, On Desktop: Right Sidebar / lg:order-2 lg:col-span-5) */}
        <div className="order-1 lg:order-2 lg:col-span-5 space-y-8 w-full lg:sticky lg:top-24">
          <AdBannerCard 
            currentUsername={currentUsername} 
            availableEvents={availableBadges} 
            userBadgeItems={userBadgeItems}
          />
        </div>

        {/* Left Column / Main Dashboard Tabs (On Mobile: Rendered Below / order-2, On Desktop: Left Main Content / lg:order-1 lg:col-span-7) */}
        <div className="order-2 lg:order-1 lg:col-span-7 space-y-8 w-full min-w-0">
          {/* DEDICATED NEOBRUTALISM 4-TAB NAVIGATION BAR (2 ROWS FILLING FULL WIDTH) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 border-b-4 border-[#111111] pb-4 pt-1 w-full">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center justify-center gap-2 px-3 py-3 rounded-2xl border-[3px] border-[#111111] font-black text-xs sm:text-sm transition-all cursor-pointer w-full ${
                activeTab === 'overview'
                  ? 'bg-[#FFD43B] text-[#111111] shadow-[4px_4px_0px_0px_#111111]'
                  : 'bg-white text-[#111111] opacity-70 hover:opacity-100 hover:bg-gray-100'
              }`}
            >
              <User className="w-4 h-4 stroke-[2.5]" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('badges')}
              className={`flex items-center justify-center gap-2 px-3 py-3 rounded-2xl border-[3px] border-[#111111] font-black text-xs sm:text-sm transition-all cursor-pointer w-full ${
                activeTab === 'badges'
                  ? 'bg-[#A855F7] text-white shadow-[4px_4px_0px_0px_#111111]'
                  : 'bg-white text-[#111111] opacity-70 hover:opacity-100 hover:bg-gray-100'
              }`}
            >
              <Award className="w-4 h-4 stroke-[2.5]" />
              <span>My Badges</span>
            </button>

            <button
              onClick={() => setActiveTab('links')}
              className={`flex items-center justify-center gap-2 px-3 py-3 rounded-2xl border-[3px] border-[#111111] font-black text-xs sm:text-sm transition-all cursor-pointer w-full ${
                activeTab === 'links'
                  ? 'bg-[#FF4D6D] text-white shadow-[4px_4px_0px_0px_#111111]'
                  : 'bg-white text-[#111111] opacity-70 hover:opacity-100 hover:bg-gray-100'
              }`}
            >
              <LinkIcon className="w-4 h-4 stroke-[2.5]" />
              <span>Links</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center justify-center gap-2 px-3 py-3 rounded-2xl border-[3px] border-[#111111] font-black text-xs sm:text-sm transition-all cursor-pointer w-full ${
                activeTab === 'analytics'
                  ? 'bg-[#3B82F6] text-white shadow-[4px_4px_0px_0px_#111111]'
                  : 'bg-white text-[#111111] opacity-70 hover:opacity-100 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 stroke-[2.5]" />
              <span>Analytics</span>
            </button>
          </div>

          {/* TAB CONTENT 1: OVERVIEW (ACCOUNT INFORMATION CARD) */}
          {activeTab === 'overview' && (
            <div className="w-full animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Account Information Card */}
              <Card className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] p-4 sm:p-6 md:p-8 w-full overflow-hidden">
                <CardHeader className="px-0 pt-0 pb-5 border-b-2 border-dashed border-[#111111]/20">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-xl sm:text-2xl font-black break-words">Account Information</CardTitle>
                      <CardDescription className="text-xs sm:text-sm font-bold break-words">
                        Customize your display photo, name, username, bio, and background music
                      </CardDescription>
                    </div>
                    {!isEditingDetails ? (
                      <Button
                        onClick={() => {
                          setEditName(displayName);
                          setEditBio(bio);
                          setEditAvatarUrl(avatarUrl);
                          setIsEditingDetails(true);
                        }}
                        variant="yellow"
                        size="sm"
                        className="gap-1.5 font-black text-xs shadow-[2px_2px_0px_0px_#111111] shrink-0 self-start sm:self-center"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Profile</span>
                      </Button>
                    ) : (
                      <Badge variant="purple" className="text-xs font-black shrink-0 self-start sm:self-center">
                        EDITING
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="px-0 pt-5 space-y-5">
                  {/* Avatar & Display Name Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-5 min-w-0">
                    <Avatar src={avatarUrl} fallback={displayName || currentUsername} size="lg" className="sm:w-16 sm:h-16 shrink-0" />
                    <div className="space-y-1 min-w-0 flex-1 w-full">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <h3 className="text-lg sm:text-2xl font-black text-[#111111] break-words">{displayName}</h3>
                        {isVerified && (
                          <span title="Verified Creator" className="shrink-0">
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#3B82F6] fill-[#3B82F6] stroke-white" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-black text-[#3B82F6] uppercase tracking-wide break-all sm:break-words">
                        kyvo.fun/{currentUsername}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <Badge variant="default" className="text-[10px] font-black shrink-0">
                          Google Authenticated
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Editable Profile Form */}
                  {isEditingDetails ? (
                    <form onSubmit={handleUpdateDetails} className="space-y-5 rounded-2xl border-[3px] border-[#111111] bg-[#FFD43B]/20 p-4 sm:p-5 shadow-[4px_4px_0px_0px_#111111]">
                      {/* Profile Picture Uploader Section */}
                      <div className="space-y-2 border-b-2 border-dashed border-[#111111]/20 pb-4">
                        <label className="text-xs font-black uppercase text-[#111111] flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-[#3B82F6]" />
                          <span>Custom Profile Picture (PNG, JPG, JPEG, GIF - Max 4.5 MB)</span>
                        </label>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                          <Avatar src={editAvatarUrl} fallback={editName || currentUsername} size="lg" className="shrink-0" />
                          
                          <div className="space-y-2 flex-1 min-w-0 w-full">
                            <div className="flex flex-wrap items-center gap-2">
                              <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[#111111] bg-white text-[#111111] text-xs font-black shadow-[2px_2px_0px_0px_#111111] hover:bg-[#FFD43B] transition-colors ${isCompressing ? 'opacity-50 pointer-events-none' : ''}`}>
                                {isCompressing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3B82F6]" /> : <Upload className="w-3.5 h-3.5 text-[#3B82F6]" />}
                                <span>{isCompressing ? 'Processing Image...' : 'Upload Photo (PNG, JPG, GIF)'}</span>
                                <input
                                  type="file"
                                  accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                                  onChange={handleImageFileChange}
                                  disabled={isCompressing}
                                  className="hidden"
                                />
                              </label>

                              {editAvatarUrl && (
                                <button
                                  type="button"
                                  onClick={() => setEditAvatarUrl(null)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 border-[#111111] bg-[#FF4D6D] text-white text-xs font-black shadow-[2px_2px_0px_0px_#111111]"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Use Username Initial</span>
                                </button>
                              )}
                            </div>
                            <p className="text-[10px] font-extrabold text-[#111111]/70 break-words">
                              {editAvatarUrl ? 'Photo active (Supports animated GIFs & static images).' : 'No photo uploaded. Using 2-letter username initial fallback.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase text-[#111111]">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded-xl border-2 border-[#111111] bg-white p-3 font-bold text-sm outline-none"
                          placeholder="Your Display Name"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase text-[#111111]">
                          Profile Bio
                        </label>
                        <textarea
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value)}
                          rows={3}
                          className="w-full rounded-xl border-2 border-[#111111] bg-white p-3 font-bold text-sm outline-none resize-none"
                          placeholder="Tell the world about yourself..."
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingDetails(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="green"
                          size="sm"
                          disabled={isSaving || isCompressing}
                          className="gap-1 font-black"
                        >
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                          <span>Save Profile Changes</span>
                        </Button>
                      </div>
                    </form>
                  ) : (
                    /* Profile Info Display Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div className="rounded-xl border-2 border-[#111111] bg-[#F8F9FA] p-3.5 space-y-0.5 overflow-hidden">
                        <div className="flex items-center gap-2 text-xs font-black uppercase text-[#111111]/70">
                          <User className="w-4 h-4 text-[#3B82F6] stroke-[2.5]" />
                          <span>Display Name</span>
                        </div>
                        <p className="text-sm sm:text-base font-extrabold text-[#111111] break-words">{displayName}</p>
                      </div>

                      <div className="rounded-xl border-2 border-[#111111] bg-[#FFD43B]/20 p-3.5 space-y-0.5 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-black uppercase text-[#111111]/70">
                            <AtSign className="w-4 h-4 text-[#FF4D6D] stroke-[2.5]" />
                            <span>Username</span>
                          </div>
                          {!isEditingUsername && (
                            <button
                              onClick={() => setIsEditingUsername(true)}
                              className="text-xs font-black underline text-[#3B82F6] flex items-center gap-1 hover:text-[#111111]"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Change</span>
                            </button>
                          )}
                        </div>

                        {isEditingUsername ? (
                          <form onSubmit={handleUpdateUsername} className="flex items-center gap-2 pt-1">
                            <span className="text-sm font-black text-[#111111]/60">@</span>
                            <input
                              type="text"
                              value={newUsername}
                              onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                              className="w-full rounded-lg border-2 border-[#111111] bg-white px-2 py-1 text-sm font-black text-[#111111] outline-none"
                              maxLength={20}
                              autoFocus
                            />
                            <button
                              type="submit"
                              disabled={isSaving}
                              className="p-1.5 rounded-lg border-2 border-[#111111] bg-[#51CF66] text-[#111111] shadow-[2px_2px_0px_0px_#111111]"
                            >
                              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingUsername(false);
                                setNewUsername(currentUsername);
                              }}
                              className="p-1.5 rounded-lg border-2 border-[#111111] bg-[#FF4D6D] text-white shadow-[2px_2px_0px_0px_#111111]"
                            >
                              <X className="w-4 h-4 stroke-[3]" />
                            </button>
                          </form>
                        ) : (
                          <p className="text-sm sm:text-base font-extrabold text-[#111111] break-all sm:break-words">@{currentUsername}</p>
                        )}
                      </div>

                      <div className="md:col-span-2 rounded-xl border-2 border-[#111111] bg-[#F8F9FA] p-3.5 space-y-0.5 overflow-hidden">
                        <div className="flex items-center gap-2 text-xs font-black uppercase text-[#111111]/70">
                          <Mail className="w-4 h-4 text-[#51CF66] stroke-[2.5]" />
                          <span>Email Address</span>
                        </div>
                        <p className="text-sm sm:text-base font-extrabold text-[#111111] break-all">{email}</p>
                      </div>
                    </div>
                  )}

                  {!isEditingDetails && (
                    <div className="rounded-xl border-2 border-[#111111] bg-[#F8F9FA] p-3.5 space-y-0.5">
                      <div className="flex items-center gap-2 text-xs font-black uppercase text-[#111111]/70">
                        <AlignLeft className="w-4 h-4 text-[#A855F7] stroke-[2.5]" />
                        <span>Profile Bio</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-[#111111] bio-text break-words">{bio}</p>
                    </div>
                  )}

                  {/* PUBLIC PROFILE BACKGROUND COLOR SELECTOR WIDGET */}
                  {!isEditingDetails && (
                    <div className="rounded-2xl border-[2.5px] border-[#111111] bg-white p-4 shadow-[4px_4px_0px_0px_#111111] space-y-3 w-full min-w-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-dashed border-[#111111]/20 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Palette className="w-5 h-5 text-[#3B82F6] stroke-[2.5]" />
                            <h4 className="text-sm font-black text-[#111111]">Background Color</h4>
                          </div>
                          <p className="text-xs font-bold text-[#111111]/70">
                            Customize the background color for your public profile page
                          </p>
                        </div>
                        
                        <Button
                          onClick={() => handleSaveTheme('default', customBgColor)}
                          disabled={isSavingTheme}
                          variant="yellow"
                          size="sm"
                          className="font-black text-xs gap-1 shadow-[2px_2px_0px_0px_#111111] shrink-0"
                        >
                          {isSavingTheme ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          <span>Save Background Color</span>
                        </Button>
                      </div>

                      {/* Background Color Picker & Presets */}
                      <div className="rounded-xl border-2 border-[#111111] bg-[#F8F9FA] p-3 space-y-2.5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <label className="text-xs font-black uppercase text-[#111111]/80 flex items-center gap-1.5">
                            <Palette className="w-3.5 h-3.5 text-[#A855F7]" />
                            <span>Select Color</span>
                          </label>
                          
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={customBgColor}
                              onChange={(e) => setCustomBgColor(e.target.value)}
                              className="w-8 h-8 rounded-lg border-2 border-[#111111] cursor-pointer bg-transparent p-0"
                              title="Choose custom background color"
                            />
                            <span className="text-xs font-black text-[#111111] uppercase bg-white px-2.5 py-1 rounded-md border border-[#111111] shadow-[1px_1px_0px_0px_#111111]">
                              {customBgColor}
                            </span>
                            <button
                              type="button"
                              onClick={() => setCustomBgColor('#F8F9FA')}
                              className="text-[10px] font-black underline text-[#3B82F6] hover:text-[#111111]"
                            >
                              Reset Default
                            </button>
                          </div>
                        </div>

                        {/* Quick Color Preset Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-black/10">
                          <span className="text-[10px] font-black text-[#111111]/60">Presets:</span>
                          {['#F8F9FA', '#FFE4E1', '#09090B', '#FFD43B', '#3B82F6', '#51CF66', '#A855F7', '#FF4D6D'].map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => setCustomBgColor(hex)}
                              className="w-5 h-5 rounded-full border border-[#111111] shadow-[1px_1px_0px_0px_#111111] transition-transform hover:scale-110 cursor-pointer"
                              style={{ backgroundColor: hex }}
                              title={hex}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CLEAN DEDICATED PROFILE BACKGROUND MUSIC WIDGET */}
                  {!isEditingDetails && (
                    <div className="rounded-2xl border-[2.5px] border-[#111111] bg-[#A855F7]/15 p-3.5 sm:p-4 shadow-[4px_4px_0px_0px_#111111] space-y-3 w-full min-w-0 overflow-hidden">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full min-w-0">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 w-full sm:w-auto">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 border-[#111111] bg-[#A855F7] text-white flex items-center justify-center shadow-[2px_2px_0px_0px_#111111] shrink-0">
                            {musicUrl ? <Disc className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Music className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-black text-[#111111] break-words">Profile Background Music</h4>
                            </div>
                            <p className="text-[11px] sm:text-xs font-bold text-[#111111]/70 break-words">
                              {musicUrl ? `Track: "${musicTitle || 'Custom Audio'}"` : 'No background music uploaded (Max 4.5 MB)'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                          <label className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[#111111] bg-white text-[#111111] text-xs font-black shadow-[2px_2px_0px_0px_#111111] hover:bg-[#FFD43B] hover:text-[#111111] transition-colors w-full sm:w-auto ${isAudioProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
                            {isAudioProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-[#3B82F6]" />}
                            <span>{musicUrl ? 'Change Track' : 'Upload Track (.MP3 / .WAV)'}</span>
                            <input
                              type="file"
                              accept="audio/mp3, audio/mpeg, audio/wav, audio/x-wav"
                              onChange={handleAudioFileChange}
                              disabled={isAudioProcessing}
                              className="hidden"
                            />
                          </label>

                          {musicUrl && (
                            <button
                              onClick={handleRemoveMusicDirect}
                              disabled={isDeletingMusic}
                              className="p-2 rounded-xl border-2 border-[#111111] bg-[#FF4D6D] text-white shadow-[2px_2px_0px_0px_#111111] hover:scale-105 transition-transform shrink-0"
                              title="Remove Song & Clean Storage"
                            >
                              {isDeletingMusic ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {musicUrl && (
                        <div className="pt-2 border-t border-black/15 space-y-2 w-full">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                            <input
                              type="text"
                              value={musicTitle}
                              onChange={(e) => setMusicTitle(e.target.value)}
                              placeholder="Type Song Title (e.g. My Favorite Beat)"
                              className="flex-1 rounded-xl border-2 border-[#111111] bg-white px-3 py-1.5 font-black text-xs text-[#111111] outline-none shadow-[1.5px_1.5px_0px_0px_#111111] w-full"
                            />
                            <button
                              onClick={handleSaveSongTitle}
                              disabled={isSavingTitle}
                              className="px-3 py-1.5 rounded-xl border-2 border-[#111111] bg-[#51CF66] text-[#111111] font-black text-xs shadow-[1.5px_1.5px_0px_0px_#111111] flex items-center justify-center gap-1 shrink-0 w-full sm:w-auto"
                            >
                              {isSavingTitle ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              <span>Save Title</span>
                            </button>
                          </div>
                          <audio controls src={musicUrl} className="w-full h-8 pt-0.5" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* DANGER ZONE: DELETE ACCOUNT BUTTON */}
                  <div className="pt-3 border-t-2 border-dashed border-[#111111]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-black text-[#FF4D6D] uppercase tracking-wider">Danger Zone</h4>
                      <p className="text-[11px] font-bold text-[#111111]/70">Permanently delete your account and release username @{currentUsername}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteAccountOpen(true)}
                      className="font-black text-xs text-[#FF4D6D] border-2 border-[#FF4D6D] hover:bg-[#FF4D6D] hover:text-white shadow-[2px_2px_0px_0px_#111111] shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Account</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB CONTENT 2: DEDICATED MY BADGES SHOWCASE (SEPARATE TAB) */}
          {activeTab === 'badges' && (
            <div className="w-full animate-in fade-in slide-in-from-top-2 duration-200">
              <UserBadgeShowcase initialUserBadges={userBadgeItems} />
            </div>
          )}

          {/* TAB CONTENT 3: LINKS MANAGER (SEPARATE TAB) */}
          {activeTab === 'links' && (
            <div className="w-full animate-in fade-in slide-in-from-top-2 duration-200">
              <LinkManager initialLinks={initialLinks} />
            </div>
          )}

          {/* TAB CONTENT 4: DEDICATED ANALYTICS SECTION */}
          {activeTab === 'analytics' && (
            <div className="w-full animate-in fade-in slide-in-from-top-2 duration-200">
              <AnalyticsSection profile={profile} links={initialLinks} />
            </div>
          )}
        </div>
      </div>

      {/* QR CODE SHARE MODAL */}
      <QRCodeModal
        open={qrOpen}
        onOpenChange={setQrOpen}
        username={currentUsername}
        displayName={displayName}
      />

      {/* DELETE ACCOUNT ALERT DIALOG MODAL */}
      <AlertDialog
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
        title="Delete Account & Free Username?"
        description={`Are you sure you want to permanently delete your Kyvo account? This will immediately remove all your links, bio, and badges, and release your username @${currentUsername} so anyone else can claim it.`}
        confirmText={isDeletingAccount ? "Deleting..." : "Yes, Delete My Account"}
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDeleteAccount}
      />
    </div>
  );
}
