import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/services/profile';
import { getUserLinks } from '@/actions/links';
import { getAllBadges, getUserBadgeItemsWithStatus } from '@/actions/badges';
import { Sidebar } from '@/components/layout/sidebar';
import { DashboardContent } from '@/components/dashboard/dashboard-content';
import { SupportChatWidget } from '@/components/dashboard/support-chat-widget';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect('/login');
  }

  // If user has not completed first-time username onboarding setup
  if (profile.is_onboarded === false) {
    redirect('/onboarding');
  }

  const links = await getUserLinks();
  const badges = await getAllBadges();
  const userBadgeItems = await getUserBadgeItemsWithStatus(profile.id);

  return (
    <div className="min-h-screen bg-[#F8F9FA] selection:bg-[#FFD43B]">
      {/* Sidebar Layout */}
      <Sidebar profile={profile} />

      {/* Main Content Area */}
      <main className="lg:pl-80 p-4 sm:p-6 md:p-10 pt-6 lg:pt-10 w-full max-w-full overflow-x-hidden">
        <DashboardContent 
          profile={profile} 
          initialLinks={links} 
          availableBadges={badges} 
          userBadgeItems={userBadgeItems}
        />
      </main>

      {/* Floating Live Support Chat Widget */}
      <SupportChatWidget profile={profile} />
    </div>
  );
}
