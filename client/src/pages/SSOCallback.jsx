import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

/**
 * /sso-callback
 *
 * Clerk redirects here after Google OAuth completes.
 * AuthenticateWithRedirectCallback exchanges the OAuth code
 * for a Clerk session, then redirects to the final destination.
 */
export default function SSOCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-[#0F172A]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Completing sign-in…</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
