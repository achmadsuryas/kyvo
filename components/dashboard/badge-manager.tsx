'use client';

import * as React from 'react';
import { Sparkles, Plus, ShieldCheck, Loader2, Award, Gift, Crown, Trash2, ToggleLeft, ToggleRight, Edit3, X, Check } from 'lucide-react';
import { BadgeItem } from '@/types';
import { createAdminBadge, updateAdminBadge, deleteAdminBadge, toggleBadgeActiveStatus } from '@/actions/badges';
import { getBadgeIconComponent, BADGE_ICONS_MAP } from '@/components/shared/badge-icons';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface BadgeManagerProps {
  badges: BadgeItem[];
}

export function BadgeManager({ badges }: BadgeManagerProps) {
  const [badgeList, setBadgeList] = React.useState<BadgeItem[]>(badges);
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Create Form State
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [icon, setIcon] = React.useState('Rocket');
  const [bgColor, setBgColor] = React.useState('#FFD43B');
  const [badgeType, setBadgeType] = React.useState<'event' | 'regular'>('event');
  const [isCreating, setIsCreating] = React.useState(false);

  // Edit Form State
  const [editingBadge, setEditingBadge] = React.useState<BadgeItem | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editDescription, setEditDescription] = React.useState('');
  const [editIcon, setEditIcon] = React.useState('Rocket');
  const [editBgColor, setEditBgColor] = React.useState('#FFD43B');
  const [editBadgeType, setEditBadgeType] = React.useState<'event' | 'regular'>('event');
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Delete Alert Dialog State
  const [deleteTargetId, setDeleteTargetId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    setBadgeList(badges);
  }, [badges]);

  // Start Editing Badge
  const startEditing = (badge: BadgeItem) => {
    setEditingBadge(badge);
    setEditName(badge.name);
    setEditDescription(badge.description || '');
    setEditIcon(badge.icon || 'Rocket');
    setEditBgColor(badge.bg_color || '#FFD43B');
    setEditBadgeType(badge.is_event ? 'event' : 'regular');
  };

  // Handle Create Badge
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Badge name is required.');
      return;
    }

    const isEvent = badgeType === 'event';

    setIsCreating(true);
    const res = await createAdminBadge({
      name,
      description,
      bgColor,
      isEvent,
      icon,
    });
    setIsCreating(false);

    if (res.success) {
      toast.success(res.message);
      setBadgeList((prev) => [
        {
          id: `badge-${Date.now()}`,
          name,
          description,
          icon,
          color: bgColor === '#3B82F6' || bgColor === '#FF4D6D' || bgColor === '#A855F7' ? '#FFFFFF' : '#111111',
          bg_color: bgColor,
          is_event: isEvent,
          is_active: true,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setName('');
      setDescription('');
      setIsOpen(false);
    } else {
      toast.error(res.message);
    }
  };

  // Handle Update Badge
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBadge || !editName.trim()) {
      toast.error('Badge name is required.');
      return;
    }

    const isEvent = editBadgeType === 'event';

    setIsUpdating(true);
    const res = await updateAdminBadge(editingBadge.id, {
      name: editName,
      description: editDescription,
      bgColor: editBgColor,
      isEvent,
      icon: editIcon,
    });
    setIsUpdating(false);

    if (res.success) {
      toast.success(res.message);
      setBadgeList((prev) =>
        prev.map((b) =>
          b.id === editingBadge.id
            ? {
                ...b,
                name: editName,
                description: editDescription,
                icon: editIcon,
                bg_color: editBgColor,
                color: editBgColor === '#3B82F6' || editBgColor === '#FF4D6D' || editBgColor === '#A855F7' ? '#FFFFFF' : '#111111',
                is_event: isEvent,
              }
            : b
        )
      );
      setEditingBadge(null);
    } else {
      toast.error(res.message);
    }
  };

  const handleToggleActive = async (badge: BadgeItem) => {
    const currentStatus = badge.is_active !== false;
    const res = await toggleBadgeActiveStatus(badge.id, currentStatus);

    if (res.success) {
      toast.success(res.message);
      setBadgeList((prev) =>
        prev.map((b) => (b.id === badge.id ? { ...b, is_active: !currentStatus } : b))
      );
    } else {
      toast.error(res.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    const badgeId = deleteTargetId;

    setIsDeleting(true);
    const res = await deleteAdminBadge(badgeId);
    setIsDeleting(false);

    if (res.success) {
      toast.success(res.message);
      setBadgeList((prev) => prev.filter((b) => b.id !== badgeId));
      setDeleteTargetId(null);
    } else {
      toast.error(res.message);
    }
  };

  const availableIcons = Object.keys(BADGE_ICONS_MAP);

  // Group Badges by Category
  const eventBadges = badgeList.filter((b) => b.is_event);
  const regularBadges = badgeList.filter((b) => !b.is_event);

  return (
    <Card className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] p-6 md:p-8 space-y-6">
      <CardHeader className="px-0 pt-0 pb-6 border-b-2 border-dashed border-[#111111]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#3B82F6] stroke-[2.5]" />
            <CardTitle className="text-2xl font-black">Admin Badge & Event Manager</CardTitle>
            <Badge variant="purple" className="text-xs font-black">
              ADMIN CONTROL
            </Badge>
          </div>
          <CardDescription className="text-sm font-bold">
            Create, edit, toggle active status, or delete Free Event Badges and Regular Badges.
          </CardDescription>
        </div>

        <Button
          onClick={() => {
            setEditingBadge(null);
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
                <span>Edit Badge Details ({editingBadge.name})</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingBadge(null)}
                className="p-1 rounded-lg border-2 border-[#111111] bg-[#FF4D6D] text-white"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* BADGE TYPE SELECTOR (EVENT vs REGULAR) */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#111111]">Select Badge Type:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditBadgeType('event');
                  }}
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
                  onClick={() => {
                    setEditBadgeType('regular');
                  }}
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
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-[#111111]">Select Vector Badge Icon</label>
              <div className="flex flex-wrap gap-2.5">
                {availableIcons.map((iconKey) => {
                  const IconComp = BADGE_ICONS_MAP[iconKey];
                  const isSelected = editIcon === iconKey;

                  return (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => setEditIcon(iconKey)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-[#111111] font-black text-xs transition-transform ${
                        isSelected
                          ? 'bg-[#3B82F6] text-white scale-105 shadow-[2px_2px_0px_0px_#111111]'
                          : 'bg-white text-[#111111] hover:bg-[#FFD43B]'
                      }`}
                    >
                      <IconComp className="w-4 h-4 stroke-[2.5]" />
                      <span>{iconKey}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Theme Selector */}
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-[#111111]">Background Color Theme</label>
              <div className="flex items-center gap-3">
                {['#FFD43B', '#3B82F6', '#FF4D6D', '#A855F7', '#51CF66'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setEditBgColor(color)}
                    className={`w-8 h-8 rounded-xl border-2 border-[#111111] transition-transform ${
                      editBgColor === color ? 'scale-125 ring-2 ring-[#111111] shadow-[2px_2px_0px_0px_#111111]' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingBadge(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating} variant="green" size="sm" className="gap-2 font-black">
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
            <div className="flex items-center gap-2 font-black text-lg text-[#111111]">
              <Award className="w-5 h-5 text-[#3B82F6]" />
              <span>Create New Badge or Event</span>
            </div>

            {/* BADGE TYPE SELECTOR (EVENT vs REGULAR) */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#111111]">Select Badge Type:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setBadgeType('event');
                    setIcon('Rocket');
                    setBgColor('#FF4D6D');
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
                    Can be claimed directly by creators in their Dashboard promo card.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBadgeType('regular');
                    setIcon('Sparkles');
                    setBgColor('#FFD43B');
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
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-[#111111]">Select Vector Badge Icon</label>
              <div className="flex flex-wrap gap-2.5">
                {availableIcons.map((iconKey) => {
                  const IconComp = BADGE_ICONS_MAP[iconKey];
                  const isSelected = icon === iconKey;

                  return (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => setIcon(iconKey)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-[#111111] font-black text-xs transition-transform ${
                        isSelected
                          ? 'bg-[#3B82F6] text-white scale-105 shadow-[2px_2px_0px_0px_#111111]'
                          : 'bg-white text-[#111111] hover:bg-[#FFD43B]'
                      }`}
                    >
                      <IconComp className="w-4 h-4 stroke-[2.5]" />
                      <span>{iconKey}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Theme Selector */}
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-[#111111]">Background Color Theme</label>
              <div className="flex items-center gap-3">
                {['#FFD43B', '#3B82F6', '#FF4D6D', '#A855F7', '#51CF66'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBgColor(color)}
                    className={`w-8 h-8 rounded-xl border-2 border-[#111111] transition-transform ${
                      bgColor === color ? 'scale-125 ring-2 ring-[#111111] shadow-[2px_2px_0px_0px_#111111]' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating} variant="default" size="sm" className="gap-2 font-black">
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4 stroke-[3]" />}
                <span>{badgeType === 'event' ? 'Publish Event Badge' : 'Publish Regular Badge'}</span>
              </Button>
            </div>
          </form>
        )}

        {/* SIDE-BY-SIDE 2-COLUMN GRID LAYOUT FOR BADGES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t-2 border-dashed border-[#111111]/20">
          {/* COLUMN 1: EVENT PROMO BADGES */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-[#111111]/10">
              <Gift className="w-5 h-5 text-[#FF4D6D]" />
              <h4 className="text-lg font-black text-[#111111]">Event Promo Badges ({eventBadges.length})</h4>
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
                            isActive ? 'bg-[#FFD43B] text-[#111111]' : 'bg-[#51CF66] text-[#111111]'
                          }`}
                        >
                          {isActive ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                          <span>{isActive ? 'Disable Event' : 'Enable Event'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {/* Edit Badge Button */}
                          <button
                            type="button"
                            onClick={() => startEditing(badge)}
                            className="inline-flex items-center gap-1 p-1 rounded-lg border border-[#111111] bg-[#3B82F6] text-white shadow-[1px_1px_0px_0px_#111111] cursor-pointer hover:scale-105 transition-transform"
                            title="Edit Badge"
                          >
                            <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>

                          {/* Delete Badge Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteTargetId(badge.id)}
                            className="inline-flex items-center gap-1 p-1 rounded-lg border border-[#111111] bg-[#FF4D6D] text-white shadow-[1px_1px_0px_0px_#111111] cursor-pointer hover:scale-105 transition-transform"
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

          {/* COLUMN 2: REGULAR SYSTEM BADGES */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-[#111111]/10">
              <Crown className="w-5 h-5 text-[#A855F7]" />
              <h4 className="text-lg font-black text-[#111111]">Regular / Special Badges ({regularBadges.length})</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {regularBadges.length === 0 ? (
                <div className="sm:col-span-2 rounded-2xl border-2 border-dashed border-[#111111]/30 p-6 text-center text-xs font-bold text-[#111111]/60">
                  No Regular Badges created yet.
                </div>
              ) : (
                regularBadges.map((badge) => {
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
                          REGULAR
                        </Badge>
                      </div>

                      <p className="text-xs font-bold opacity-90 line-clamp-2 leading-relaxed">{badge.description}</p>

                      <div className="pt-2 flex items-center justify-between text-[10px] font-black border-t border-black/20">
                        <span>Assigned by Admin</span>

                        <div className="flex items-center gap-1">
                          {/* Edit Badge Button */}
                          <button
                            type="button"
                            onClick={() => startEditing(badge)}
                            className="inline-flex items-center gap-1 p-1 rounded-lg border border-[#111111] bg-[#3B82F6] text-white shadow-[1px_1px_0px_0px_#111111] cursor-pointer hover:scale-105 transition-transform"
                            title="Edit Badge"
                          >
                            <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>

                          {/* Delete Badge Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteTargetId(badge.id)}
                            className="inline-flex items-center gap-1 p-1 rounded-lg border border-[#111111] bg-[#FF4D6D] text-white shadow-[1px_1px_0px_0px_#111111] cursor-pointer hover:scale-105 transition-transform"
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
        </div>
      </CardContent>

      {/* NEOBRUTALISM ALERT DIALOG FOR BADGE DELETION */}
      <AlertDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Delete Badge / Event Permanent?"
        description="Are you sure you want to delete this badge/event? This action will permanently remove it from the system and creator profiles."
        confirmText="Yes, Delete Badge"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </Card>
  );
}
