'use client';

import * as React from 'react';
import Link from 'next/link';
import { 
  Users, 
  AlertTriangle, 
  Ban, 
  Award, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  MoreHorizontal,
  X,
  Plus,
  RotateCcw,
  Check,
  Crown,
  Trash2,
} from 'lucide-react';
import { AdminUserItem, BadgeItem } from '@/types';
import { 
  warnUserWithReason, 
  clearWarning, 
  banUserWithReason, 
  unbanUser, 
  toggleVerifiedBadge, 
  grantBadgeToUser, 
  revokeBadgeFromUser,
  toggleUserRole,
  adminDeleteUserAccount
} from '@/actions/admin';
import { getBadgeIconComponent } from '@/components/shared/badge-icons';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface UserManagementTableProps {
  initialUsers: AdminUserItem[];
  availableBadges: BadgeItem[];
}

export function UserManagementTable({ initialUsers, availableBadges }: UserManagementTableProps) {
  const [users, setUsers] = React.useState<AdminUserItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Modals & Dropdowns
  const [selectedUserForBadge, setSelectedUserForBadge] = React.useState<AdminUserItem | null>(null);
  const [reasonModalUser, setReasonModalUser] = React.useState<{ user: AdminUserItem; action: 'warn' | 'ban' } | null>(null);
  const [userToDelete, setUserToDelete] = React.useState<AdminUserItem | null>(null);
  const [isDeletingUser, setIsDeletingUser] = React.useState(false);

  const [selectedReasonTemplate, setSelectedReasonTemplate] = React.useState('Inappropriate or offensive content');
  const [customReasonInput, setCustomReasonInput] = React.useState('');
  
  const [activeDropdownUserId, setActiveDropdownUserId] = React.useState<string | null>(null);
  const [loadingUserId, setLoadingUserId] = React.useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 5;

  const REASON_TEMPLATES = [
    'Inappropriate or offensive content',
    'Spamming excessive or broken links',
    'Impersonation or fake creator account',
    'Terms of Service Violation',
    'Manual Custom Reason',
  ];

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.display_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.action-dropdown-container')) {
        setActiveDropdownUserId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Submit Warning / Ban Action with Reason
  const handleSubmitStatusAction = async () => {
    if (!reasonModalUser) return;
    const { user, action } = reasonModalUser;
    
    const finalReason = selectedReasonTemplate === 'Manual Custom Reason' 
      ? customReasonInput.trim() || 'Terms of Service Violation'
      : selectedReasonTemplate;

    setLoadingUserId(user.id);

    if (action === 'warn') {
      const res = await warnUserWithReason(user.id, finalReason);
      setLoadingUserId(null);
      if (res.success) {
        toast.warning(res.message);
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: 'warned', status_reason: finalReason } : u))
        );
      } else {
        toast.error(res.message);
      }
    } else {
      const res = await banUserWithReason(user.id, finalReason);
      setLoadingUserId(null);
      if (res.success) {
        toast.error(res.message);
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: 'banned', status_reason: finalReason } : u))
        );
      } else {
        toast.error(res.message);
      }
    }

    setReasonModalUser(null);
    setCustomReasonInput('');
  };

  // Toggle User Admin Role
  const handleToggleAdminRole = async (user: AdminUserItem) => {
    setActiveDropdownUserId(null);
    setLoadingUserId(user.id);
    const res = await toggleUserRole(user.id, user.role || 'user');
    setLoadingUserId(null);

    if (res.success) {
      toast.success(res.message);
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
    } else {
      toast.error(res.message);
    }
  };

  // Admin Delete User Account Permanently
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    const res = await adminDeleteUserAccount(userToDelete.id);
    setIsDeletingUser(false);

    if (res.success) {
      toast.success(res.message);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);
    } else {
      toast.error(res.message);
    }
  };

  // Handle Clear Warning
  const handleClearWarning = async (userId: string) => {
    setActiveDropdownUserId(null);
    setLoadingUserId(userId);
    const res = await clearWarning(userId);
    setLoadingUserId(null);

    if (res.success) {
      toast.success(res.message);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: 'active', status_reason: null } : u))
      );
    } else {
      toast.error(res.message);
    }
  };

  // Handle Unban User
  const handleUnban = async (userId: string) => {
    setActiveDropdownUserId(null);
    setLoadingUserId(userId);
    const res = await unbanUser(userId);
    setLoadingUserId(null);

    if (res.success) {
      toast.success(res.message);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: 'active', status_reason: null } : u))
      );
    } else {
      toast.error(res.message);
    }
  };

  // Handle 1-Click Toggle Verified Creator Badge
  const handleToggleVerified = async (user: AdminUserItem) => {
    setActiveDropdownUserId(null);
    setLoadingUserId(user.id);
    const isCurrentlyVerified = user.badges.some((b) => b.name.toLowerCase().includes('verified'));
    
    const res = await toggleVerifiedBadge(user.id, isCurrentlyVerified);
    setLoadingUserId(null);

    if (res.success) {
      toast.success(res.message);
      const verifiedBadgeObj: BadgeItem = {
        id: 'b2222222-2222-2222-2222-222222222222',
        name: 'Verified Creator',
        description: 'Verified authentic creator badge',
        icon: 'Sparkles',
        color: '#111111',
        bg_color: '#FFD43B',
        is_event: false,
        created_at: new Date().toISOString(),
      };

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === user.id) {
            const updatedBadges = isCurrentlyVerified
              ? u.badges.filter((b) => !b.name.toLowerCase().includes('verified'))
              : [...u.badges, verifiedBadgeObj];
            return { ...u, badges: updatedBadges };
          }
          return u;
        })
      );
    } else {
      toast.error(res.message);
    }
  };

  // Handle Grant Badge
  const handleGrantBadge = async (userId: string, badge: BadgeItem) => {
    setLoadingUserId(userId);
    const res = await grantBadgeToUser(userId, badge.id);
    setLoadingUserId(null);

    if (res.success) {
      toast.success(res.message);
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            const exists = u.badges.some((b) => b.id === badge.id);
            if (!exists) {
              return { ...u, badges: [...u.badges, badge] };
            }
          }
          return u;
        })
      );
      if (selectedUserForBadge?.id === userId) {
        setSelectedUserForBadge((prev) =>
          prev ? { ...prev, badges: [...prev.badges, badge] } : null
        );
      }
    } else {
      toast.error(res.message);
    }
  };

  // Handle Revoke Badge
  const handleRevokeBadge = async (userId: string, badgeId: string) => {
    setLoadingUserId(userId);
    const res = await revokeBadgeFromUser(userId, badgeId);
    setLoadingUserId(null);

    if (res.success) {
      toast.success(res.message);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, badges: u.badges.filter((b) => b.id !== badgeId) } : u
        )
      );
      if (selectedUserForBadge?.id === userId) {
        setSelectedUserForBadge((prev) =>
          prev ? { ...prev, badges: prev.badges.filter((b) => b.id !== badgeId) } : null
        );
      }
    } else {
      toast.error(res.message);
    }
  };

  return (
    <Card className="bg-white border-[3.5px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] p-4 sm:p-6 md:p-8 space-y-6 w-full overflow-visible">
      <CardHeader className="px-0 pt-0 pb-6 border-b-2 border-dashed border-[#111111]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#3B82F6] stroke-[2.5]" />
            <CardTitle className="text-xl sm:text-2xl font-black break-words">User Directory & Admin Controls</CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm font-bold break-words">
            Manage registered creator accounts, promote admin roles, issue warnings, ban users, or delete user accounts.
          </CardDescription>
        </div>

        {/* Search Filter Box */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#111111]/60 stroke-[2.5]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search username or email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-[#111111] bg-[#F8F9FA] text-xs font-extrabold outline-none focus:bg-white transition-colors"
          />
        </div>
      </CardHeader>

      <CardContent className="px-0 pt-2 space-y-6 overflow-visible">
        {/* USERS TABLE */}
        <div className="rounded-2xl border-[3.5px] border-[#111111] shadow-[4px_4px_0px_0px_#111111] bg-white overflow-visible">
          <div className="w-full overflow-x-auto lg:overflow-visible">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead className="bg-[#FFD43B]">
                <tr className="border-b-[3.5px] border-[#111111] text-xs font-black uppercase text-[#111111]">
                  <th className="p-4 pl-6 w-[28%] rounded-tl-xl">User Details</th>
                  <th className="p-4 w-[12%]">Role</th>
                  <th className="p-4 w-[16%]">Status</th>
                  <th className="p-4 w-[28%]">Assigned Badges</th>
                  <th className="p-4 w-[16%] text-right pr-6 rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#111111]/15 text-sm font-bold bg-white overflow-visible">
                {paginatedUsers.map((user, idx) => {
                  const isBanned = user.status === 'banned';
                  const isWarned = user.status === 'warned';
                  const isVerified = user.badges.some((b) => b.name.toLowerCase().includes('verified'));
                  const isDropdownOpen = activeDropdownUserId === user.id;

                  // Pop up upwards for lower rows in the page to prevent clipping
                  const popUpward = idx >= 3;

                  return (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-[#F8F9FA] transition-colors relative ${
                        isDropdownOpen ? 'z-40' : 'z-10'
                      }`}
                    >
                      {/* User Info (Natural Word Wrapping!) */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.avatar_url}
                            fallback={user.display_name || user.username}
                            size="md"
                            className="shrink-0"
                          />
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-black text-[#111111] break-words">
                                {user.display_name || user.username}
                              </span>
                              {isVerified && (
                                <span title="Verified Creator" className="shrink-0">
                                  <CheckCircle2 className="w-4 h-4 text-[#3B82F6] fill-[#3B82F6] stroke-white" />
                                </span>
                              )}
                              <Link href={`/${user.username}`} target="_blank" className="hover:text-[#3B82F6] shrink-0">
                                <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                              </Link>
                            </div>
                            <p className="text-xs font-extrabold text-[#3B82F6] break-all">@{user.username}</p>
                            <p className="text-[11px] font-bold text-[#111111]/60 break-all">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <Badge
                          variant={user.role === 'admin' ? 'purple' : 'outline'}
                          className="text-[10px] font-black uppercase shrink-0"
                        >
                          {user.role || 'user'}
                        </Badge>
                      </td>

                      {/* Account Status */}
                      <td className="p-4">
                        {isBanned ? (
                          <Badge variant="secondary" className="text-[10px] font-black gap-1">
                            <Ban className="w-3 h-3" />
                            <span>BANNED</span>
                          </Badge>
                        ) : isWarned ? (
                          <Badge variant="default" className="text-[10px] font-black text-[#111111] gap-1 bg-[#FF922B]">
                            <AlertTriangle className="w-3 h-3" />
                            <span>WARNED</span>
                          </Badge>
                        ) : (
                          <Badge variant="green" className="text-[10px] font-black gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ACTIVE</span>
                          </Badge>
                        )}
                        {user.status_reason && (
                          <p className="text-[10px] font-bold text-[#111111]/60 break-words pt-0.5" title={user.status_reason}>
                            Reason: {user.status_reason}
                          </p>
                        )}
                      </td>

                      {/* Assigned Badges List */}
                      <td className="p-4">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                          {(() => {
                            const displayBadges = user.badges.filter((b) => !b.name.toLowerCase().includes('verified'));
                            if (displayBadges.length === 0) {
                              return <span className="text-xs font-bold text-[#111111]/40 italic">No badges assigned</span>;
                            }
                            return displayBadges.map((b) => {
                              const IconComp = getBadgeIconComponent(b.icon);
                              return (
                                <span
                                  key={b.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border-2 border-[#111111] font-black text-[10px] uppercase shadow-[1.5px_1.5px_0px_0px_#111111]"
                                  style={{ backgroundColor: b.bg_color || '#FFD43B', color: b.color || '#111111' }}
                                >
                                  <IconComp className="w-3 h-3 stroke-[2.5]" />
                                  <span className="break-words">{b.name}</span>
                                </span>
                              );
                            });
                          })()}
                        </div>
                      </td>

                      {/* NEOBRUTALISM ACTIONS DROPDOWN MENU */}
                      <td className="p-4 text-right pr-6 relative overflow-visible">
                        <div className="relative inline-block text-left action-dropdown-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownUserId(isDropdownOpen ? null : user.id);
                            }}
                            className="p-2 rounded-xl border-2 border-[#111111] bg-white text-[#111111] shadow-[2px_2px_0px_0px_#111111] hover:bg-[#FFD43B] transition-all cursor-pointer"
                            aria-label="Actions Menu"
                          >
                            <MoreHorizontal className="w-4 h-4 stroke-[3]" />
                          </button>

                          {/* Floating Dropdown Popup */}
                          {isDropdownOpen && (
                            <div 
                              className={`absolute right-0 z-50 w-56 rounded-2xl border-[3px] border-[#111111] bg-white p-2 shadow-[6px_6px_0px_0px_#111111] space-y-1 animate-in fade-in duration-150 ${
                                popUpward ? 'bottom-12 slide-in-from-bottom-2' : 'top-12 slide-in-from-top-2'
                              }`}
                            >
                              {/* Promote / Demote Admin Role */}
                              <button
                                onClick={() => handleToggleAdminRole(user)}
                                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border-2 border-[#111111] bg-[#A855F7] text-white font-black text-xs hover:translate-x-1 transition-transform cursor-pointer"
                              >
                                <Crown className="w-4 h-4 stroke-[2.5]" />
                                <span>{user.role === 'admin' ? 'Revoke Admin Role' : 'Make System Admin'}</span>
                              </button>

                              {/* 1-Click Toggle Verified Creator */}
                              <button
                                onClick={() => handleToggleVerified(user)}
                                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border-2 border-[#111111] bg-[#3B82F6] text-white font-black text-xs hover:translate-x-1 transition-transform cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                                <span>{isVerified ? 'Unverify Creator' : 'Verify Creator'}</span>
                              </button>

                              {/* Manage Badges */}
                              <button
                                onClick={() => {
                                  setActiveDropdownUserId(null);
                                  setSelectedUserForBadge(user);
                                }}
                                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border-2 border-[#111111] bg-[#FFD43B] text-[#111111] font-black text-xs hover:translate-x-1 transition-transform cursor-pointer"
                              >
                                <Award className="w-4 h-4 stroke-[2.5]" />
                                <span>Manage All Badges</span>
                              </button>

                              {/* Issue Warning OR Clear Warning */}
                              {isWarned ? (
                                <button
                                  onClick={() => handleClearWarning(user.id)}
                                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border-2 border-[#111111] bg-[#51CF66] text-[#111111] font-black text-xs hover:translate-x-1 transition-transform cursor-pointer"
                                >
                                  <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                                  <span>Clear Warning</span>
                                </button>
                              ) : (
                                <button
                                  disabled={isBanned}
                                  onClick={() => {
                                    setActiveDropdownUserId(null);
                                    setReasonModalUser({ user, action: 'warn' });
                                  }}
                                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border-2 border-[#111111] bg-[#FF922B] text-white font-black text-xs hover:translate-x-1 transition-transform cursor-pointer disabled:opacity-50"
                                >
                                  <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                                  <span>Issue Warning</span>
                                </button>
                              )}

                              {/* Ban OR Unban User */}
                              {isBanned ? (
                                <button
                                  onClick={() => handleUnban(user.id)}
                                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border-2 border-[#111111] bg-[#51CF66] text-[#111111] font-black text-xs hover:translate-x-1 transition-transform cursor-pointer"
                                >
                                  <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                                  <span>Unban Account</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setActiveDropdownUserId(null);
                                    setReasonModalUser({ user, action: 'ban' });
                                  }}
                                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border-2 border-[#111111] bg-[#FF4D6D] text-white font-black text-xs hover:translate-x-1 transition-transform cursor-pointer"
                                >
                                  <Ban className="w-4 h-4 stroke-[2.5]" />
                                  <span>Suspend / Ban Account</span>
                                </button>
                              )}

                              {/* Permanently Delete User Account */}
                              <button
                                onClick={() => {
                                  setActiveDropdownUserId(null);
                                  setUserToDelete(user);
                                }}
                                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border-2 border-[#111111] bg-black text-white font-black text-xs hover:translate-x-1 transition-transform cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 text-[#FF4D6D] stroke-[2.5]" />
                                <span>Delete User Account</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm font-bold text-[#111111]/60">
                      No matching users found in directory.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* NEOBRUTALISM PAGINATION CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t-2 border-dashed border-[#111111]/20">
          <p className="text-xs font-black text-[#111111]/70">
            Showing <span className="text-[#111111]">{paginatedUsers.length}</span> of <span className="text-[#111111]">{filteredUsers.length}</span> registered users
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </CardContent>

      {/* ADMIN DELETE USER CONFIRMATION MODAL */}
      {userToDelete && (
        <AlertDialog
          open={!!userToDelete}
          onOpenChange={() => setUserToDelete(null)}
          title={`Permanently Delete @${userToDelete.username}?`}
          description={`Are you sure you want to delete account for ${userToDelete.display_name || userToDelete.email}? This will erase their profile, links, and badges, and immediately release username @${userToDelete.username} so anyone can claim it.`}
          confirmText={isDeletingUser ? "Deleting Account..." : "Delete User Account"}
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleConfirmDeleteUser}
        />
      )}

      {/* WARNING / BAN REASON SPECIFICATION MODAL */}
      {reasonModalUser && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen min-h-screen z-[9999] bg-[#111111]/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white border-[4px] border-[#111111] rounded-3xl p-6 shadow-[8px_8px_0px_0px_#111111] space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b-2 border-dashed border-[#111111]/20 pb-3">
              <div className="flex items-center gap-2">
                {reasonModalUser.action === 'warn' ? (
                  <AlertTriangle className="w-5 h-5 text-[#FF922B]" />
                ) : (
                  <Ban className="w-5 h-5 text-[#FF4D6D]" />
                )}
                <h3 className="text-xl font-black text-[#111111]">
                  {reasonModalUser.action === 'warn' ? 'Issue Account Warning' : 'Suspend / Ban Account'}
                </h3>
              </div>
              <button
                onClick={() => setReasonModalUser(null)}
                className="p-1 rounded-lg border border-[#111111] bg-gray-100"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            <p className="text-xs font-extrabold text-[#111111]/80">
              Specify reason for @<span className="font-black text-[#111111]">{reasonModalUser.user.username}</span>:
            </p>

            {/* Template Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#111111]">Reason Preset Template</label>
              <div className="space-y-1.5">
                {REASON_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl}
                    type="button"
                    onClick={() => setSelectedReasonTemplate(tmpl)}
                    className={`w-full text-left p-2.5 rounded-xl border-2 border-[#111111] font-black text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      selectedReasonTemplate === tmpl
                        ? 'bg-[#FFD43B] text-[#111111] shadow-[2px_2px_0px_0px_#111111]'
                        : 'bg-[#F8F9FA] hover:bg-white'
                    }`}
                  >
                    <span>{tmpl}</span>
                    {selectedReasonTemplate === tmpl && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Manual Reason Input */}
            {selectedReasonTemplate === 'Manual Custom Reason' && (
              <div className="space-y-1 pt-1">
                <label className="text-xs font-black uppercase text-[#111111]">Type Custom Reason</label>
                <textarea
                  value={customReasonInput}
                  onChange={(e) => setCustomReasonInput(e.target.value)}
                  rows={2}
                  placeholder="Enter explicit reason..."
                  className="w-full rounded-xl border-2 border-[#111111] bg-white p-3 text-xs font-bold outline-none resize-none"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setReasonModalUser(null)}>
                Cancel
              </Button>
              <Button
                variant={reasonModalUser.action === 'warn' ? 'yellow' : 'secondary'}
                size="sm"
                onClick={handleSubmitStatusAction}
                className="font-black gap-1.5"
              >
                <span>Confirm {reasonModalUser.action === 'warn' ? 'Warning' : 'Ban'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* GRANT / MANAGE BADGES MODAL */}
      {selectedUserForBadge && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen min-h-screen z-[9999] bg-[#111111]/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white border-[4px] border-[#111111] rounded-3xl p-6 shadow-[8px_8px_0px_0px_#111111] space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b-2 border-dashed border-[#111111]/20 pb-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={selectedUserForBadge.avatar_url}
                  fallback={selectedUserForBadge.display_name || selectedUserForBadge.username}
                  size="md"
                />
                <div>
                  <h3 className="text-xl font-black text-[#111111] break-words">
                    Manage Badges for @{selectedUserForBadge.username}
                  </h3>
                  <p className="text-xs font-bold text-[#111111]/70 break-all">
                    {selectedUserForBadge.display_name || selectedUserForBadge.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForBadge(null)}
                className="p-1.5 rounded-xl border-2 border-[#111111] bg-[#FF4D6D] text-white shadow-[2px_2px_0px_0px_#111111]"
              >
                <X className="w-5 h-5 stroke-[3]" />
              </button>
            </div>

            {/* Currently Assigned Badges */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-[#111111]">Currently Assigned Badges</h4>
              <div className="flex flex-wrap gap-2 p-3 rounded-2xl border-2 border-[#111111] bg-[#F8F9FA]">
                {(() => {
                  const modalDisplayBadges = selectedUserForBadge.badges.filter((b) => !b.name.toLowerCase().includes('verified'));
                  if (modalDisplayBadges.length === 0) {
                    return <span className="text-xs font-bold text-[#111111]/50 italic">No badges assigned yet.</span>;
                  }
                  return modalDisplayBadges.map((b) => {
                    const IconComp = getBadgeIconComponent(b.icon);
                    return (
                      <span
                        key={b.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 border-[#111111] font-black text-xs shadow-[2px_2px_0px_0px_#111111]"
                        style={{ backgroundColor: b.bg_color || '#FFD43B', color: b.color || '#111111' }}
                      >
                        <IconComp className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span className="break-words">{b.name}</span>
                        <button
                          onClick={() => handleRevokeBadge(selectedUserForBadge.id, b.id)}
                          className="ml-1 hover:text-red-600 transition-colors"
                          title="Revoke Badge"
                        >
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </span>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Grant Available System Badges */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-[#111111]">Grant New Badge to User</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableBadges.map((badge) => {
                  const IconComp = getBadgeIconComponent(badge.icon);
                  const isAlreadyAssigned = selectedUserForBadge.badges.some((b) => b.id === badge.id);

                  return (
                    <button
                      key={badge.id}
                      disabled={isAlreadyAssigned}
                      onClick={() => handleGrantBadge(selectedUserForBadge.id, badge)}
                      className={`p-3 rounded-2xl border-2 border-[#111111] text-left transition-all flex items-center justify-between font-black text-xs shadow-[3px_3px_0px_0px_#111111] ${
                        isAlreadyAssigned
                          ? 'opacity-50 bg-gray-100 cursor-not-allowed'
                          : 'hover:-translate-y-0.5 cursor-pointer'
                      }`}
                      style={{
                        backgroundColor: isAlreadyAssigned ? '#E5E7EB' : badge.bg_color || '#FFD43B',
                        color: isAlreadyAssigned ? '#6B7280' : badge.color || '#111111',
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <IconComp className="w-4 h-4 stroke-[2.5] shrink-0" />
                        <span className="break-words">{badge.name}</span>
                      </div>
                      {isAlreadyAssigned ? (
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5] shrink-0" />
                      ) : (
                        <Plus className="w-4 h-4 stroke-[3] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="yellow"
                size="sm"
                onClick={() => setSelectedUserForBadge(null)}
                className="font-black"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
