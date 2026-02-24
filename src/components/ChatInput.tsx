import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { ArrowUp, Mic } from 'lucide-react';

interface ChatInputProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = value.trim().length > 0 && !disabled;

  return (
    <div className='px-3 sm:px-6 pt-3 pb-3 sm:pb-4'>
      <div className='max-w-[760px] mx-auto'>
        <div
          className='flex items-end gap-2 rounded-2xl px-3 sm:px-4 pt-1.5 pb-1.5 sm:pb-2 transition-all duration-200'
          style={{
            background: focused
              ? 'rgba(124,92,252,0.06)'
              : 'rgba(13,13,26,0.8)',
            border: `1px solid ${focused ? 'rgba(124,92,252,0.4)' : 'rgba(124,92,252,0.15)'}`,
            boxShadow: focused
              ? '0 0 0 3px rgba(124,92,252,0.08), 0 0 30px rgba(124,92,252,0.08)'
              : 'none',
          }}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            placeholder={
              disabled
                ? 'AI is thinking…'
                : 'Ask about your finances, add expenses…'
            }
            rows={1}
            className='flex-1 resize-none border-none bg-transparent text-[#f0efff] font-sans text-sm sm:text-[15px] leading-relaxed outline-none py-2 min-h-[38px] max-h-[160px]'
            style={{
              fontFamily: '"DM Sans", sans-serif',
              cursor: disabled ? 'not-allowed' : 'text',
            }}
          />

          <div className='flex items-center gap-1 pb-1'>
            <button
              type='button'
              disabled
              className='w-8 h-8 rounded-lg flex items-center justify-center cursor-not-allowed text-[rgba(74,72,112,0.4)]'
            >
              <Mic className='w-4 h-4' />
            </button>

            <button
              type='button'
              disabled={!canSubmit}
              onClick={handleSubmit}
              className='w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0'
              style={{
                background: canSubmit
                  ? 'linear-gradient(135deg, #7c5cfc, #00d4ff)'
                  : 'rgba(74,72,112,0.2)',
                boxShadow: canSubmit ? '0 0 15px rgba(124,92,252,0.4)' : 'none',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}
            >
              <ArrowUp
                className='w-4 h-4'
                style={{ color: canSubmit ? '#fff' : 'rgba(74,72,112,0.5)' }}
                strokeWidth={2.5}
              />
            </button>
          </div>
        </div>

        <p className='text-center font-mono text-[9px] sm:text-[10px] text-[#4a4870] mt-1.5 sm:mt-2 tracking-wide'>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
