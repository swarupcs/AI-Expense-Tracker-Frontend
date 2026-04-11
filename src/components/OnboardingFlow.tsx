import { useState, useEffect, useRef } from 'react';
import {
  useOnboardingWelcome,
  useSendOnboardingMessage,
} from '@/services/onboarding.service';
import { useUpdateUserSettings } from '@/services/auth.service';
import type { OnboardingState, OnboardingMessage } from '@/api/onboarding.api';
import {
  Zap,
  Send,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Bot,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Step progress dots ───────────────────────────────────────────────────────

const STEPS = [
  'WELCOME',
  'INCOME',
  'TOP_CATEGORIES',
  'SET_BUDGETS',
  'SET_GOALS',
  'RECURRING',
  'COMPLETE',
] as const;

function StepDots({ currentStep }: { currentStep: string }) {
  const idx = STEPS.indexOf(currentStep as (typeof STEPS)[number]);
  const progress = idx < 0 ? 0 : idx;

  return (
    <div className='flex items-center gap-1.5'>
      {STEPS.slice(0, -1).map((_, i) => (
        <div
          key={i}
          className='rounded-full transition-all duration-500'
          style={{
            width: i === progress ? 20 : 6,
            height: 6,
            background:
              i < progress
                ? 'linear-gradient(90deg, #7c5cfc, #00d4ff)'
                : i === progress
                  ? 'linear-gradient(90deg, #7c5cfc, #00d4ff)'
                  : 'rgba(124,92,252,0.15)',
            opacity: i <= progress ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
}

// ─── Chat bubble ──────────────────────────────────────────────────────────────

function Bubble({ role, text }: { role: 'assistant' | 'user'; text: string }) {
  const isUser = role === 'user';
  return (
    <div
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}
    >
      {/* Avatar */}
      <div
        className='w-7 h-7 rounded-xl flex items-center justify-center shrink-0'
        style={{
          background: isUser
            ? 'linear-gradient(135deg, rgba(124,92,252,0.3), rgba(0,212,255,0.2))'
            : 'rgba(124,92,252,0.15)',
          border: `1px solid ${isUser ? 'rgba(124,92,252,0.3)' : 'rgba(124,92,252,0.2)'}`,
        }}
      >
        {isUser ? (
          <User className='w-3.5 h-3.5 text-[#9d7fff]' />
        ) : (
          <Bot className='w-3.5 h-3.5 text-[#7c5cfc]' />
        )}
      </div>

      {/* Bubble */}
      <div
        className='max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed font-sans'
        style={
          isUser
            ? {
                background:
                  'linear-gradient(135deg, rgba(124,92,252,0.25), rgba(0,212,255,0.15))',
                border: '1px solid rgba(124,92,252,0.3)',
                color: '#f0efff',
                borderRadius: '16px 16px 4px 16px',
              }
            : {
                background: 'rgba(13,13,26,0.9)',
                border: '1px solid rgba(124,92,252,0.12)',
                color: '#d4d2f0',
                borderRadius: '16px 16px 16px 4px',
              }
        }
      >
        {text}
      </div>
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className='flex gap-2.5 items-end'>
      <div
        className='w-7 h-7 rounded-xl flex items-center justify-center shrink-0'
        style={{
          background: 'rgba(124,92,252,0.15)',
          border: '1px solid rgba(124,92,252,0.2)',
        }}
      >
        <Bot className='w-3.5 h-3.5 text-[#7c5cfc]' />
      </div>
      <div
        className='px-4 py-3 rounded-[16px_16px_16px_4px]'
        style={{
          background: 'rgba(13,13,26,0.9)',
          border: '1px solid rgba(124,92,252,0.12)',
        }}
      >
        <div className='flex gap-1.5 items-center'>
          {[0, 150, 300].map((delay) => (
            <div
              key={delay}
              className='w-1.5 h-1.5 rounded-full'
              style={{
                background: '#7c5cfc',
                animation: `bounce 1s ${delay}ms ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Quick reply chips ────────────────────────────────────────────────────────

const QUICK_REPLIES: Record<string, string[]> = {
  WELCOME: ["Let's go!", 'Sure, get me started'],
  INCOME: ['₹50,000', '₹80,000', '₹1,20,000', '₹2,00,000'],
  TOP_CATEGORIES: [
    'Dining, Shopping, Transport',
    'Dining, Utilities, Health',
    'Shopping, Entertainment, Transport',
  ],
  SET_BUDGETS: [
    'Yes, looks good!',
    'Let me adjust some',
    'Accept all suggestions',
  ],
  SET_GOALS: [
    'Emergency fund of ₹1,00,000',
    'No goals right now',
    'Vacation fund ₹50,000',
  ],
  RECURRING: [
    'Rent ₹15,000, Netflix ₹649',
    'No recurring expenses',
    'Just rent ₹20,000',
  ],
  COMPLETE: [],
};

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Chat state
  const [history, setHistory] = useState<OnboardingMessage[]>([]);
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    step: 'WELCOME',
  });
  const [inputValue, setInputValue] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  // API hooks
  const { data: welcome, isLoading: loadingWelcome } = useOnboardingWelcome();
  const { mutate: sendMessage, isPending: sending } =
    useSendOnboardingMessage();
  const { mutate: markComplete } = useUpdateUserSettings();

  // Seed initial assistant message from backend welcome
  useEffect(() => {
    if (welcome?.message && history.length === 0) {
      setHistory([{ role: 'assistant', content: welcome.message }]);
      setOnboardingState(welcome.initialState ?? { step: 'WELCOME' });
    }
  }, [welcome]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, sending]);

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setInputValue('');

    const userMsg: OnboardingMessage = { role: 'user', content: trimmed };
    const updatedHistory = [...history, userMsg];
    setHistory(updatedHistory);

    sendMessage(
      {
        message: trimmed,
        state: onboardingState,
        history: updatedHistory,
        applyActions: true, // let backend create budgets/goals/settings
      },
      {
        onSuccess: (res) => {
          const assistantMsg: OnboardingMessage = {
            role: 'assistant',
            content: res.message,
          };
          setHistory((prev) => [...prev, assistantMsg]);
          setOnboardingState(res.state);

          if (res.isComplete || res.nextStep === 'COMPLETE') {
            setIsComplete(true);
          }
        },
        onError: () => {
          // Fallback: show generic error in chat
          setHistory((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: 'Sorry, I ran into an issue. Could you try again?',
            },
          ]);
        },
      },
    );
  };

  const handleFinish = () => {
    markComplete(
      { onboardingCompleted: true },
      { onSuccess: onComplete, onError: onComplete },
    );
  };

  const quickReplies = QUICK_REPLIES[onboardingState.step] ?? [];

  return (
    <div
      className='fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4'
      style={{ background: 'rgba(8,8,16,0.97)', backdropFilter: 'blur(16px)' }}
    >
      <div
        className='w-full max-w-lg h-full max-h-[680px] flex flex-col rounded-3xl overflow-hidden relative'
        style={{
          background: 'rgba(10,10,20,0.98)',
          border: '1px solid rgba(124,92,252,0.2)',
          boxShadow: '0 0 80px rgba(124,92,252,0.15)',
        }}
      >
        {/* Glow orb */}
        <div
          className='absolute -top-24 -right-24 w-56 h-56 rounded-full pointer-events-none'
          style={{
            background:
              'radial-gradient(circle, rgba(124,92,252,0.12), transparent 70%)',
          }}
        />

        {/* ── Header ── */}
        <div
          className='shrink-0 px-5 py-4 flex items-center justify-between'
          style={{ borderBottom: '1px solid rgba(124,92,252,0.1)' }}
        >
          <div className='flex items-center gap-3'>
            <div
              className='w-9 h-9 rounded-xl flex items-center justify-center'
              style={{
                background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                boxShadow: '0 0 16px rgba(124,92,252,0.4)',
              }}
            >
              <Zap className='w-4 h-4 text-white' strokeWidth={2.5} />
            </div>
            <div>
              <p className='font-display text-sm font-bold text-[#f0efff]'>
                Spendly Setup
              </p>
              <p className='font-mono text-[9px] text-[#4a4870] uppercase tracking-widest'>
                AI-Powered Onboarding
              </p>
            </div>
          </div>

          <div className='flex flex-col items-end gap-1.5'>
            <StepDots currentStep={onboardingState.step} />
            <span className='font-mono text-[9px] text-[#4a4870]'>
              {onboardingState.step === 'COMPLETE'
                ? 'Done!'
                : `Step ${Math.max(0, STEPS.indexOf(onboardingState.step as (typeof STEPS)[number]))} of ${STEPS.length - 1}`}
            </span>
          </div>
        </div>

        {/* ── Chat messages ── */}
        <div className='flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3'>
          {loadingWelcome ? (
            <div className='flex items-center justify-center h-full'>
              <Loader2 className='w-6 h-6 text-[#7c5cfc] animate-spin' />
            </div>
          ) : (
            <>
              {history.map((msg, i) => (
                <Bubble key={i} role={msg.role} text={msg.content} />
              ))}
              {sending && <TypingIndicator />}

              {/* Complete state */}
              {isComplete && !sending && (
                <div
                  className='flex flex-col items-center gap-3 py-4 px-4 rounded-2xl text-center mt-2'
                  style={{
                    background: 'rgba(0,255,135,0.06)',
                    border: '1px solid rgba(0,255,135,0.2)',
                  }}
                >
                  <div
                    className='w-12 h-12 rounded-xl flex items-center justify-center'
                    style={{
                      background: 'rgba(0,255,135,0.12)',
                      border: '1px solid rgba(0,255,135,0.3)',
                    }}
                  >
                    <CheckCircle2 className='w-6 h-6 text-[#00ff87]' />
                  </div>
                  <p className='font-display text-base font-bold text-[#f0efff]'>
                    You're all set! 🎉
                  </p>
                  <Button
                    onClick={handleFinish}
                    className='gap-2 text-white font-display font-bold px-6'
                    style={{
                      background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                      boxShadow: '0 0 20px rgba(124,92,252,0.4)',
                    }}
                  >
                    Go to Dashboard <ArrowRight className='w-4 h-4' />
                  </Button>
                </div>
              )}

              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* ── Quick reply chips ── */}
        {!isComplete && quickReplies.length > 0 && !sending && (
          <div
            className='shrink-0 px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide'
            style={{ borderTop: '1px solid rgba(124,92,252,0.06)' }}
          >
            {quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => handleSend(reply)}
                className='shrink-0 px-3 py-1.5 rounded-full font-sans text-xs text-[#9d7fff] whitespace-nowrap transition-all'
                style={{
                  background: 'rgba(124,92,252,0.1)',
                  border: '1px solid rgba(124,92,252,0.2)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    'rgba(124,92,252,0.2)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    'rgba(124,92,252,0.1)';
                }}
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* ── Input ── */}
        {!isComplete && (
          <div
            className='shrink-0 px-4 py-3'
            style={{ borderTop: '1px solid rgba(124,92,252,0.1)' }}
          >
            <div
              className='flex items-center gap-2 rounded-2xl px-4 py-2 transition-all'
              style={{
                background: 'rgba(13,13,26,0.9)',
                border: '1px solid rgba(124,92,252,0.2)',
              }}
              onFocus={() => {}}
            >
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(inputValue);
                  }
                }}
                placeholder={sending ? 'AI is thinking…' : 'Type your answer…'}
                disabled={sending || loadingWelcome}
                className='flex-1 bg-transparent text-[#f0efff] font-sans text-sm outline-none placeholder:text-[#4a4870] disabled:cursor-not-allowed'
              />
              <button
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim() || sending}
                className='w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all'
                style={{
                  background:
                    inputValue.trim() && !sending
                      ? 'linear-gradient(135deg, #7c5cfc, #00d4ff)'
                      : 'rgba(74,72,112,0.2)',
                  boxShadow:
                    inputValue.trim() && !sending
                      ? '0 0 12px rgba(124,92,252,0.4)'
                      : 'none',
                  cursor:
                    inputValue.trim() && !sending ? 'pointer' : 'not-allowed',
                }}
              >
                {sending ? (
                  <Loader2 className='w-3.5 h-3.5 text-[#9d7fff] animate-spin' />
                ) : (
                  <Send
                    className='w-3.5 h-3.5'
                    style={{
                      color: inputValue.trim() ? '#fff' : 'rgba(74,72,112,0.5)',
                    }}
                  />
                )}
              </button>
            </div>
            <p className='text-center font-mono text-[9px] text-[#4a4870] mt-1.5'>
              Enter to send · or tap a suggestion above
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
