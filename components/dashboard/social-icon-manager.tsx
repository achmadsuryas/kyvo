'use client';

import * as React from 'react';
import { Plus, Trash2, Check, Loader2, Share2, X, Edit3, Send, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { updateUserSocialLinks } from '@/actions/profile';
import { 
  TwitterIcon, 
  InstagramIcon, 
  TiktokIcon, 
  YoutubeIcon, 
  SpotifyIcon, 
  GithubIcon, 
  LinkedinIcon, 
  DiscordIcon, 
  WhatsappIcon 
} from '@/components/shared/social-icons';

const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: InstagramIcon, placeholder: 'username or instagram.com/username' },
  { id: 'twitter', label: 'Twitter / X', icon: TwitterIcon, placeholder: 'username or x.com/username' },
  { id: 'tiktok', label: 'TikTok', icon: TiktokIcon, placeholder: '@username or tiktok.com/@username' },
  { id: 'youtube', label: 'YouTube', icon: YoutubeIcon, placeholder: '@channel or youtube.com/@channel' },
  { id: 'spotify', label: 'Spotify', icon: SpotifyIcon, placeholder: 'Artist URL or Spotify link' },
  { id: 'github', label: 'GitHub', icon: GithubIcon, placeholder: 'username or github.com/username' },
  { id: 'linkedin', label: 'LinkedIn', icon: LinkedinIcon, placeholder: 'username or linkedin.com/in/username' },
  { id: 'discord', label: 'Discord', icon: DiscordIcon, placeholder: 'Discord server link or handle' },
  { id: 'telegram', label: 'Telegram', icon: Send, placeholder: 'username or t.me/username' },
  { id: 'website', label: 'Website / Portfolio', icon: Globe, placeholder: 'https://yourwebsite.com' },
];

interface SocialIconManagerProps {
  socialLinks: Record<string, string>;
  onChangeSocialLinks: (newLinks: Record<string, string>) => void;
}

export function SocialIconManager({ socialLinks, onChangeSocialLinks }: SocialIconManagerProps) {
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [selectedPlatform, setSelectedPlatform] = React.useState('instagram');
  const [inputValue, setInputValue] = React.useState('');

  // Active added social platforms
  const activePlatforms = Object.entries(socialLinks || {}).filter(([_, val]) => Boolean(val && typeof val === 'string' && val.trim()));

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      toast.error('Please enter a URL.');
      return;
    }

    const updated = { ...(socialLinks || {}), [selectedPlatform]: inputValue.trim() };
    onChangeSocialLinks(updated);
    setInputValue('');
    setIsAddOpen(false);
    toast.success(`${currentPlatformObj.label} icon added! Click "Save All Settings" at the top to apply.`);
  };

  const handleRemove = (platformId: string) => {
    const updated = { ...(socialLinks || {}) };
    delete updated[platformId];
    onChangeSocialLinks(updated);
    toast.info('Social icon removed from draft.');
  };

  const currentPlatformObj = SOCIAL_PLATFORMS.find((p) => p.id === selectedPlatform) || SOCIAL_PLATFORMS[0];

  return (
    <div className="rounded-2xl border-[2.5px] border-[#111111] bg-white p-4 sm:p-5 shadow-[4px_4px_0px_0px_#111111] space-y-4 w-full min-w-0">
      {/* Header & Toggle Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-dashed border-[#111111]/20 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#FF4D6D] stroke-[2.5]" />
            <h4 className="text-sm sm:text-base font-black text-[#111111]">Social Media Icons</h4>
          </div>
          <p className="text-xs font-bold text-[#111111]/70 mt-0.5">
            Add your social media links to display on your profile
          </p>
        </div>

        {!isAddOpen && (
          <Button
            type="button"
            onClick={() => {
              setInputValue(socialLinks[selectedPlatform] || '');
              setIsAddOpen(true);
            }}
            variant="yellow"
            size="sm"
            className="font-black text-xs gap-1.5 shadow-[2px_2px_0px_0px_#111111] shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Social Icon</span>
          </Button>
        )}
      </div>

      {/* Add Social Icon Form with Graphical SVG Icon Picker */}
      {isAddOpen && (
        <form onSubmit={handleAddOrUpdate} className="rounded-xl border-2 border-[#111111] bg-[#F8F9FA] p-3.5 space-y-3.5 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-dashed border-[#111111]/20 pb-2">
            <span className="text-xs font-black uppercase text-[#111111]">
              Select Social Icon ({currentPlatformObj.label})
            </span>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="p-1 rounded-lg border border-[#111111] bg-[#FF4D6D] text-white hover:scale-105 transition-transform"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          {/* Visual SVG Icon Picker Grid */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-[#111111]/70">
              Choose Platform Icon
            </label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-2 rounded-xl border-2 border-[#111111] bg-white">
              {SOCIAL_PLATFORMS.map((p) => {
                const IconComp = p.icon;
                const isSelected = selectedPlatform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlatform(p.id);
                      setInputValue(socialLinks[p.id] || '');
                    }}
                    className={`aspect-square p-2 rounded-xl border-2 border-[#111111] flex items-center justify-center transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#FFD43B] text-[#111111] shadow-[2.5px_2.5px_0px_0px_#111111] scale-105'
                        : 'bg-[#F8F9FA] text-[#111111]/80 hover:bg-[#3B82F6] hover:text-white'
                    }`}
                    title={p.label}
                  >
                    <IconComp className="w-5 h-5 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <label className="text-xs font-black uppercase text-[#111111]/70">
              URL
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={currentPlatformObj.placeholder}
              className="w-full rounded-xl border-2 border-[#111111] bg-white p-2.5 font-bold text-xs outline-none focus:border-[#3B82F6]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddOpen(false)}
              className="text-xs font-black"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="yellow"
              size="sm"
              className="text-xs font-black gap-1 shadow-[1.5px_1.5px_0px_0px_#111111]"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Icon</span>
            </Button>
          </div>
        </form>
      )}

      {/* Added Social Icons Display (Compact Icon Pills ONLY) */}
      {activePlatforms.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-[#111111]/20 p-4 text-center bg-[#F8F9FA]">
          <p className="text-xs font-bold text-[#111111]/60">
            No social media icons added yet. Click "+ Add Social Icon" above to add your profiles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 w-full">
          {activePlatforms.map(([platformId, val]) => {
            const platformObj = SOCIAL_PLATFORMS.find((p) => p.id === platformId);
            if (!platformObj) return null;
            const IconComp = platformObj.icon;

            return (
              <div
                key={platformId}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border-2 border-[#111111] bg-[#F8F9FA] shadow-[2px_2px_0px_0px_#111111] transition-transform hover:-translate-y-0.5 w-full min-w-0"
              >
                <div className="flex items-center gap-2 min-w-0 truncate">
                  <IconComp className="w-4 h-4 text-[#111111] stroke-[2.5] shrink-0" />
                  <span className="text-xs font-black text-[#111111] truncate">{platformObj.label}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlatform(platformId);
                      setInputValue(val);
                      setIsAddOpen(true);
                    }}
                    className="p-1 rounded-md text-[#111111]/70 hover:text-[#3B82F6] hover:bg-black/5 transition-colors cursor-pointer"
                    title="Edit link"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemove(platformId)}
                    className="p-1 rounded-md text-[#FF4D6D] hover:bg-[#FF4D6D] hover:text-white transition-colors cursor-pointer"
                    title="Remove icon"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
