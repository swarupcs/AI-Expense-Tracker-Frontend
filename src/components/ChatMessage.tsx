import { useState } from 'react';
import {
  User,
  Zap,
  AlertTriangle,
  Wrench,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { StreamMessage } from '@/types/StreamMessage.types';

interface ChatMessageProps {
  message: StreamMessage;
}

// ─── Tool call block (collapsible, amber) ─────────────────────────────────────
function ToolCallBlock({
  name,
  args,
}: {
  name: string;
  args?: Record<string, unknown>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className='rounded-lg border border-[#1c1c22] bg-[#0d0d10] overflow-hidden'>
        <CollapsibleTrigger asChild>
          <Button
            variant='ghost'
            className='w-full flex items-center justify-start gap-2.5 px-3 py-2 h-auto rounded-none hover:bg-[#111114] text-left'
          >
            <Wrench className='h-3 w-3 text-amber-400 shrink-0' />
            <Badge
              variant='outline'
              className='border-amber-900/40 bg-amber-950/20 text-amber-400 font-mono text-[10px] px-1.5 py-0'
            >
              tool
            </Badge>
            <span className='text-xs font-mono text-amber-400 flex-1 truncate'>
              {name}
            </span>
            {open ? (
              <ChevronDown className='h-3 w-3 text-[--foreground-secondary] shrink-0' />
            ) : (
              <ChevronRight className='h-3 w-3 text-[--foreground-secondary] shrink-0' />
            )}
          </Button>
        </CollapsibleTrigger>

        {args && (
          <CollapsibleContent>
            <ScrollArea className='max-h-48'>
              <pre className='px-3 pb-3 pt-1 text-[11px] font-mono text-[--foreground-secondary] leading-relaxed'>
                {JSON.stringify(args, null, 2)}
              </pre>
              <ScrollBar orientation='horizontal' />
            </ScrollArea>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
}

// ─── Tool result block (collapsible, green) ───────────────────────────────────
function ToolResultBlock({
  name,
  result,
}: {
  name: string;
  result: Record<string, unknown>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className='rounded-lg border border-green-900/30 bg-green-950/10 overflow-hidden'>
        <CollapsibleTrigger asChild>
          <Button
            variant='ghost'
            className='w-full flex items-center justify-start gap-2.5 px-3 py-2 h-auto rounded-none hover:bg-green-950/20 text-left'
          >
            <span className='w-1.5 h-1.5 rounded-full bg-green-400 shrink-0' />
            <Badge
              variant='outline'
              className='border-green-900/40 bg-green-950/20 text-green-400 font-mono text-[10px] px-1.5 py-0'
            >
              result
            </Badge>
            <span className='text-xs font-mono text-green-400 flex-1 truncate'>
              {name}
            </span>
            {open ? (
              <ChevronDown className='h-3 w-3 text-green-400/50 shrink-0' />
            ) : (
              <ChevronRight className='h-3 w-3 text-green-400/50 shrink-0' />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <ScrollArea className='max-h-48'>
            <pre className='px-3 pb-3 pt-1 text-[11px] font-mono text-green-400/70 leading-relaxed'>
              {JSON.stringify(result, null, 2)}
            </pre>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ─── Inline markdown renderer ─────────────────────────────────────────────────
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className='font-semibold text-[--foreground]'>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className='px-1.5 py-0.5 rounded bg-[#1a1a1f] text-[--primary] text-[11px] font-mono'
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// ─── AI text content with light markdown ─────────────────────────────────────
function AiTextContent({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div className='text-sm text-[--foreground] leading-relaxed space-y-1.5'>
      {lines.map((line, i) => {
        if (line.startsWith('### ')) {
          return (
            <h3
              key={i}
              className='font-semibold text-[--foreground] text-sm mt-3 mb-0.5'
            >
              {line.slice(4)}
            </h3>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2
              key={i}
              className='font-bold text-[--foreground] text-base mt-4 mb-1'
            >
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <div key={i} className='flex gap-2 items-start'>
              <span className='text-[--primary] mt-[5px] text-[8px] shrink-0'>
                ◆
              </span>
              <span>{renderInline(line.slice(2))}</span>
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} className='h-1' />;
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function ChatMessage({ message }: ChatMessageProps) {
  // User message
  if (message.type === 'user') {
    return (
      <div className='flex gap-4 py-5 px-6 justify-end'>
        <div className='max-w-[75%]'>
          <div className='bg-[--primary] rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm'>
            <p className='text-sm text-[--primary-foreground] leading-relaxed'>
              {message.payload.text}
            </p>
          </div>
        </div>
        <div className='shrink-0 w-7 h-7 rounded-lg bg-[#1c1c22] border border-[#2a2a32] flex items-center justify-center mt-0.5'>
          <User className='h-3.5 w-3.5 text-[--foreground-secondary]' />
        </div>
      </div>
    );
  }

  // Tool call start
  if (message.type === 'toolCall:start') {
    return (
      <div className='flex gap-4 py-3 px-6'>
        <div className='shrink-0 w-7 h-7 rounded-lg bg-amber-950/20 border border-amber-900/20 flex items-center justify-center mt-0.5'>
          <Wrench className='h-3.5 w-3.5 text-amber-400' />
        </div>
        <div className='flex-1 pt-0.5'>
          <ToolCallBlock
            name={message.payload.name}
            args={message.payload.args}
          />
        </div>
      </div>
    );
  }

  // Tool result
  if (message.type === 'tool') {
    return (
      <div className='flex gap-4 py-3 px-6'>
        <div className='shrink-0 w-7 h-7 rounded-lg bg-green-950/20 border border-green-900/20 flex items-center justify-center mt-0.5'>
          <Zap className='h-3.5 w-3.5 text-green-400' />
        </div>
        <div className='flex-1 pt-0.5'>
          <ToolResultBlock
            name={message.payload.name}
            result={message.payload.result}
          />
        </div>
      </div>
    );
  }

  // Error
  if (message.type === 'error') {
    return (
      <div className='flex gap-4 py-5 px-6'>
        <div className='shrink-0 w-7 h-7 rounded-lg bg-red-950/30 border border-red-900/30 flex items-center justify-center mt-0.5'>
          <AlertTriangle className='h-3.5 w-3.5 text-red-400' />
        </div>
        <div className='flex-1 pt-1'>
          <div className='bg-red-950/20 border border-red-900/20 rounded-xl px-4 py-3'>
            <p className='text-sm text-red-400 leading-relaxed'>
              {message.payload.text}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // AI message
  if (message.type === 'ai') {
    return (
      <div className='flex gap-4 py-5 px-6'>
        <div className='shrink-0 w-7 h-7 rounded-lg bg-[--primary] flex items-center justify-center mt-0.5'>
          <span className='text-[10px] font-mono font-bold text-[--primary-foreground]'>
            AI
          </span>
        </div>
        <div className='flex-1 pt-0.5 min-w-0'>
          <AiTextContent text={message.payload.text} />
        </div>
      </div>
    );
  }

  return null;
}
