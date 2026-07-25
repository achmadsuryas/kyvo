'use client';

import * as React from 'react';
import { signInWithGoogle } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function GoogleLoginForm() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const toastId = toast.loading('Connecting to Google...');
      const res = await signInWithGoogle();
      
      if (res?.url) {
        toast.dismiss(toastId);
        window.location.href = res.url;
      } else if (res?.error) {
        setIsLoading(false);
        toast.dismiss(toastId);
        toast.error(res.error);
      }
    } catch (err: unknown) {
      setIsLoading(false);
      toast.dismiss();
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate Google login';
      if (errorMessage !== 'NEXT_REDIRECT') {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      variant="outline"
      size="lg"
      className="w-full justify-center gap-3 border-[3px] border-[#111111] bg-white py-6 text-lg font-black text-[#111111] shadow-[4px_4px_0px_0px_#111111] hover:bg-[#F8F9FA] hover:shadow-[6px_6px_0px_0px_#111111]"
    >
      <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
    </Button>
  );
}
