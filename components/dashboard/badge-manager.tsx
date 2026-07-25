'use client';

import * as React from 'react';
import { 
  Award, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Crown, 
  Gift, 
  Loader2, 
  Sparkles, 
  Edit3,
  Power
} from 'lucide-react';
import { BadgeItem } from '@/types';
import { createBadge, updateBadge, deleteBadge, toggleBadgeActive } from '@/actions/badges';
import { getBadgeIconComponent, AVAILABLE_BADGE_ICONS } from '@/components/shared/badge-icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface BadgeManagerProps {
  initialBadges: BadgeItem[];
}

export function BadgeManager({ initialBadges }: BadgeManagerProps) {
  const [badges, setBadges] = React.useState<BadgeItem[]>(initialBadges);
  const [isOpen, setIsOpen] = React.useState(false);

  // Form states
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [icon, setIcon] = React.useState('Gift');
  const [color, setColor] = React.useState('#111111');
  const [bgColor, setBgColor] = React.useState('#FF4D6D');
  const [badgeType, setBadgeType] = React.useState<'event' | 'regular'>('event');
  const [isCreating, setIsCreating] = React.useState(false);

  // Edit states
  const [editingBadge, setEditingBadge] = React.useState<BadgeItem | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editDescription, setEditDescription] = React.useState('');
  const [editIcon, setEditIcon] = React.useState('Gift');
  const [editColor, setEditColor] = React.useState('#111111');
  const [editBgColor, setEditBgColor] = React.useState('#FF4D6D');
  const [editBadgeType, setEditBadgeType] = React.useState<'event' | 'regular'>('event');
  const [isUpdating, setIsUpdating] = React.useState(false);

  const [loadingBadgeId, setLoadingBadgeId] = React.useState<string | null>(null);

  const PRESET_COLORS = [
    { bg: '#FFD43B', text: '#111111', label: 'Yellow' },
    { bg: '#3B82F6', text: '#FFFFFF', label: 'Blue' },
    { bg: '#FF4D6D', text: '#FFFFFF', label: 'Pink' },
    { bg: '#51CF66', text: '#111111', label: 'Green' },
    { bg: '#A855F7', text: '#FFFFFF', label: 'Purple' },
    { bg: '#111111', text: '#FFFFFF', label: 'Dark' },
  ];

  // Submit Create Badge Form
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Badge name is required');
      return;
    }

    setIsCreating(true);
    const res = await createBadge({
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      bg_color: bgColor,
      is_event: badgeType === 'event',
      is_active: true,
    });
    setIsCreating(false);

    if (res.success && res.badge) {
      toast.success(res.message);
      setBadges((prev) => [res.badge!, ...prev]);
      setName('');
      setDescription('');
      setIsOpen(false);
    } else {
      toast.error(res.message);
    }
  };

  // Start Editing Badge
  const handleStartEdit = (b: BadgeItem) => {
    setEditingBadge(b);
    setEditName(b.name);
    setEditDescription(b.description || '');
    setEditIcon(b.icon);
    setEditColor(b.color || '#111111');
    setEditBgColor(b.bg_color || '#FFD43B');
    setEditBadgeType(b.is_event ? 'event' : 'regular');
  };

  // Submit Update Badge Form
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBadge || !editName.trim()) return;

    setIsUpdating(true);
    const res = await updateBadge(editingBadge.id, {
      name: editName.trim(),
      description: editDescription.trim(),
      icon: editIcon,
      color: editColor,
      bg_color: editBgColor,
      is_event: editBadgeType === 'event',
    });
    setIsUpdating(false);

    if (res.success) {
      toast.success(res.message);
      setBadges((prev) =>
        prev.map((b) =>
          b.id === editingBadge.id
            ? {
                ...b,
                name: editName.trim(),
                description: editDescription.trim(),
                icon: editIcon,
                color: editColor,
                bg_color: editBgColor,
                is_event: editBadgeType === 'event',
              }
            : b
        )
      );
      setEditingBadge(null);
    } else {
      toast.error(res.message);
    }
  };

  // Delete Badge
  const handleDelete = async (badgeId: string) => {
    if (!confirm('Are you sure you want to delete this system badge?')) return;

    setLoadingBadgeId(badgeId);
    const res = await deleteBadge(badgeId);
    setLoadingBadgeId(null);

    if (res.success) {
      toast.success(res.message);
      setBadges((prev) => prev.filter((b) => b.id !== badgeId));
    } else {
      toast.error(res.message);
    }
  };

  // Toggle Active Event Status
  const handleToggleActive = async (badge: BadgeItem) => {
    setLoadingBadgeId(badge.id);
    const newStatus = badge.is_active === false;
    const res = await toggleBadgeActive(badge.id, newStatus);
    setLoadingBadgeId(null);

    if (res.success) {
      toast.success(res.message);
      setBadges((prev) =>
        prev.map((b) => (b.id === badge.id ? { ...b, is_active: newStatus } : b))
      );
    } else {
      toast.error(res.message);
    }
  };

  const eventBadges = badges.filter((b) => b.is_event);
  const regularBadges = badges.filter((b) => !b.is_event);

  return (
    <Card className="bg-white border-[3.5px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] p-6 md:p-8 space-y-6 w-full">
      <CardHeader className="px-0 pt-0 pb-6 border-b-2 border-dashed border-[#111111]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-[#A855F7] stroke-[2.5]" />
            <CardTitle className="text-2xl font-black">Badge & Event Manager</CardTitle>
          </div>
          <CardDescription className="text-sm font-bold">
            Create system badges, verify creators, or publish free claimable Event Badges for user dashboard promo banners.
          </CardDescription>
        </div>

        <Button
          onClick={() => {
            if (editingBadge) setEditingBadge(null);
            setIsOpen(!isOpen);
          }}
          variant="yellow"
          size="default"
          className="gap-2 font-black shadow-[3px_3px_0px_0px_#111111]"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>{isOpen ? 'Close Form' : 'Create New Badge / Event'}</span>
        </Button>
      </CardHeader>

      <CardContent className="px-0 pt-2 space-y-6">
        {/* EDIT BADGE MODAL / FORM */}
        {editingBadge && (
          <form
            onSubmit={handleUpdate}
            className="rounded-2xl border-[3px] border-[#111111] bg-[#3B82F6]/15 p-6 shadow-[5px_5px_0px_0px_#111111] space-y-5 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between border-b-2 border-dashed border-[#111111]/20 pb-3">
              <div className="flex items-center gap-2 font-black text-lg text-[#111111]">
                <Edit3 className="w-5 h-5 text-[#3B82F6]" />
                <span>Editing Badge: {editingBadge.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingBadge(null)}
                className="p-1 rounded-lg border border-[#111111] bg-white text-[#111111]"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Select Badge Type */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#111111]">Badge Category / Purpose</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEditBadgeType('event')}
                  className={`p-4 rounded-xl border-[3px] border-[#111111] text-left transition-all ${
                    editBadgeType === 'event'
                      ? 'bg-[#FF4D6D] text-white shadow-[4px_4px_0px_0px_#111111] scale-[1.02]'
                      : 'bg-white text-[#111111] opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-base flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      <span>Event Badge (Free Claim)</span>
                    </span>
                    <Badge variant="default" className="text-[10px] font-black text-[#111111]">EVENT</Badge>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setEditBadgeType('regular')}
                  className={`p-4 rounded-xl border-[3px] border-[#111111] text-left transition-all ${
                    editBadgeType === 'regular'
                      ? 'bg-[#FFD43B] text-[#111111] shadow-[4px_4px_0px_0px_#111111] scale-[1.02]'
                      : 'bg-white text-[#111111] opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-base flex items-center gap-2">
                      <Crown className="w-5 h-5 text-[#A855F7]" />
                      <span>Regular Badge (Admin Only)</span>
                    </span>
                    <Badge variant="purple" className="text-[10px] font-black">REGULAR</Badge>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5 space-y-1">
                <label className="text-xs font-black uppercase text-[#111111]">Badge Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border-2 border-[#111111] bg-white p-3 font-bold text-sm outline-none"
                  required
                />
              </div>

              <div className="md:col-span-7 space-y-1">
                <label className="text-xs font-black uppercase text-[#111111]">Description</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl border-2 border-[#111111] bg-white p-3 font-bold text-sm outline-none"
                />
              </div>
            </div>

            {/* Select Vector Badge Icon */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#111111]">Choose Badge Vector Icon</label>
              <div className="flex flex-wrap gap-2.5">
                {AVAILABLE_BADGE_ICONS.map((ic) => {
                  const IconComp = getBadgeIconComponent(ic.name);
                  const isSelected = editIcon === ic.name;

                  return (
                    <button
                      key={ic.name}
                      type="button"
                      onClick={() => setEditIcon(ic.name)}
                      className={`p-3 rounded-xl border-2 border-[#111111] flex items-center gap-2 font-black text-xs transition-all ${
                        isSelected
                          ? 'bg-[#FFD43B] text-[#111111] shadow-[3px_3px_0px_0px_#111111] scale-105'
                          : 'bg-white text-[#111111] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <IconComp className="w-4 h-4 stroke-[2.5]" />
                      <span>{ic.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preset Color Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#111111]">Choose Color Theme</label>
              <div className="flex flex-wrap gap-3">
                {PRESET_COLORS.map((c) => {
                  const isSelected = editBgColor === c.bg;
                  return (
                    <button
                      key={c.bg}
                      type="button"
                      onClick={() => {
                        setEditBgColor(c.bg);
                        setEditColor(c.text);
                      }}
                      className={`px-3 py-2 rounded-xl border-2 border-[#111111] text-xs font-black flex items-center gap-2 transition-all shadow-[2px_2px_0px_0px_#111111] ${
                        isSelected ? 'ring-2 ring-black scale-105' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.bg, color: c.text }}
                    >
                      <span>{c.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingBadge(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="yellow" size="sm" disabled={isUpdating} className="gap-1 font-black">
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                <span>Save Badge Changes</span>
              </Button>
            </div>
          </form>
        )}

        {/* CREATE BADGE FORM */}
        {isOpen && !editingBadge && (
          <form
            onSubmit={handleCreate}
            className="rounded-2xl border-[3px] border-[#111111] bg-[#FFD43B]/20 p-6 shadow-[5px_5px_0px_0px_#111111] space-y-5 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between border-b-2 border-dashed border-[#111111]/20 pb-3">
              <span className="font-black text-lg text-[#111111] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF4D6D]" />
                <span>Create & Publish New System Badge / Event</span>
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg border border-[#111111] bg-white text-[#111111]"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Select Badge Type */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#111111]">Badge Category / Purpose</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setBadgeType('event');
                    setIcon('Gift');
                    setBgColor('#FF4D6D');
                    setColor('#FFFFFF');
                  }}
                  className={`p-4 rounded-xl border-[3px] border-[#111111] text-left transition-all ${
                    badgeType === 'event'
                      ? 'bg-[#FF4D6D] text-white shadow-[4px_4px_0px_0px_#111111] scale-[1.02]'
                      : 'bg-white text-[#111111] opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-base flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      <span>Event Badge (Free Claim)</span>
                    </span>
                    <Badge variant="default" className="text-[10px] font-black text-[#111111]">EVENT</Badge>
                  </div>
                  <p className="text-xs font-extrabold mt-1 opacity-90">
                    Appears in user dashboard promo banner. Any user can claim it for free!
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBadgeType('regular');
                    setIcon('Sparkles');
                    setBgColor('#FFD43B');
                    setColor('#111111');
                  }}
                  className={`p-4 rounded-xl border-[3px] border-[#111111] text-left transition-all ${
                    badgeType === 'regular'
                      ? 'bg-[#FFD43B] text-[#111111] shadow-[4px_4px_0px_0px_#111111] scale-[1.02]'
                      : 'bg-white text-[#111111] opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-base flex items-center gap-2">
                      <Crown className="w-5 h-5 text-[#A855F7]" />
                      <span>Regular Badge (Admin Only)</span>
                    </span>
                    <Badge variant="purple" className="text-[10px] font-black">REGULAR</Badge>
                  </div>
                  <p className="text-xs font-extrabold mt-1 opacity-90">
                    Special creator badge (Verified, VIP) granted exclusively by Admin.
                  </p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5 space-y-1">
                <label className="text-xs font-black uppercase text-[#111111]">Badge Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={badgeType === 'event' ? "e.g. Early Adopter / Summer Fest" : "e.g. Verified Creator / VIP"}
                  className="w-full rounded-xl border-2 border-[#111111] bg-white p-3 font-bold text-sm outline-none"
                  required
                />
              </div>

              <div className="md:col-span-7 space-y-1">
                <label className="text-xs font-black uppercase text-[#111111]">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Special badge awarded to early Kyvo creators!"
                  className="w-full rounded-xl border-2 border-[#111111] bg-white p-3 font-bold text-sm outline-none"
                />
              </div>
            </div>

            {/* Select Vector Badge Icon */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#111111]">Choose Badge Vector Icon</label>
              <div className="flex flex-wrap gap-2.5">
                {AVAILABLE_BADGE_ICONS.map((ic) => {
                  const IconComp = getBadgeIconComponent(ic.name);
                  const isSelected = icon === ic.name;

                  return (
                    <button
                      key={ic.name}
                      type="button"
                      onClick={() => setIcon(ic.name)}
                      className={`p-3 rounded-xl border-2 border-[#111111] flex items-center gap-2 font-black text-xs transition-all ${
                        isSelected
                          ? 'bg-[#FFD43B] text-[#111111] shadow-[3px_3px_0px_0px_#111111] scale-105'
                          : 'bg-white text-[#111111] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <IconComp className="w-4 h-4 stroke-[2.5]" />
                      <span>{ic.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preset Color Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#111111]">Choose Color Theme</label>
              <div className="flex flex-wrap gap-3">
                {PRESET_COLORS.map((c) => {
                  const isSelected = bgColor === c.bg;
                  return (
                    <button
                      key={c.bg}
                      type="button"
                      onClick={() => {
                        setBgColor(c.bg);
                        setColor(c.text);
                      }}
                      className={`px-3 py-2 rounded-xl border-2 border-[#111111] text-xs font-black flex items-center gap-2 transition-all shadow-[2px_2px_0px_0px_#111111] ${
                        isSelected ? 'ring-2 ring-black scale-105' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.bg, color: c.text }}
                    >
                      <span>{c.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="yellow" size="sm" disabled={isCreating} className="gap-1 font-black">
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4 stroke-[3]" />}
                <span>{badgeType === 'event' ? 'Publish Event Badge' : 'Publish Regular Badge'}</span>
              </Button>
            </div>
          </form>
        )}

        {/* SIDE-BY-SIDE 2-COLUMN GRID LAYOUT FOR BADGES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t-2 border-dashed border-[#111111]/20">
          {/* COLUMN 1: EVENT BADGES */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-[#111111]/10">
              <Gift className="w-5 h-5 text-[#FF4D6D]" />
              <h4 className="text-lg font-black text-[#111111]">Event Badges ({eventBadges.length})</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {eventBadges.length === 0 ? (
                <div className="sm:col-span-2 rounded-2xl border-2 border-dashed border-[#111111]/30 p-6 text-center text-xs font-bold text-[#111111]/60">
                  No Event Badges created yet.
                </div>
              ) : (
                eventBadges.map((badge) => {
                  const BadgeIconComp = getBadgeIconComponent(badge.icon);
                  const isActive = badge.is_active !== false;

                  return (
                    <div
                      key={badge.id}
                      className={`rounded-2xl border-[3px] border-[#111111] p-3.5 shadow-[3px_3px_0px_0px_#111111] space-y-2.5 flex flex-col justify-between ${
                        !isActive ? 'opacity-70 grayscale-[30%]' : ''
                      }`}
                      style={{ backgroundColor: badge.bg_color || '#FFD43B', color: badge.color || '#111111' }}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 font-black text-base truncate">
                          <BadgeIconComp className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
                          <span className="truncate">{badge.name}</span>
                        </div>
                        <Badge variant={isActive ? "green" : "secondary"} className="text-[9px] font-black uppercase px-2 py-0.5 flex-shrink-0">
                          {isActive ? 'Active' : 'Ended'}
                        </Badge>
                      </div>

                      <p className="text-xs font-bold opacity-90 line-clamp-2 leading-relaxed">{badge.description}</p>

                      <div className="pt-2 flex items-center justify-between text-[10px] font-black border-t border-black/20 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(badge)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-[#111111] text-[10px] font-black shadow-[1px_1px_0px_0px_#111111] cursor-pointer ${
                            isActive ? 'bg-[#51CF66] text-[#111111]' : 'bg-[#FF922B] text-white'
                          }`}
                        >
                          <Power className="w-3 h-3 stroke-[2.5]" />
                          <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(badge)}
                            className="p-1 rounded-lg border border-[#111111] bg-white text-[#111111] hover:bg-[#FFD43B] transition-colors"
                            title="Edit Badge"
                          >
                            <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(badge.id)}
                            className="p-1 rounded-lg border border-[#111111] bg-[#FF4D6D] text-white hover:bg-red-700 transition-colors"
                            title="Delete Badge"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUMN 2: REGULAR / SYSTEM BADGES */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-[#111111]/10">
              <Crown className="w-5 h-5 text-[#A855F7]" />
              <h4 className="text-lg font-black text-[#111111]">Regular / System Badges ({regularBadges.length})</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {regularBadges.map((badge) => {
                const BadgeIconComp = getBadgeIconComponent(badge.icon);

                return (
                  <div
                    key={badge.id}
                    className="rounded-2xl border-[3px] border-[#111111] p-3.5 shadow-[3px_3px_0px_0px_#111111] space-y-2.5 flex flex-col justify-between"
                    style={{ backgroundColor: badge.bg_color || '#FFD43B', color: badge.color || '#111111' }}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 font-black text-base truncate">
                        <BadgeIconComp className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
                        <span className="truncate">{badge.name}</span>
                      </div>
                      <Badge variant="purple" className="text-[9px] font-black uppercase px-2 py-0.5 flex-shrink-0">
                        Admin Only
                      </Badge>
                    </div>

                    <p className="text-xs font-bold opacity-90 line-clamp-2 leading-relaxed">{badge.description}</p>

                    <div className="pt-2 flex items-center justify-end text-[10px] font-black border-t border-black/20 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(badge)}
                        className="p-1 rounded-lg border border-[#111111] bg-white text-[#111111] hover:bg-[#FFD43B] transition-colors"
                        title="Edit Badge"
                      >
                        <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(badge.id)}
                        className="p-1 rounded-lg border border-[#111111] bg-[#FF4D6D] text-white hover:bg-red-700 transition-colors"
                        title="Delete Badge"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
