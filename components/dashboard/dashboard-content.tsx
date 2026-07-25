'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, User, Mail, AtSign, CheckCircle2, Edit3, Check, X, Loader2, AlignLeft, ShieldCheck, Upload, Trash2, Camera, Home, QrCode, BarChart3, Link as LinkIcon, AlertTriangle } from 'lucide-react';
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
import { updateUserUsername, checkUsernameAvailable, updateUserProfileDetails, deleteOwnAccount } from '@/actions/profile';
import { toast } from 'sonner';

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
  const email = profile?.email || 'user@kyvo.fun';
  const currentUsername = profile?.username || 'user';
  const role = profile?.role || 'user';

  // Dashboard Tab state ('links' | 'analytics')
  const [activeTab, setActiveTab] = React.useState<'links' | 'analytics'>('links');

  // QR Modal state & Delete Account Modal State
  const [qrOpen, setQrOpen] = React.useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = React.useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false);

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

  // File Upload Handler with Max Size Check (Max 2 MB)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE_MB = 2;
    const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;

    if (file.size > MAX_BYTES) {
      toast.error(`File size exceeds ${MAX_SIZE_MB} MB limit! Please choose a smaller image.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEditAvatarUrl(event.target.result as string);
        toast.success('Profile image selected! Click "Save Profile Changes" to apply.');
      }
    };
    reader.readAsDataURL(file);
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

  return (
    <div className="space-y-8 w-full">
      {/* Full-width Top Banner Header */}
      <div className="rounded-3xl border-[4px] border-[#111111] bg-[#FFD43B] p-6 md:p-8 shadow-[8px_8px_0px_0px_#111111] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
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
          <h1 className="text-3xl md:text-4xl font-black text-[#111111]">
            Welcome back, {displayName}!
          </h1>
          <p className="text-base font-extrabold text-[#111111]/80">
            Your Kyvo page is live at <span className="underline font-black text-[#111111]">kyvo.fun/{currentUsername}</span>
          </p>
        </div>

        {/* Top Header Buttons: Landing Page, Share QR Code & Public Profile */}
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/">
            <Button variant="outline" size="lg" className="gap-2 text-base font-black shadow-[4px_4px_0px_0px_#111111]">
              <Home className="w-5 h-5 stroke-[2.5]" />
              <span>Landing Page</span>
            </Button>
          </Link>

          <Button
            onClick={() => setQrOpen(true)}
            variant="purple"
            size="lg"
            className="gap-2 text-base font-black shadow-[4px_4px_0px_0px_#111111]"
          >
            <QrCode className="w-5 h-5 stroke-[2.5]" />
            <span>Share & QR Code</span>
          </Button>

          <Link href={`/${currentUsername}`} target="_blank">
            <Button variant="default" size="lg" className="gap-2 text-base font-black shadow-[4px_4px_0px_0px_#111111]">
              <span>View Public Page</span>
              <ExternalLink className="w-5 h-5 stroke-[3]" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Main 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        {/* Left Column (lg:col-span-7): Account Info + Tab Switcher + Selected Tab Content */}
        <div className="lg:col-span-7 space-y-8 w-full">
          {/* Account Information Card (Overview) */}
          <Card className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] p-6 md:p-8 w-full">
            <CardHeader className="px-0 pt-0 pb-6 border-b-2 border-dashed border-[#111111]/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black">Account Information</CardTitle>
                  <CardDescription className="text-sm font-bold">
                    Customize your display photo, name, username, and bio
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
                    className="gap-1.5 font-black text-xs shadow-[2px_2px_0px_0px_#111111]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </Button>
                ) : (
                  <Badge variant="purple" className="text-xs font-black">
                    EDITING
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="px-0 pt-6 space-y-6">
              {/* Avatar & Display Name Header */}
              <div className="flex items-center gap-5">
                <Avatar src={avatarUrl} fallback={displayName || currentUsername} size="xl" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-[#111111]">{displayName}</h3>
                    {isVerified && (
                      <span title="Verified Creator">
                        <CheckCircle2 className="w-5 h-5 text-[#3B82F6] fill-[#3B82F6] stroke-white" />
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-black text-[#3B82F6] uppercase tracking-wide">
                    kyvo.fun/{currentUsername}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="default" className="text-[10px] font-black">
                      Google Authenticated
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Editable Profile Form */}
              {isEditingDetails ? (
                <form onSubmit={handleUpdateDetails} className="space-y-5 rounded-2xl border-[3px] border-[#111111] bg-[#FFD43B]/20 p-5 shadow-[4px_4px_0px_0px_#111111]">
                  {/* Profile Picture Uploader Section */}
                  <div className="space-y-2 border-b-2 border-dashed border-[#111111]/20 pb-4">
                    <label className="text-xs font-black uppercase text-[#111111] flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#3B82F6]" />
                      <span>Custom Profile Picture (Max 2 MB)</span>
                    </label>
                    
                    <div className="flex items-center gap-4 pt-1">
                      <Avatar src={editAvatarUrl} fallback={editName || currentUsername} size="lg" />
                      
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-[#111111] bg-white text-[#111111] text-xs font-black shadow-[2px_2px_0px_0px_#111111] hover:bg-[#FFD43B] transition-colors">
                            <Upload className="w-3.5 h-3.5 text-[#3B82F6]" />
                            <span>Upload Photo (Max 2MB)</span>
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/webp, image/gif"
                              onChange={handleImageFileChange}
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
                        <p className="text-[10px] font-extrabold text-[#111111]/70">
                          {editAvatarUrl ? 'Custom photo active.' : 'No photo uploaded. Using 2-letter username initial fallback.'}
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
                      disabled={isSaving}
                      className="gap-1 font-black"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                      <span>Save Profile Changes</span>
                    </Button>
                  </div>
                </form>
              ) : (
                /* Profile Info Display Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="rounded-xl border-2 border-[#111111] bg-[#F8F9FA] p-4 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-[#111111]/70">
                      <User className="w-4 h-4 text-[#3B82F6] stroke-[2.5]" />
                      <span>Display Name</span>
                    </div>
                    <p className="text-base font-extrabold text-[#111111]">{displayName}</p>
                  </div>

                  <div className="rounded-xl border-2 border-[#111111] bg-[#FFD43B]/20 p-4 space-y-1">
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
                      <p className="text-base font-extrabold text-[#111111]">@{currentUsername}</p>
                    )}
                  </div>

                  <div className="md:col-span-2 rounded-xl border-2 border-[#111111] bg-[#F8F9FA] p-4 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-[#111111]/70">
                      <Mail className="w-4 h-4 text-[#51CF66] stroke-[2.5]" />
                      <span>Email Address</span>
                    </div>
                    <p className="text-base font-extrabold text-[#111111] truncate">{email}</p>
                  </div>
                </div>
              )}

              {!isEditingDetails && (
                <div className="rounded-xl border-2 border-[#111111] bg-[#F8F9FA] p-4 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-[#111111]/70">
                    <AlignLeft className="w-4 h-4 text-[#A855F7] stroke-[2.5]" />
                    <span>Profile Bio</span>
                  </div>
                  <p className="text-base font-bold text-[#111111] bio-text">{bio}</p>
                </div>
              )}

              {/* DANGER ZONE: DELETE ACCOUNT BUTTON */}
              <div className="pt-4 border-t-2 border-dashed border-[#111111]/20 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-[#FF4D6D] uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Danger Zone</span>
                  </span>
                  <p className="text-xs font-extrabold text-[#111111]/60">
                    Delete account and release username @{currentUsername}
                  </p>
                </div>

                <Button
                  onClick={() => setDeleteAccountOpen(true)}
                  variant="secondary"
                  size="sm"
                  className="font-black text-xs gap-1.5 bg-[#FF4D6D] text-white shadow-[2px_2px_0px_0px_#111111]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* DEDICATED NEOBRUTALISM TAB NAVIGATION BAR BELOW ACCOUNT OVERVIEW */}
          <div className="flex items-center gap-3 border-b-4 border-[#111111] pb-3">
            <button
              onClick={() => setActiveTab('links')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-[3px] border-[#111111] font-black text-sm transition-all cursor-pointer ${
                activeTab === 'links'
                  ? 'bg-[#FFD43B] text-[#111111] shadow-[4px_4px_0px_0px_#111111] -translate-y-0.5 scale-105'
                  : 'bg-white text-[#111111] opacity-70 hover:opacity-100 hover:bg-gray-100'
              }`}
            >
              <LinkIcon className="w-4 h-4 stroke-[2.5]" />
              <span>Links & Profile Manager</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-[3px] border-[#111111] font-black text-sm transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#3B82F6] text-white shadow-[4px_4px_0px_0px_#111111] -translate-y-0.5 scale-105'
                  : 'bg-white text-[#111111] opacity-70 hover:opacity-100 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 stroke-[2.5]" />
              <span>Analytics & Performance</span>
            </button>
          </div>

          {/* TAB CONTENT 1: DEDICATED ANALYTICS SECTION */}
          {activeTab === 'analytics' && (
            <div className="w-full animate-in fade-in slide-in-from-top-2 duration-200">
              <AnalyticsSection profile={profile} links={initialLinks} />
            </div>
          )}

          {/* TAB CONTENT 2: LINKS & BADGES SHOWCASE MANAGER */}
          {activeTab === 'links' && (
            <div className="space-y-8 w-full animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User Badge Equipment Showcase Card */}
              <div className="w-full">
                <UserBadgeShowcase initialUserBadges={userBadgeItems} />
              </div>

              {/* Link Manager Card */}
              <div className="w-full">
                <LinkManager initialLinks={initialLinks} />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dedicated for Kyvo Event / Ads */}
        <div className="lg:col-span-5 space-y-8 w-full sticky top-24">
          <AdBannerCard 
            currentUsername={currentUsername} 
            availableEvents={availableBadges} 
            userBadgeItems={userBadgeItems}
          />
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
