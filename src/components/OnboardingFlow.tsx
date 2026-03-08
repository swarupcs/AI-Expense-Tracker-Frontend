import { useState } from 'react';
import { useUpdateUserSettings } from '@/services/auth.service';
import { useCreateExpense } from '@/services/expenses.service';
import { useUpsertBudget } from '@/services/budget.service';
import type { Category } from '@/api/expenses.api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Zap, ArrowRight, CheckCircle2, Sparkles, PiggyBank, Receipt, ChevronRight,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  'DINING', 'SHOPPING', 'TRANSPORT', 'ENTERTAINMENT',
  'UTILITIES', 'HEALTH', 'EDUCATION', 'OTHER',
];

const CATEGORY_EMOJI: Record<Category, string> = {
  DINING: '🍽️', SHOPPING: '🛍️', TRANSPORT: '🚗',
  ENTERTAINMENT: '🎮', UTILITIES: '⚡', HEALTH: '💊',
  EDUCATION: '📚', OTHER: '📦',
};

const TOTAL_STEPS = 4;

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ current }: { current: number }) {
  return (
    <div className='flex items-center gap-2'>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className='rounded-full transition-all duration-300'
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            background: i <= current
              ? 'linear-gradient(90deg, #7c5cfc, #00d4ff)'
              : 'rgba(124,92,252,0.15)',
          }}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: Props) {
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState(0);

  // Step 2 — expense form
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<Category>('DINING');
  const [expError, setExpError] = useState('');

  // Step 3 — budget form
  const [budCategory, setBudCategory] = useState<Category>('DINING');
  const [budAmount, setBudAmount] = useState('');
  const [budError, setBudError] = useState('');

  const { mutate: createExpense, isPending: savingExp } = useCreateExpense();
  const { mutate: upsertBudget, isPending: savingBud } = useUpsertBudget();
  const { mutate: updateSettings, isPending: savingSettings } = useUpdateUserSettings();

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  function next() { setStep((s) => s + 1); }

  function handleExpense() {
    if (!expTitle.trim()) { setExpError('Please enter a title'); return; }
    const amt = parseFloat(expAmount);
    if (!amt || amt <= 0) { setExpError('Please enter a valid amount'); return; }
    setExpError('');
    createExpense(
      { title: expTitle.trim(), amount: amt, category: expCategory, date: new Date().toISOString().split('T')[0] },
      { onSuccess: next, onError: () => next() }, // skip on error — don't block onboarding
    );
  }

  function handleBudget() {
    const amt = parseFloat(budAmount);
    if (!amt || amt <= 0) { setBudError('Please enter a valid amount'); return; }
    setBudError('');
    upsertBudget(
      { category: budCategory, amount: amt },
      { onSuccess: next, onError: () => next() },
    );
  }

  function handleFinish() {
    updateSettings(
      { onboardingCompleted: true },
      { onSuccess: onComplete, onError: onComplete },
    );
  }

  return (
    <div
      className='fixed inset-0 z-[200] flex items-center justify-center p-4'
      style={{ background: 'rgba(8,8,16,0.96)', backdropFilter: 'blur(16px)' }}
    >
      <div
        className='w-full max-w-md rounded-3xl p-8 relative overflow-hidden'
        style={{
          background: 'rgba(13,13,26,0.95)',
          border: '1px solid rgba(124,92,252,0.2)',
          boxShadow: '0 0 80px rgba(124,92,252,0.15)',
        }}
      >
        {/* Glow orb */}
        <div
          className='absolute -top-20 -right-20 w-48 h-48 rounded-full pointer-events-none'
          style={{ background: 'radial-gradient(circle, rgba(124,92,252,0.15), transparent 70%)' }}
        />

        {/* Step dots */}
        <div className='flex justify-between items-center mb-8'>
          <StepDots current={step} />
          <span className='font-mono text-[10px] text-[#4a4870]'>
            {step + 1} / {TOTAL_STEPS}
          </span>
        </div>

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <div className='space-y-6'>
            <div
              className='w-14 h-14 rounded-2xl flex items-center justify-center'
              style={{
                background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                boxShadow: '0 0 28px rgba(124,92,252,0.5)',
              }}
            >
              <Zap className='w-7 h-7 text-white' strokeWidth={2.5} />
            </div>

            <div>
              <h1 className='font-display text-2xl font-extrabold text-[#f0efff] tracking-tight mb-2'>
                Welcome to Spendly,<br />{firstName}! 👋
              </h1>
              <p className='font-sans text-sm text-[#8b89b0] leading-relaxed'>
                Let's get you set up in under 2 minutes.
              </p>
            </div>

            <div className='space-y-3'>
              {[
                { icon: Receipt, text: 'Track every expense, automatically', color: '#7c5cfc' },
                { icon: PiggyBank, text: 'Set budgets and get alerted', color: '#00d4ff' },
                { icon: Sparkles, text: 'Ask AI questions about your spending', color: '#00ff87' },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text} className='flex items-center gap-3'>
                  <div
                    className='w-8 h-8 rounded-xl flex items-center justify-center shrink-0'
                    style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                  >
                    <Icon className='w-4 h-4' style={{ color }} />
                  </div>
                  <span className='font-sans text-sm text-[#c8c6e8]'>{text}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={next}
              className='w-full h-12 gap-2 font-display font-bold text-base'
              style={{
                background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                border: 'none',
                boxShadow: '0 0 24px rgba(124,92,252,0.4)',
              }}
            >
              Get Started <ArrowRight className='w-5 h-5' />
            </Button>
          </div>
        )}

        {/* ── Step 1: Add first expense ── */}
        {step === 1 && (
          <div className='space-y-5'>
            <div>
              <div className='font-mono text-[10px] text-[#7c5cfc] uppercase tracking-widest mb-1'>
                Step 1 of 2
              </div>
              <h2 className='font-display text-xl font-bold text-[#f0efff]'>
                Add your first expense
              </h2>
              <p className='font-sans text-sm text-[#4a4870] mt-1'>
                Log something you spent money on recently.
              </p>
            </div>

            {expError && (
              <p className='text-sm text-[#ff6b6b] bg-red-950/20 border border-red-900/30 rounded-xl px-3 py-2'>
                {expError}
              </p>
            )}

            <div className='space-y-1.5'>
              <Label className='font-sans text-xs text-[#8b89b0]'>What did you spend on?</Label>
              <Input
                placeholder='e.g. Coffee, Uber, Groceries…'
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                className='h-11 bg-[rgba(124,92,252,0.06)] border-[rgba(124,92,252,0.15)] text-[#f0efff] placeholder:text-[#4a4870] focus-visible:ring-[#7c5cfc]'
                autoFocus
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='font-sans text-xs text-[#8b89b0]'>Amount (₹)</Label>
                <Input
                  type='number'
                  placeholder='0'
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className='h-11 bg-[rgba(124,92,252,0.06)] border-[rgba(124,92,252,0.15)] text-[#f0efff] placeholder:text-[#4a4870] focus-visible:ring-[#7c5cfc]'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='font-sans text-xs text-[#8b89b0]'>Category</Label>
                <Select value={expCategory} onValueChange={(v) => setExpCategory(v as Category)}>
                  <SelectTrigger className='h-11 bg-[rgba(124,92,252,0.06)] border-[rgba(124,92,252,0.15)] text-[#f0efff]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: '#0d0d1a', border: '1px solid rgba(124,92,252,0.2)' }}>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className='text-[#f0efff] focus:bg-[rgba(124,92,252,0.1)]'>
                        {CATEGORY_EMOJI[c]} {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='flex gap-3 pt-1'>
              <Button
                variant='ghost'
                onClick={next}
                className='flex-1 text-[#4a4870] hover:text-[#8b89b0] border border-[rgba(124,92,252,0.08)]'
              >
                Skip for now
              </Button>
              <Button
                onClick={handleExpense}
                disabled={savingExp}
                className='flex-1 gap-2 font-semibold'
                style={{ background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)', border: 'none' }}
              >
                {savingExp ? 'Saving…' : <>Save <ChevronRight className='w-4 h-4' /></>}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Set first budget ── */}
        {step === 2 && (
          <div className='space-y-5'>
            <div>
              <div className='font-mono text-[10px] text-[#7c5cfc] uppercase tracking-widest mb-1'>
                Step 2 of 2
              </div>
              <h2 className='font-display text-xl font-bold text-[#f0efff]'>
                Set a monthly budget
              </h2>
              <p className='font-sans text-sm text-[#4a4870] mt-1'>
                Spendly will alert you when you're getting close.
              </p>
            </div>

            {budError && (
              <p className='text-sm text-[#ff6b6b] bg-red-950/20 border border-red-900/30 rounded-xl px-3 py-2'>
                {budError}
              </p>
            )}

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='font-sans text-xs text-[#8b89b0]'>Category</Label>
                <Select value={budCategory} onValueChange={(v) => setBudCategory(v as Category)}>
                  <SelectTrigger className='h-11 bg-[rgba(124,92,252,0.06)] border-[rgba(124,92,252,0.15)] text-[#f0efff]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ background: '#0d0d1a', border: '1px solid rgba(124,92,252,0.2)' }}>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className='text-[#f0efff] focus:bg-[rgba(124,92,252,0.1)]'>
                        {CATEGORY_EMOJI[c]} {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1.5'>
                <Label className='font-sans text-xs text-[#8b89b0]'>Monthly limit (₹)</Label>
                <Input
                  type='number'
                  placeholder='e.g. 5000'
                  value={budAmount}
                  onChange={(e) => setBudAmount(e.target.value)}
                  className='h-11 bg-[rgba(124,92,252,0.06)] border-[rgba(124,92,252,0.15)] text-[#f0efff] placeholder:text-[#4a4870] focus-visible:ring-[#7c5cfc]'
                  autoFocus
                />
              </div>
            </div>

            <div className='flex gap-3 pt-1'>
              <Button
                variant='ghost'
                onClick={next}
                className='flex-1 text-[#4a4870] hover:text-[#8b89b0] border border-[rgba(124,92,252,0.08)]'
              >
                Skip for now
              </Button>
              <Button
                onClick={handleBudget}
                disabled={savingBud}
                className='flex-1 gap-2 font-semibold'
                style={{ background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)', border: 'none' }}
              >
                {savingBud ? 'Saving…' : <>Save <ChevronRight className='w-4 h-4' /></>}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: All done ── */}
        {step === 3 && (
          <div className='space-y-6 text-center'>
            <div className='flex justify-center'>
              <div
                className='w-16 h-16 rounded-2xl flex items-center justify-center'
                style={{
                  background: 'linear-gradient(135deg, rgba(0,255,135,0.2), rgba(0,212,255,0.2))',
                  border: '1px solid rgba(0,255,135,0.3)',
                  boxShadow: '0 0 28px rgba(0,255,135,0.2)',
                }}
              >
                <CheckCircle2 className='w-8 h-8 text-[#00ff87]' />
              </div>
            </div>

            <div>
              <h2 className='font-display text-2xl font-extrabold text-[#f0efff] mb-2'>
                You're all set! 🎉
              </h2>
              <p className='font-sans text-sm text-[#8b89b0] leading-relaxed'>
                Spendly is ready to help you take control of your finances.
                Head to the dashboard to see your overview.
              </p>
            </div>

            <div className='space-y-2 text-left'>
              {[
                '💬 Ask AI Chat to log expenses naturally',
                '🎯 Visit Budgets to set more limits',
                '🔄 Use Recurring for fixed monthly bills',
              ].map((tip) => (
                <div
                  key={tip}
                  className='flex items-center gap-2 px-3 py-2 rounded-xl'
                  style={{ background: 'rgba(124,92,252,0.06)', border: '1px solid rgba(124,92,252,0.1)' }}
                >
                  <span className='font-sans text-sm text-[#c8c6e8]'>{tip}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={handleFinish}
              disabled={savingSettings}
              className='w-full h-12 gap-2 font-display font-bold text-base'
              style={{
                background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                border: 'none',
                boxShadow: '0 0 24px rgba(124,92,252,0.4)',
              }}
            >
              {savingSettings ? 'Loading…' : <>Go to Dashboard <ArrowRight className='w-5 h-5' /></>}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
