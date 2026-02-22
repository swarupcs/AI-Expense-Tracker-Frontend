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
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
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
    <div style={{ padding: '16px 24px 20px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '10px',
            background: focused
              ? 'rgba(124,92,252,0.06)'
              : 'rgba(13,13,26,0.8)',
            border: `1px solid ${focused ? 'rgba(124,92,252,0.4)' : 'rgba(124,92,252,0.15)'}`,
            borderRadius: '16px',
            padding: '8px 8px 8px 16px',
            transition: 'all 0.2s',
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
                : 'Ask about your finances, add expenses, get insights…'
            }
            rows={1}
            style={{
              flex: 1,
              resize: 'none',
              border: 'none',
              background: 'transparent',
              color: '#f0efff',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '15px',
              lineHeight: '1.6',
              outline: 'none',
              padding: '8px 0',
              minHeight: '44px',
              maxHeight: '180px',
              cursor: disabled ? 'not-allowed' : 'text',
            }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              paddingBottom: '4px',
            }}
          >
            <button
              type='button'
              disabled
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'not-allowed',
                color: 'rgba(74,72,112,0.4)',
              }}
            >
              <Mic style={{ width: '15px', height: '15px' }} />
            </button>

            <button
              type='button'
              disabled={!canSubmit}
              onClick={handleSubmit}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                background: canSubmit
                  ? 'linear-gradient(135deg, #7c5cfc, #00d4ff)'
                  : 'rgba(74,72,112,0.2)',
                boxShadow: canSubmit ? '0 0 15px rgba(124,92,252,0.4)' : 'none',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              <ArrowUp
                style={{
                  width: '16px',
                  height: '16px',
                  color: canSubmit ? '#fff' : 'rgba(74,72,112,0.5)',
                }}
                strokeWidth={2.5}
              />
            </button>
          </div>
        </div>

        <p
          style={{
            textAlign: 'center',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '10px',
            color: '#4a4870',
            marginTop: '8px',
            letterSpacing: '0.05em',
          }}
        >
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
