'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signInWithGoogle(customOrigin?: string): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const siteUrl = customOrigin || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Google Sign-In Error:', error.message);
    return { error: error.message };
  }

  if (data?.url) {
    return { url: data.url };
  }

  return { error: 'Failed to generate Google login URL.' };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
