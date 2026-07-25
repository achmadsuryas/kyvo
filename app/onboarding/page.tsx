import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/services/profile';
import { OnboardingForm } from '@/components/forms/onboarding-form';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect('/login');
  }

  // If user has already onboarded, send them straight to dashboard
  if (profile.is_onboarded === true) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] bg-grid-lines flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-[#FFD43B]">
      <OnboardingForm profile={profile} />
    </div>
  );
}
