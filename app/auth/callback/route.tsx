import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const cookieStore = await cookies();
  const claimedUsername = cookieStore.get('kyvo_claimed_username')?.value;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      const userId = data.user.id;

      // 1. If user claimed a username prior to login from landing page form
      if (claimedUsername) {
        const cleanClaimed = claimedUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');
        
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', cleanClaimed)
          .neq('id', userId)
          .maybeSingle();

        if (!existing) {
          const updateData: any = { 
            username: cleanClaimed, 
            is_onboarded: true,
            updated_at: new Date().toISOString() 
          };

          await (supabase.from('profiles') as any)
            .upsert({
              id: userId,
              ...updateData,
            });

          const response = NextResponse.redirect(`${origin}/dashboard`);
          response.cookies.delete('kyvo_claimed_username');
          return response;
        }
      }

      // 2. Fetch profile from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_onboarded')
        .eq('id', userId)
        .maybeSingle();

      // If user profile does not exist OR is_onboarded is false -> Go to /onboarding!
      const isOnboarded = profile && (profile as any).is_onboarded === true;

      const response = NextResponse.redirect(
        `${origin}${isOnboarded ? next : '/onboarding'}`
      );
      response.cookies.delete('kyvo_claimed_username');
      return response;
    }
  }

  // Return user to login if auth failed
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
