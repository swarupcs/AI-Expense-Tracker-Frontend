import { useState } from 'react';
import { MailWarning, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useResendVerification } from '@/services/auth.service';

export function EmailVerificationBanner() {
  const user = useAuthStore((s) => s.user);
  const [dismissed, setDismissed] = useState(false);
  const [sent, setSent] = useState(false);
  const { mutate: resend, isPending } = useResendVerification();

  // Only show for local auth users with unverified email
  if (
    !user ||
    user.emailVerified === true ||
    user.authProvider === 'google' ||
    dismissed
  ) {
    return null;
  }

  const handleResend = () => {
    resend(user.email, {
      onSuccess: () => setSent(true),
    });
  };

  return (
    <div
      className='shrink-0 flex items-center gap-3 px-4 py-2.5 text-sm'
      style={{
        background: 'rgba(255,184,48,0.08)',
        borderBottom: '1px solid rgba(255,184,48,0.2)',
      }}
    >
      <MailWarning className='w-4 h-4 shrink-0' style={{ color: '#ffb830' }} />

      <span className='flex-1 font-sans text-xs' style={{ color: '#f0efff' }}>
        {sent ? (
          <span
            className='flex items-center gap-1.5'
            style={{ color: '#00ff87' }}
          >
            <CheckCircle2 className='w-3.5 h-3.5' />
            Verification email sent — check your inbox.
          </span>
        ) : (
          <>
            <span style={{ color: '#ffb830' }}>Verify your email</span> to
            secure your account.{' '}
            <button
              onClick={handleResend}
              disabled={isPending}
              className='font-semibold underline underline-offset-2 hover:no-underline transition-all inline-flex items-center gap-1'
              style={{ color: '#ffb830' }}
            >
              {isPending && <Loader2 className='w-3 h-3 animate-spin' />}
              {isPending ? 'Sending…' : 'Resend verification email'}
            </button>
          </>
        )}
      </span>

      <button
        onClick={() => setDismissed(true)}
        className='shrink-0 hover:opacity-70 transition-opacity'
        style={{ color: '#4a4870' }}
        aria-label='Dismiss'
      >
        <X className='w-3.5 h-3.5' />
      </button>
    </div>
  );
}
