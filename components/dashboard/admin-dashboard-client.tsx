'use client';

import * as React from 'react';
import { Headphones, Users, Award } from 'lucide-react';
import { Profile, BadgeItem, AdminUserItem, SupportTicket } from '@/types';
import { AdminSupportManager } from '@/components/dashboard/admin-support-manager';
import { UserManagementTable } from '@/components/dashboard/user-management-table';
import { BadgeManager } from '@/components/dashboard/badge-manager';

interface AdminDashboardClientProps {
  profile: Profile;
  users: AdminUserItem[];
  badges: BadgeItem[];
  supportTickets: SupportTicket[];
}

export function AdminDashboardClient({
  users,
  badges,
  supportTickets,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = React.useState<'support' | 'users' | 'badges'>('support');

  return (
    <div className="space-y-6">
      {/* Neobrutalism Tab Navigation Bar */}
      <div className="flex flex-wrap items-center gap-3 p-2 rounded-2xl border-[3px] border-[#111111] bg-white shadow-[4px_4px_0px_0px_#111111]">
        <button
          type="button"
          onClick={() => setActiveTab('support')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm transition-all cursor-pointer border-2 border-[#111111] ${
            activeTab === 'support'
              ? 'bg-[#FFD43B] text-[#111111] shadow-[3px_3px_0px_0px_#111111] scale-[1.02]'
              : 'bg-transparent text-[#111111]/70 hover:bg-[#FFD43B]/20 hover:text-[#111111]'
          }`}
        >
          <Headphones className="w-4 h-4 stroke-[2.5]" />
          <span>Live Support</span>
          {supportTickets.length > 0 && (
            <span className="ml-1 text-[11px] px-2 py-0.5 rounded-md bg-[#A855F7] text-white border border-[#111111]">
              {supportTickets.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm transition-all cursor-pointer border-2 border-[#111111] ${
            activeTab === 'users'
              ? 'bg-[#FFD43B] text-[#111111] shadow-[3px_3px_0px_0px_#111111] scale-[1.02]'
              : 'bg-transparent text-[#111111]/70 hover:bg-[#FFD43B]/20 hover:text-[#111111]'
          }`}
        >
          <Users className="w-4 h-4 stroke-[2.5]" />
          <span>User Directory</span>
          <span className="ml-1 text-[11px] px-2 py-0.5 rounded-md bg-[#3B82F6] text-white border border-[#111111]">
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('badges')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm transition-all cursor-pointer border-2 border-[#111111] ${
            activeTab === 'badges'
              ? 'bg-[#FFD43B] text-[#111111] shadow-[3px_3px_0px_0px_#111111] scale-[1.02]'
              : 'bg-transparent text-[#111111]/70 hover:bg-[#FFD43B]/20 hover:text-[#111111]'
          }`}
        >
          <Award className="w-4 h-4 stroke-[2.5]" />
          <span>Badge Manager</span>
          <span className="ml-1 text-[11px] px-2 py-0.5 rounded-md bg-[#FF4D6D] text-white border border-[#111111]">
            {badges.length}
          </span>
        </button>
      </div>

      {/* Tab Content Display */}
      <div className="w-full">
        {activeTab === 'support' && (
          <div className="animate-in fade-in duration-150">
            <AdminSupportManager initialTickets={supportTickets} />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="animate-in fade-in duration-150">
            <UserManagementTable initialUsers={users} availableBadges={badges} />
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="animate-in fade-in duration-150">
            <BadgeManager badges={badges} />
          </div>
        )}
      </div>
    </div>
  );
}
