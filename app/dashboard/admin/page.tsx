import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Users, Award, BarChart3, Headphones } from 'lucide-react';
import { getCurrentUserProfile } from '@/services/profile';
import { getAllBadges } from '@/actions/badges';
import { getAllUsersForAdmin } from '@/actions/admin';
import { getAllTicketsForAdmin } from '@/actions/support';
import { Sidebar } from '@/components/layout/sidebar';
import { BadgeManager } from '@/components/dashboard/badge-manager';
import { UserManagementTable } from '@/components/dashboard/user-management-table';
import { AdminSupportManager } from '@/components/dashboard/admin-support-manager';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const profile = await getCurrentUserProfile();

  // Role Protection: Only admins can access /dashboard/admin
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  const badges = await getAllBadges();
  const users = await getAllUsersForAdmin();
  const supportTickets = await getAllTicketsForAdmin();

  return (
    <div className="min-h-screen bg-[#F8F9FA] selection:bg-[#FFD43B]">
      {/* Sidebar Layout */}
      <Sidebar profile={profile} />

      {/* Main Content Area */}
      <main className="lg:pl-80 p-4 sm:p-6 md:p-10 pt-6 lg:pt-10 w-full max-w-full overflow-x-hidden space-y-8">
        {/* Top Admin Header Banner */}
        <div className="rounded-3xl border-[4px] border-[#111111] bg-[#A855F7] text-white p-6 md:p-8 shadow-[8px_8px_0px_0px_#111111] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs font-black text-[#111111] gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ADMIN CONTROL PANEL</span>
              </Badge>
              <Badge variant="secondary" className="text-xs font-black">
                PROTECTED ROUTE
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-black">
              System Admin Management
            </h1>
            <p className="text-base font-extrabold text-white/90">
              Logged in as Administrator <span className="underline">{profile.email}</span>
            </p>
          </div>

          <Link href="/dashboard">
            <button className="inline-flex items-center gap-2 font-black text-sm text-[#111111] px-5 py-3 rounded-xl border-[3px] border-[#111111] bg-[#FFD43B] shadow-[4px_4px_0px_0px_#111111] hover:bg-white transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              <span>Back to Overview</span>
            </button>
          </Link>
        </div>

        {/* Admin Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          <Card className="bg-white border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111] p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase text-[#111111]/70">
              <span>Total Registered Users</span>
              <Users className="w-5 h-5 text-[#3B82F6] stroke-[2.5]" />
            </div>
            <p className="text-3xl font-black text-[#111111]">{users.length}</p>
            <p className="text-xs font-bold text-[#51CF66]">Active Directory Profiles</p>
          </Card>

          <Card className="bg-white border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111] p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase text-[#111111]/70">
              <span>Active Support Tickets</span>
              <Headphones className="w-5 h-5 text-[#A855F7] stroke-[2.5]" />
            </div>
            <p className="text-3xl font-black text-[#111111]">{supportTickets.length}</p>
            <p className="text-xs font-bold text-[#3B82F6]">Live Help Center Requests</p>
          </Card>

          <Card className="bg-white border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111] p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase text-[#111111]/70">
              <span>Total System Badges</span>
              <Award className="w-5 h-5 text-[#FF4D6D] stroke-[2.5]" />
            </div>
            <p className="text-3xl font-black text-[#111111]">{badges.length}</p>
            <p className="text-xs font-bold text-[#51CF66]">Event & Creator Badges</p>
          </Card>
        </div>

        {/* Live Support Management Center */}
        <div className="w-full">
          <AdminSupportManager initialTickets={supportTickets} />
        </div>

        {/* User Directory & Admin Management Table */}
        <div className="w-full">
          <UserManagementTable initialUsers={users} availableBadges={badges} />
        </div>

        {/* Dedicated Admin Badge & Event Manager */}
        <div className="w-full">
          <BadgeManager badges={badges} />
        </div>
      </main>
    </div>
  );
}
