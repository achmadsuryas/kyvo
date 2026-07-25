'use client';

import * as React from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Loader2, 
  Link as LinkIcon, 
  Sparkles,
} from 'lucide-react';
import { LinkItem } from '@/types';
import { createLink, updateLink, deleteLink, toggleLinkActive } from '@/actions/links';
import { getIconComponent } from '@/components/shared/social-icons';
import { IconPicker } from '@/components/dashboard/icon-picker';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const PRESET_LINK_COLORS = [
  { name: 'Kuning (Default)', value: '#FFD43B' },
  { name: 'Pink Merah', value: '#FF4D6D' },
  { name: 'Biru', value: '#3B82F6' },
  { name: 'Hijau', value: '#51CF66' },
  { name: 'Ungu', value: '#CC5DE8' },
  { name: 'Oranye', value: '#FF922B' },
  { name: 'Hitam', value: '#111111' },
  { name: 'Putih', value: '#FFFFFF' },
];

function getContrastColor(hexColor?: string | null): string {
  if (!hexColor || !hexColor.startsWith('#')) return '#111111';
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return '#111111';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#111111' : '#ffffff';
}

function LinkColorPicker({
  selectedColor,
  onChangeColor,
}: {
  selectedColor: string;
  onChangeColor: (color: string) => void;
}) {
  const currentColor = selectedColor || '#FFD43B';
  const textColor = getContrastColor(currentColor);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase text-[#111111]/70">
          Button Link Color
        </label>
        <span
          className="text-[10px] font-black uppercase px-2 py-0.5 rounded border border-[#111111] shadow-[1px_1px_0px_0px_#111111]"
          style={{ backgroundColor: currentColor, color: textColor }}
        >
          {currentColor.toUpperCase()}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl border-2 border-[#111111] bg-white">
        {PRESET_LINK_COLORS.map((c) => {
          const isSelected = currentColor.toLowerCase() === c.value.toLowerCase();
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => onChangeColor(c.value)}
              className={`w-7 h-7 rounded-lg border-2 border-[#111111] transition-all cursor-pointer flex items-center justify-center ${
                isSelected ? 'scale-110 shadow-[2px_2px_0px_0px_#111111] ring-2 ring-offset-1 ring-[#111111]' : 'hover:scale-105'
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            >
              {isSelected && (
                <Check className={`w-3.5 h-3.5 stroke-[3] ${getContrastColor(c.value) === '#ffffff' ? 'text-white' : 'text-[#111111]'}`} />
              )}
            </button>
          );
        })}

        <div className="flex items-center gap-2 pl-2 border-l-2 border-dashed border-[#111111]/20">
          <input
            type="color"
            value={currentColor}
            onChange={(e) => onChangeColor(e.target.value)}
            className="w-7 h-7 rounded-lg border-2 border-[#111111] cursor-pointer p-0 bg-transparent overflow-hidden shadow-[1.5px_1.5px_0px_0px_#111111]"
            title="Custom Color Picker"
          />
          <span className="text-[10px] font-black uppercase text-[#111111]/70">Custom</span>
        </div>
      </div>
    </div>
  );
}

interface LinkManagerProps {
  initialLinks: LinkItem[];
}

export function LinkManager({ initialLinks }: LinkManagerProps) {
  const [links, setLinks] = React.useState<LinkItem[]>(initialLinks);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  // Delete Alert Dialog state
  const [deleteLinkId, setDeleteLinkId] = React.useState<string | null>(null);

  // New Link Form state
  const [newTitle, setNewTitle] = React.useState('');
  const [newUrl, setNewUrl] = React.useState('');
  const [newIcon, setNewIcon] = React.useState('Globe');
  const [newBgColor, setNewBgColor] = React.useState('#FFD43B');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Edit Link Form state
  const [editTitle, setEditTitle] = React.useState('');
  const [editUrl, setEditUrl] = React.useState('');
  const [editIcon, setEditIcon] = React.useState('Globe');
  const [editBgColor, setEditBgColor] = React.useState('#FFD43B');
  const [editActive, setEditActive] = React.useState(true);

  React.useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

  // Handle Add New Link
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) {
      toast.error('Please enter both title and URL.');
      return;
    }

    setIsSubmitting(true);
    const res = await createLink({
      title: newTitle,
      url: newUrl,
      icon: newIcon,
      bg_color: newBgColor,
    });
    setIsSubmitting(false);

    if (res.success && res.link) {
      toast.success(res.message);
      setLinks((prev) => [...prev, res.link!]);
      setNewTitle('');
      setNewUrl('');
      setNewIcon('Globe');
      setNewBgColor('#FFD43B');
      setIsAddOpen(false);
    } else {
      toast.error(res.message);
    }
  };

  // Start editing a link
  const startEditing = (link: LinkItem) => {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditIcon(link.icon || 'Globe');
    setEditBgColor(link.bg_color || '#FFD43B');
    setEditActive(link.is_active);
  };

  // Handle Update Link
  const handleUpdateLink = async (id: string) => {
    if (!editTitle.trim() || !editUrl.trim()) {
      toast.error('Title and URL cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    const res = await updateLink(id, {
      title: editTitle,
      url: editUrl,
      icon: editIcon,
      is_active: editActive,
      bg_color: editBgColor,
    });
    setIsSubmitting(false);

    if (res.success) {
      toast.success(res.message);
      setLinks((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, title: editTitle, url: editUrl, icon: editIcon, is_active: editActive, bg_color: editBgColor }
            : l
        )
      );
      setEditingId(null);
    } else {
      toast.error(res.message);
    }
  };

  // Handle Toggle Active
  const handleToggleActive = async (link: LinkItem) => {
    const nextStatus = !link.is_active;
    setLinks((prev) =>
      prev.map((l) => (l.id === link.id ? { ...l, is_active: nextStatus } : l))
    );

    const res = await toggleLinkActive(link.id, link.is_active);
    if (!res.success) {
      toast.error(res.message);
      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, is_active: link.is_active } : l))
      );
    } else {
      toast.success(res.message);
    }
  };

  // Confirm Delete Link via Neobrutalism AlertDialog
  const confirmDeleteLink = async () => {
    if (!deleteLinkId) return;
    const targetId = deleteLinkId;

    setLinks((prev) => prev.filter((l) => l.id !== targetId));
    const res = await deleteLink(targetId);
    setDeleteLinkId(null);

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
      setLinks(initialLinks);
    }
  };

  return (
    <Card className="bg-white border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] p-6 md:p-8 space-y-6">
      <CardHeader className="px-0 pt-0 pb-6 border-b-2 border-dashed border-[#111111]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl font-black">Link Manager</CardTitle>
            <Badge variant="default" className="text-xs font-black">
              {links.length} LINKS
            </Badge>
          </div>
          <CardDescription className="text-sm font-bold">
            Add custom social media, portfolio, store, and video links.
          </CardDescription>
        </div>

        <Button
          onClick={() => setIsAddOpen(!isAddOpen)}
          variant="purple"
          size="default"
          className="gap-2 font-black shadow-[3px_3px_0px_0px_#111111]"
        >
          {isAddOpen ? <X className="w-5 h-5 stroke-[3]" /> : <Plus className="w-5 h-5 stroke-[3]" />}
          <span>{isAddOpen ? 'Cancel' : 'Add New Link'}</span>
        </Button>
      </CardHeader>

      <CardContent className="px-0 pt-2 space-y-6">
        {/* ADD NEW LINK FORM MODAL / COLLAPSIBLE */}
        {isAddOpen && (
          <form
            onSubmit={handleAddLink}
            className="rounded-2xl border-[3px] border-[#111111] bg-[#FFD43B]/20 p-6 shadow-[5px_5px_0px_0px_#111111] space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center gap-2 font-black text-lg text-[#111111]">
              <Sparkles className="w-5 h-5 text-[#FF4D6D]" />
              <span>Create Custom Link</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Title Input */}
              <div className="md:col-span-5 space-y-1">
                <label className="text-xs font-black uppercase text-[#111111]/70">
                  Link Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. My Portfolio / Instagram"
                  className="w-full rounded-xl border-2 border-[#111111] bg-white p-3 font-bold text-sm text-[#111111] outline-none shadow-[2px_2px_0px_0px_#111111]"
                  required
                />
              </div>

              {/* URL Input */}
              <div className="md:col-span-7 space-y-1">
                <label className="text-xs font-black uppercase text-[#111111]/70">
                  Destination URL
                </label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="e.g. https://instagram.com/myusername"
                  className="w-full rounded-xl border-2 border-[#111111] bg-white p-3 font-bold text-sm text-[#111111] outline-none shadow-[2px_2px_0px_0px_#111111]"
                  required
                />
              </div>
            </div>

            {/* Link Color Picker */}
            <LinkColorPicker
              selectedColor={newBgColor}
              onChangeColor={(color) => setNewBgColor(color)}
            />

            {/* Graphical Icon Picker */}
            <IconPicker
              selectedIcon={newIcon}
              onSelectIcon={(iconName) => setNewIcon(iconName)}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="default"
                size="sm"
                className="gap-2 font-black"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 stroke-[3]" />}
                <span>Save Link</span>
              </Button>
            </div>
          </form>
        )}

        {/* LIST OF USER LINKS */}
        {links.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#111111]/30 p-12 text-center space-y-3 bg-[#F8F9FA]">
            <LinkIcon className="w-10 h-10 text-[#111111]/40 mx-auto stroke-[2]" />
            <h4 className="text-xl font-black text-[#111111]">No Links Added Yet</h4>
            <p className="text-sm font-bold text-[#111111]/60 max-w-sm mx-auto">
              Click the "Add New Link" button above to add your social profiles, store, portfolio, or custom links.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {links.map((link) => {
              const IconComp = getIconComponent(link.icon || 'Globe');
              const isEditing = editingId === link.id;
              const linkBgColor = link.bg_color || '#FFD43B';

              return (
                <div
                  key={link.id}
                  className={`rounded-2xl border-[3px] border-[#111111] p-4 shadow-[4px_4px_0px_0px_#111111] transition-all ${
                    link.is_active ? 'bg-white' : 'bg-[#111111]/5 opacity-75'
                  }`}
                >
                  {isEditing ? (
                    /* Inline Editing Form */
                    <div className="space-y-4 p-2">
                      <div className="flex items-center justify-between border-b-2 border-dashed border-[#111111]/20 pb-2">
                        <span className="font-black text-sm uppercase">Edit Link Details</span>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1 rounded-lg border border-[#111111] bg-[#FF4D6D] text-white"
                        >
                          <X className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-5 space-y-1">
                          <label className="text-xs font-black uppercase">Title</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full rounded-xl border-2 border-[#111111] p-2.5 font-bold text-sm outline-none"
                          />
                        </div>
                        <div className="md:col-span-7 space-y-1">
                          <label className="text-xs font-black uppercase">URL</label>
                          <input
                            type="text"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            className="w-full rounded-xl border-2 border-[#111111] p-2.5 font-bold text-sm outline-none"
                          />
                        </div>
                      </div>

                      {/* Link Color Picker */}
                      <LinkColorPicker
                        selectedColor={editBgColor}
                        onChangeColor={(color) => setEditBgColor(color)}
                      />

                      <IconPicker
                        selectedIcon={editIcon}
                        onSelectIcon={(iconName) => setEditIcon(iconName)}
                      />

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="green"
                          size="sm"
                          disabled={isSubmitting}
                          onClick={() => handleUpdateLink(link.id)}
                          className="gap-1 font-black"
                        >
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                          <span>Update</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Display Link Item */
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 overflow-hidden">
                        {/* Graphical SVG Icon Badge */}
                        <div
                          className="p-3 rounded-xl border-2 border-[#111111] flex-shrink-0 shadow-[2px_2px_0px_0px_#111111]"
                          style={{
                            backgroundColor: linkBgColor,
                            color: getContrastColor(linkBgColor),
                          }}
                        >
                          <IconComp className="w-6 h-6" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-black text-[#111111] truncate">
                              {link.title}
                            </h4>
                            {!link.is_active && (
                              <Badge variant="outline" className="text-[10px] font-black opacity-60">
                                HIDDEN
                              </Badge>
                            )}
                          </div>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-[#3B82F6] hover:underline truncate block"
                          >
                            {link.url}
                          </a>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleToggleActive(link)}
                          className={`p-2 rounded-xl border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111] text-xs font-black flex items-center gap-1 transition-transform hover:scale-105 ${
                            link.is_active
                              ? 'bg-[#51CF66] text-[#111111]'
                              : 'bg-white text-[#111111]/60'
                          }`}
                          title={link.is_active ? 'Hide link' : 'Show link'}
                        >
                          {link.is_active ? (
                            <>
                              <Eye className="w-4 h-4 stroke-[2.5]" />
                              <span className="hidden md:inline">Visible</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4 stroke-[2.5]" />
                              <span className="hidden md:inline">Hidden</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => startEditing(link)}
                          className="p-2 rounded-xl border-2 border-[#111111] bg-[#3B82F6] text-white shadow-[2px_2px_0px_0px_#111111] transition-transform hover:scale-105"
                          title="Edit link"
                        >
                          <Edit3 className="w-4 h-4 stroke-[2.5]" />
                        </button>

                        <button
                          onClick={() => setDeleteLinkId(link.id)}
                          className="p-2 rounded-xl border-2 border-[#111111] bg-[#FF4D6D] text-white shadow-[2px_2px_0px_0px_#111111] transition-transform hover:scale-105"
                          title="Delete link"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* NEOBRUTALISM ALERT DIALOG FOR LINK DELETION */}
      <AlertDialog
        open={Boolean(deleteLinkId)}
        onOpenChange={(open) => !open && setDeleteLinkId(null)}
        title="Delete Link Permanent?"
        description="Are you sure you want to delete this link? This action cannot be undone and will immediately remove the link from your public profile."
        confirmText="Yes, Delete Link"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteLink}
      />
    </Card>
  );
}
