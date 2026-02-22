import { useEffect, useRef, useState, useId } from 'react';
import type { StreamMessage } from '@/types/StreamMessage.types';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import {
  Zap,
  BarChart2,
  PlusCircle,
  TrendingUp,
  Target,
  Trash2,
} from 'lucide-react';
import { streamChat, chatApi } from '@/api/chat.api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const SUGGESTIONS = [
  { icon: BarChart2, text: 'Show my spending this month as a chart' },
  { icon: PlusCircle, text: 'Add expense: Coffee ₹180' },
  { icon: TrendingUp, text: 'What did I spend last week?' },
  { icon: Target, text: 'How can I reduce dining costs?' },
];

export function 
ChatContainer() {
  const threadId = useId();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (msg: Omit<StreamMessage, 'id'>) => {
    const id = `${Date.now()}-${Math.random()}`;
    setMessages((prev) => [...prev, { ...msg, id } as StreamMessage]);
  };

  const handleClearHistory = async () => {
    await chatApi.deleteHistory(threadId);
    setMessages([]);
  };

const handleSubmit = (userInput: string) => {
  if (!userInput.trim() || isStreaming) return;
  addMessage({ type: 'user', payload: { text: userInput } });
  setIsStreaming(true);

  // Track the streaming AI message id
  let streamingId: string | null = null;

  cancelRef.current = streamChat(userInput, threadId, {
    onMessage: (msg) => {
      const streamMsg = msg as Omit<StreamMessage, 'id'>;

      if (streamMsg.type === 'ai') {
        if (streamingId) {
          // Append token to existing AI message bubble
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamingId && m.type === 'ai'
                ? {
                    ...m,
                    payload: { text: m.payload.text + streamMsg.payload.text },
                  }
                : m,
            ),
          );
        } else {
          // Create first AI message bubble and remember its id
          streamingId = `${Date.now()}-${Math.random()}`;
          setMessages((prev) => [
            ...prev,
            { ...streamMsg, id: streamingId } as StreamMessage,
          ]);
        }
      } else {
        // Non-AI messages (tool, toolCall:start, error) get their own bubble
        streamingId = null; // reset so next AI chunk starts fresh
        addMessage(streamMsg);
      }
    },
    onError: (err) => {
      console.error('Stream error:', err);
      streamingId = null;
      addMessage({
        type: 'ai',
        payload: { text: 'Sorry, something went wrong. Please try again.' },
      });
      setIsStreaming(false);
    },
    onDone: () => {
      streamingId = null;
      setIsStreaming(false);
    },
  });
};

  return (
    <TooltipProvider>
      <div className='flex flex-col h-screen bg-[--background]'>
        {/* Header */}
        <div className='shrink-0 border-b border-[#1c1c22] bg-[#0a0a0c] px-6 py-4'>
          <div className='max-w-3xl mx-auto flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-xl bg-[--primary] flex items-center justify-center shrink-0'>
                <Zap
                  className='w-4 h-4 text-[--primary-foreground]'
                  strokeWidth={2.5}
                />
              </div>
              <div>
                <h1 className='font-display text-base font-bold text-[--foreground]'>
                  Finance Assistant
                </h1>
                <p className='text-[10px] font-mono text-[--foreground-secondary] uppercase tracking-widest'>
                  AI-Powered Insights
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              {messages.length > 0 && !isStreaming && (
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 text-[--foreground-secondary] hover:text-red-400 hover:bg-red-950/20'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Clear conversation</TooltipContent>
                  </Tooltip>
                  <AlertDialogContent className='bg-[#111114] border-[#1c1c22]'>
                    <AlertDialogHeader>
                      <AlertDialogTitle className='text-[--foreground]'>
                        Clear conversation?
                      </AlertDialogTitle>
                      <AlertDialogDescription className='text-[--foreground-secondary]'>
                        This will permanently delete all messages in this
                        thread. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className='bg-[#1a1a1f] border-[#1c1c22] text-[--foreground-secondary] hover:bg-[#222226] hover:text-[--foreground]'>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearHistory}
                        className='bg-red-600 text-white hover:bg-red-700'
                      >
                        Clear
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {isStreaming ? (
                <Badge
                  variant='outline'
                  className='gap-1.5 border-[--primary]/20 bg-[--primary]/10 text-[--primary] font-mono text-[10px] px-3 py-1'
                >
                  <span className='w-1.5 h-1.5 rounded-full bg-[--primary] animate-bounce [animation-delay:0ms]' />
                  <span className='w-1.5 h-1.5 rounded-full bg-[--primary] animate-bounce [animation-delay:150ms]' />
                  <span className='w-1.5 h-1.5 rounded-full bg-[--primary] animate-bounce [animation-delay:300ms]' />
                  Thinking
                </Badge>
              ) : (
                <Badge
                  variant='outline'
                  className='border-green-900/40 bg-[#0f1a10] text-green-400 font-mono text-[10px] px-3 py-1'
                >
                  ● Active
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className='flex-1'>
          <div className='max-w-3xl mx-auto'>
            {messages.length === 0 ? (
              <div className='flex flex-col items-center justify-center min-h-[70vh] px-6 py-12'>
                <div className='w-16 h-16 rounded-2xl bg-[--primary] flex items-center justify-center mb-6'>
                  <Zap
                    className='w-8 h-8 text-[--primary-foreground]'
                    strokeWidth={2}
                  />
                </div>
                <h2 className='font-display text-3xl font-bold text-[--foreground] mb-2 text-center'>
                  What can I help with?
                </h2>
                <p className='text-sm text-[--foreground-secondary] text-center max-w-sm mb-10'>
                  Ask about spending, add expenses, get charts, or get
                  personalized financial advice.
                </p>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg'>
                  {SUGGESTIONS.map(({ icon: Icon, text }) => (
                    <Button
                      key={text}
                      variant='outline'
                      onClick={() => handleSubmit(text)}
                      className='justify-start gap-3 h-auto px-3 py-3 rounded-xl bg-[#111114] border-[#1c1c22] text-[--foreground-secondary] hover:text-[--foreground] hover:border-[--primary]/30 hover:bg-[#161619] transition-all duration-150'
                    >
                      <Icon className='w-4 h-4 text-[--primary] shrink-0' />
                      <span className='text-sm text-left'>{text}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className='divide-y divide-[#1c1c22]'>
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {isStreaming && (
                  <div className='flex gap-4 py-5 px-6'>
                    <div className='shrink-0 w-7 h-7 rounded-lg bg-[--primary] flex items-center justify-center'>
                      <span className='text-xs font-mono font-bold text-[--primary-foreground]'>
                        AI
                      </span>
                    </div>
                    <div className='flex items-center gap-1.5 pt-2'>
                      <span className='w-1.5 h-1.5 rounded-full bg-[--primary] animate-bounce [animation-delay:0ms]' />
                      <span className='w-1.5 h-1.5 rounded-full bg-[--primary] animate-bounce [animation-delay:150ms]' />
                      <span className='w-1.5 h-1.5 rounded-full bg-[--primary] animate-bounce [animation-delay:300ms]' />
                    </div>
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator className='bg-[#1c1c22]' />
        <ChatInput onSubmit={handleSubmit} disabled={isStreaming} />
      </div>
    </TooltipProvider>
  );
}
