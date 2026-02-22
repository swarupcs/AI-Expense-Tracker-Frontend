import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useSignIn } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: signIn, isPending, error } = useSignIn();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn({ email, password });
  };

  return (
    <div className='min-h-screen bg-[#09090b] flex items-center justify-center p-4'>
      {/* Grid background */}
      <div
        className='fixed inset-0 opacity-[0.03] pointer-events-none'
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className='w-full max-w-sm relative'>
        {/* Logo */}
        <div className='flex items-center gap-3 mb-10'>
          <div className='w-10 h-10 rounded-xl bg-[--primary] flex items-center justify-center shadow-lg shrink-0'>
            <Zap
              className='w-5 h-5 text-[--primary-foreground]'
              strokeWidth={2.5}
            />
          </div>
          <div>
            <h1 className='font-display text-lg font-bold text-[--foreground] tracking-tight'>
              ExpenseAI
            </h1>
            <p className='text-[10px] text-[--foreground-secondary] font-mono uppercase tracking-widest'>
              Smart Tracking
            </p>
          </div>
        </div>

        {/* Card */}
        <Card className='bg-[#111114] border-[#1c1c22] rounded-2xl shadow-2xl'>
          <CardHeader className='pb-2 px-8 pt-8'>
            <CardTitle className='text-xl font-display font-bold text-[--foreground]'>
              Welcome back
            </CardTitle>
            <CardDescription className='text-sm text-[--foreground-secondary]'>
              Sign in to your account
            </CardDescription>
          </CardHeader>

          <Separator className='bg-[#1c1c22] mt-4' />

          <CardContent className='px-8 pt-6 pb-8'>
            {error && (
              <Alert className='mb-5 border-red-900/40 bg-red-950/40'>
                <AlertDescription className='text-red-400 text-sm'>
                  {error.message}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>
              {/* Email */}
              <div className='space-y-2'>
                <Label className='text-[10px] font-mono text-[--foreground-secondary] uppercase tracking-widest'>
                  Email
                </Label>
                <Input
                  type='email'
                  autoComplete='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='you@example.com'
                  required
                  className='bg-[#0a0a0c] border-[#1c1c22] text-[--foreground] placeholder:text-[--foreground-secondary]/50 focus-visible:ring-[--primary]/30 focus-visible:border-[--primary]/50'
                />
              </div>

              {/* Password */}
              <div className='space-y-2'>
                <Label className='text-[10px] font-mono text-[--foreground-secondary] uppercase tracking-widest'>
                  Password
                </Label>
                <div className='relative'>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete='current-password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='••••••••'
                    required
                    className='bg-[#0a0a0c] border-[#1c1c22] text-[--foreground] placeholder:text-[--foreground-secondary]/50 focus-visible:ring-[--primary]/30 focus-visible:border-[--primary]/50 pr-10'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => setShowPassword((v) => !v)}
                    className='absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-[--foreground-secondary] hover:text-[--foreground] hover:bg-transparent'
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type='submit'
                disabled={isPending}
                className='w-full gap-2 bg-[--primary] text-[--primary-foreground] hover:bg-[--primary]/90 disabled:opacity-50 disabled:cursor-not-allowed mt-2 h-10'
              >
                {isPending ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className='h-4 w-4' />
                  </>
                )}
              </Button>
            </form>

            <p className='text-center text-sm text-[--foreground-secondary] mt-6'>
              Don't have an account?{' '}
              <Link
                to='/signup'
                className='text-[--primary] hover:underline font-medium transition-colors'
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
