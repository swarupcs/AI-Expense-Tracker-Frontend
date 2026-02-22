import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { ArrowUp, Mic } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ChatInputProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
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
    <TooltipProvider>
      <div className='shrink-0 border-t border-[#1c1c22] bg-[#0a0a0c] px-4 py-4'>
        <div className='max-w-3xl mx-auto'>
          <div
            className={[
              'flex items-end gap-2 rounded-2xl border bg-[#111114] transition-all duration-200',
              disabled
                ? 'border-[#1c1c22] opacity-60'
                : 'border-[#1c1c22] focus-within:border-[--primary]/40 focus-within:ring-1 focus-within:ring-[--primary]/10',
            ].join(' ')}
          >
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={
                disabled
                  ? 'AI is thinking…'
                  : 'Ask about your finances, add expenses, get insights…'
              }
              rows={1}
              className='
                flex-1 resize-none border-0 bg-transparent shadow-none
                text-[--foreground] placeholder:text-[--foreground-secondary]/50
                text-sm px-4 py-3.5 min-h-[52px] max-h-[200px]
                focus-visible:ring-0 focus-visible:ring-offset-0
                leading-relaxed disabled:cursor-not-allowed
              '
            />

            <div className='flex items-center gap-1 p-2.5'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 hidden sm:inline-flex text-[--foreground-secondary]/40 hover:text-[--foreground-secondary] hover:bg-[#1a1a1f]'
                  >
                    <Mic className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='top'>
                  <p>Voice input (coming soon)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type='button'
                    size='icon'
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                    className={[
                      'h-8 w-8 shrink-0 rounded-lg transition-all duration-150',
                      canSubmit
                        ? 'bg-[--primary] text-[--primary-foreground] hover:bg-[--primary]/90 shadow-sm'
                        : 'bg-[#1a1a1f] text-[--foreground-secondary]/30',
                    ].join(' ')}
                  >
                    <ArrowUp className='h-4 w-4' strokeWidth={2.5} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='top'>
                  <p>Send (Enter)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <p className='text-center text-[10px] font-mono text-[--foreground-secondary]/30 mt-2 tracking-wide'>
            <kbd className='font-sans'>Enter</kbd> to send ·{' '}
            <kbd className='font-sans'>Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
