import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  Loader2,
  Check,
  Circle,
} from 'lucide-react';
import { useSignUp } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const PASSWORD_RULES = [
  { label: '8+ characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
];

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: signUp, isPending, error } = useSignUp();

  const set =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signUp(form);
  };

  const passwordStrength = PASSWORD_RULES.filter((r) =>
    r.test(form.password),
  ).length;

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
              Create account
            </CardTitle>
            <CardDescription className='text-sm text-[--foreground-secondary]'>
              Start tracking your expenses with AI
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
              {/* Full Name */}
              <div className='space-y-2'>
                <Label className='text-[10px] font-mono text-[--foreground-secondary] uppercase tracking-widest'>
                  Full Name
                </Label>
                <Input
                  type='text'
                  autoComplete='name'
                  value={form.name}
                  onChange={set('name')}
                  placeholder='John Doe'
                  required
                  className='bg-[#0a0a0c] border-[#1c1c22] text-[--foreground] placeholder:text-[--foreground-secondary]/50 focus-visible:ring-[--primary]/30 focus-visible:border-[--primary]/50'
                />
              </div>

              {/* Email */}
              <div className='space-y-2'>
                <Label className='text-[10px] font-mono text-[--foreground-secondary] uppercase tracking-widest'>
                  Email
                </Label>
                <Input
                  type='email'
                  autoComplete='email'
                  value={form.email}
                  onChange={set('email')}
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
                    autoComplete='new-password'
                    value={form.password}
                    onChange={set('password')}
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

                {/* Password strength rules */}
                {form.password.length > 0 && (
                  <div className='space-y-2 pt-1'>
                    {/* Strength bar */}
                    <div className='flex gap-1'>
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className='h-1 flex-1 rounded-full transition-all duration-300'
                          style={{
                            backgroundColor:
                              passwordStrength >= step
                                ? passwordStrength === 1
                                  ? '#ef4444'
                                  : passwordStrength === 2
                                    ? '#f59e0b'
                                    : passwordStrength === 3
                                      ? '#84cc16'
                                      : '#22c55e'
                                : '#1c1c22',
                          }}
                        />
                      ))}
                    </div>

                    {/* Rule badges */}
                    <div className='flex flex-wrap gap-1.5'>
                      {PASSWORD_RULES.map((rule) => {
                        const ok = rule.test(form.password);
                        return (
                          <Badge
                            key={rule.label}
                            variant='outline'
                            className={[
                              'text-[10px] font-mono gap-1 px-1.5 py-0.5 transition-colors',
                              ok
                                ? 'border-green-900/40 bg-green-950/20 text-green-400'
                                : 'border-[#1c1c22] bg-[#0a0a0c] text-[--foreground-secondary]',
                            ].join(' ')}
                          >
                            {ok ? (
                              <Check className='h-2.5 w-2.5' />
                            ) : (
                              <Circle className='h-2.5 w-2.5' />
                            )}
                            {rule.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
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
                    Create Account
                    <ArrowRight className='h-4 w-4' />
                  </>
                )}
              </Button>
            </form>

            <p className='text-center text-sm text-[--foreground-secondary] mt-6'>
              Already have an account?{' '}
              <Link
                to='/login'
                className='text-[--primary] hover:underline font-medium transition-colors'
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
