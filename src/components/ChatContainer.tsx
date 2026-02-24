import { useEffect, useRef, useState, useId } from 'react';
import type { StreamMessage } from '@/types/StreamMessage.types';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import {
  Cpu,
  BarChart2,
  PlusCircle,
  TrendingUp,
  Target,
  Trash2,
  Zap,
} from 'lucide-react';
import { streamChat, chatApi } from '@/api/chat.api';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const SUGGESTIONS = [
  {
    icon: BarChart2,
    text: 'Show my spending this month as a chart',
    color: '#7c5cfc',
  },
  { icon: PlusCircle, text: 'Add expense: Coffee ₹180', color: '#00d4ff' },
  { icon: TrendingUp, text: 'What did I spend last week?', color: '#00ff87' },
  { icon: Target, text: 'How can I reduce dining costs?', color: '#ffb830' },
];

export function ChatContainer() {
  const threadId = useId();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cancel any in-flight stream when the component unmounts
  useEffect(() => {
    return () => {
      cancelRef.current?.();
    };
  }, []);

  const addMessage = (msg: Omit<StreamMessage, 'id'>) => {
    const id = `${threadId}-${crypto.randomUUID()}`;
    setMessages((prev) => [...prev, { ...msg, id } as StreamMessage]);
  };

  const handleClearHistory = async () => {
    await chatApi.deleteHistory(threadId);
    setMessages([]);
    setShowClearConfirm(false);
  };

  const handleSubmit = (userInput: string) => {
    if (!userInput.trim() || isStreaming) return;
    addMessage({ type: 'user', payload: { text: userInput } });
    setIsStreaming(true);

    let currentAiId: string | null = null;

    cancelRef.current = streamChat(userInput, threadId, {
      onMessage: (msg) => {
        if (msg.type === 'ai') {
          if (currentAiId === null) {
            const id = `${Date.now()}-${Math.random()}`;
            currentAiId = id;
            setMessages((prev) => [
              ...prev,
              {
                id,
                type: 'ai',
                payload: { text: msg.payload.text },
              } as StreamMessage,
            ]);
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === currentAiId && m.type === 'ai'
                  ? {
                      ...m,
                      payload: { text: m.payload.text + msg.payload.text },
                    }
                  : m,
              ),
            );
          }
        } else {
          currentAiId = null;
          addMessage(msg as Omit<StreamMessage, 'id'>);
        }
      },
      onError: (err) => {
        console.error('Stream error:', err);
        addMessage({
          type: 'ai',
          payload: { text: 'Sorry, something went wrong. Please try again.' },
        });
        setIsStreaming(false);
      },
      onDone: () => setIsStreaming(false),
    });
  };

  return (
    <div
      className='flex flex-col h-full overflow-hidden'
      style={{ background: '#080810' }}
    >
      {/* Header */}
      <div
        className='shrink-0 px-3 sm:px-6 py-3 sm:py-4'
        style={{
          borderBottom: '1px solid rgba(124,92,252,0.1)',
          background: 'rgba(8,8,16,0.95)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className='max-w-[760px] mx-auto flex items-center justify-between'>
          <div className='flex items-center gap-2 sm:gap-3.5'>
            <div
              className='w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center'
              style={{
                background:
                  'linear-gradient(135deg, rgba(124,92,252,0.3), rgba(0,212,255,0.2))',
                border: '1px solid rgba(124,92,252,0.3)',
                boxShadow: '0 0 20px rgba(124,92,252,0.2)',
              }}
            >
              <Cpu className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#9d7fff]' />
            </div>
            <div>
              <div className='font-display text-sm sm:text-base font-bold text-[#f0efff]'>
                Finance Assistant
              </div>
              <div className='font-mono text-[9px] text-[#4a4870] tracking-widest uppercase hidden sm:block'>
                AI-Powered Insights
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {messages.length > 0 && !isStreaming && (
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setShowClearConfirm(true)}
                className='w-8 h-8 sm:w-[34px] sm:h-[34px] rounded-lg hover:bg-[rgba(255,59,92,0.1)] hover:border-[rgba(255,59,92,0.2)] hover:text-[#ff3b5c] text-[#4a4870] border border-transparent transition-all'
              >
                <Trash2 className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
              </Button>
            )}
            {isStreaming ? (
              <div
                className='flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full'
                style={{
                  background: 'rgba(124,92,252,0.1)',
                  border: '1px solid rgba(124,92,252,0.25)',
                }}
              >
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className='w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full'
                    style={{
                      background: '#9d7fff',
                      animation: `bounce 1s ${delay}ms ease-in-out infinite`,
                    }}
                  />
                ))}
                <span className='font-mono text-[9px] sm:text-[10px] text-[#9d7fff] ml-0.5'>
                  Thinking
                </span>
              </div>
            ) : (
              <div
                className='flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full'
                style={{
                  background: 'rgba(0,255,135,0.07)',
                  border: '1px solid rgba(0,255,135,0.2)',
                }}
              >
                <div
                  className='w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full'
                  style={{
                    background: '#00ff87',
                    boxShadow: '0 0 6px #00ff87',
                  }}
                />
                <span className='font-mono text-[9px] sm:text-[10px] text-[#00ff87]'>
                  Ready
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clear confirm modal */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent
          className='border-[rgba(255,59,92,0.3)] max-w-[90vw] sm:max-w-md'
          style={{
            background: '#0d0d1a',
            boxShadow: '0 0 60px rgba(255,59,92,0.1)',
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className='font-display text-[#f0efff]'>
              Clear conversation?
            </AlertDialogTitle>
            <AlertDialogDescription className='text-[#8b89b0]'>
              All messages in this thread will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className='border-[rgba(255,255,255,0.1)] text-[#8b89b0]'
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearHistory}
              className='border-[rgba(255,59,92,0.3)] text-[#ff3b5c] font-display font-semibold'
              style={{ background: 'rgba(255,59,92,0.15)' }}
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Messages */}
      <div className='flex-1 min-h-0 overflow-y-auto'>
        <div className='max-w-[760px] mx-auto'>
          {messages.length === 0 ? (
            <div className='flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 text-center'>
              <div
                className='w-14 h-14 sm:w-[72px] sm:h-[72px] rounded-2xl flex items-center justify-center mb-5 sm:mb-6'
                style={{
                  background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                  boxShadow: '0 0 40px rgba(124,92,252,0.4)',
                }}
              >
                <Zap
                  className='w-7 h-7 sm:w-8 sm:h-8 text-white'
                  strokeWidth={2}
                />
              </div>
              <h2 className='font-display text-2xl sm:text-3xl font-extrabold text-[#f0efff] tracking-tight mb-2 sm:mb-3'>
                What can I help with?
              </h2>
              <p className='text-[#4a4870] text-sm sm:text-base max-w-sm leading-relaxed mb-8 sm:mb-10'>
                Ask about spending, add expenses, get charts, or get
                personalized financial advice.
              </p>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 w-full max-w-[520px]'>
                {SUGGESTIONS.map(({ icon: Icon, text, color }) => (
                  <button
                    key={text}
                    onClick={() => handleSubmit(text)}
                    className='flex items-start gap-3 p-3 sm:p-4 rounded-2xl text-left transition-all text-[#8b89b0] hover:text-[#f0efff] font-sans text-sm leading-relaxed'
                    style={{
                      background: 'rgba(13,13,26,0.8)',
                      border: '1px solid rgba(124,92,252,0.12)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        `${color}40`;
                      (e.currentTarget as HTMLElement).style.background =
                        `${color}08`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        'rgba(124,92,252,0.12)';
                      (e.currentTarget as HTMLElement).style.background =
                        'rgba(13,13,26,0.8)';
                    }}
                  >
                    <Icon
                      className='w-4 h-4 shrink-0 mt-0.5'
                      style={{ color }}
                    />
                    <span>{text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isStreaming && (
                <div className='flex gap-3 sm:gap-3.5 px-3 sm:px-6 py-4 sm:py-5'>
                  <div
                    className='w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0'
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(124,92,252,0.3), rgba(0,212,255,0.2))',
                      border: '1px solid rgba(124,92,252,0.3)',
                    }}
                  >
                    <Cpu className='w-3.5 h-3.5 text-[#9d7fff]' />
                  </div>
                  <div className='flex items-center gap-1.5 pt-1.5'>
                    {[0, 150, 300].map((delay) => (
                      <div
                        key={delay}
                        className='w-1.5 h-1.5 rounded-full'
                        style={{
                          background: '#9d7fff',
                          animation: `bounce 1s ${delay}ms ease-in-out infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messageEndRef} style={{ height: '16px' }} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div
        className='shrink-0'
        style={{
          borderTop: '1px solid rgba(124,92,252,0.1)',
          background: 'rgba(8,8,16,0.95)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <ChatInput onSubmit={handleSubmit} disabled={isStreaming} />
      </div>

      <style>{`
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      `}</style>
    </div>
  );
}
