import { useEffect, useRef, useState, useId } from 'react';
import type { StreamMessage } from '@/types/Streammessage.types';
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

  const addMessage = (msg: Omit<StreamMessage, 'id'>) => {
    const id = `${threadId}-${messages.length}-${crypto.randomUUID()}`;
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
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        background: '#080810',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid rgba(124,92,252,0.1)',
          background: 'rgba(8,8,16,0.95)',
          padding: '18px 24px',
          flexShrink: 0,
          backdropFilter: 'blur(20px)',
        }}
      >
        <div
          style={{
            maxWidth: '760px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background:
                  'linear-gradient(135deg, rgba(124,92,252,0.3), rgba(0,212,255,0.2))',
                border: '1px solid rgba(124,92,252,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(124,92,252,0.2)',
              }}
            >
              <Cpu
                style={{ width: '18px', height: '18px', color: '#9d7fff' }}
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: '"Syne", sans-serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#f0efff',
                }}
              >
                Finance Assistant
              </div>
              <div
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '10px',
                  color: '#4a4870',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                AI-Powered Insights
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {messages.length > 0 && !isStreaming && (
              <button
                onClick={() => setShowClearConfirm(true)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#4a4870',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    'rgba(255,59,92,0.1)';
                  (e.currentTarget as HTMLElement).style.borderColor =
                    'rgba(255,59,92,0.2)';
                  (e.currentTarget as HTMLElement).style.color = '#ff3b5c';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    'transparent';
                  (e.currentTarget as HTMLElement).style.borderColor =
                    'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#4a4870';
                }}
              >
                <Trash2 style={{ width: '15px', height: '15px' }} />
              </button>
            )}
            {isStreaming ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  background: 'rgba(124,92,252,0.1)',
                  border: '1px solid rgba(124,92,252,0.25)',
                  borderRadius: '20px',
                }}
              >
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: '#9d7fff',
                      animation: `bounce 1s ${delay}ms ease-in-out infinite`,
                    }}
                  />
                ))}
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '10px',
                    color: '#9d7fff',
                    marginLeft: '2px',
                  }}
                >
                  Thinking
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '6px 12px',
                  background: 'rgba(0,255,135,0.07)',
                  border: '1px solid rgba(0,255,135,0.2)',
                  borderRadius: '20px',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#00ff87',
                    boxShadow: '0 0 6px #00ff87',
                  }}
                />
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '10px',
                    color: '#00ff87',
                  }}
                >
                  Ready
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clear confirm modal */}
      {showClearConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#0d0d1a',
              border: '1px solid rgba(255,59,92,0.3)',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '380px',
              width: '90%',
              boxShadow: '0 0 60px rgba(255,59,92,0.1)',
            }}
          >
            <div
              style={{
                fontFamily: '"Syne", sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                color: '#f0efff',
                marginBottom: '10px',
              }}
            >
              Clear conversation?
            </div>
            <p
              style={{
                color: '#8b89b0',
                fontSize: '14px',
                marginBottom: '24px',
                lineHeight: 1.6,
              }}
            >
              All messages in this thread will be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: '#8b89b0',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255,59,92,0.15)',
                  border: '1px solid rgba(255,59,92,0.3)',
                  borderRadius: '10px',
                  color: '#ff3b5c',
                  fontFamily: '"Syne", sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          {messages.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '65vh',
                padding: '40px 24px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #7c5cfc, #00d4ff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  boxShadow: '0 0 40px rgba(124,92,252,0.4)',
                }}
              >
                <Zap
                  style={{ width: '32px', height: '32px', color: '#fff' }}
                  strokeWidth={2}
                />
              </div>
              <h2
                style={{
                  fontFamily: '"Syne", sans-serif',
                  fontSize: '30px',
                  fontWeight: 800,
                  color: '#f0efff',
                  letterSpacing: '-0.5px',
                  marginBottom: '10px',
                }}
              >
                What can I help with?
              </h2>
              <p
                style={{
                  color: '#4a4870',
                  fontSize: '15px',
                  maxWidth: '380px',
                  lineHeight: 1.7,
                  marginBottom: '40px',
                }}
              >
                Ask about spending, add expenses, get charts, or get
                personalized financial advice.
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  width: '100%',
                  maxWidth: '520px',
                }}
              >
                {SUGGESTIONS.map(({ icon: Icon, text, color }) => (
                  <button
                    key={text}
                    onClick={() => handleSubmit(text)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '16px',
                      background: 'rgba(13,13,26,0.8)',
                      border: `1px solid rgba(124,92,252,0.12)`,
                      borderRadius: '14px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      color: '#8b89b0',
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '13px',
                      lineHeight: 1.5,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        `${color}40`;
                      (e.currentTarget as HTMLElement).style.background =
                        `${color}08`;
                      (e.currentTarget as HTMLElement).style.color = '#f0efff';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor =
                        'rgba(124,92,252,0.12)';
                      (e.currentTarget as HTMLElement).style.background =
                        'rgba(13,13,26,0.8)';
                      (e.currentTarget as HTMLElement).style.color = '#8b89b0';
                    }}
                  >
                    <Icon
                      style={{
                        width: '16px',
                        height: '16px',
                        color,
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
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
                <div
                  style={{ display: 'flex', gap: '14px', padding: '20px 24px' }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background:
                        'linear-gradient(135deg, rgba(124,92,252,0.3), rgba(0,212,255,0.2))',
                      border: '1px solid rgba(124,92,252,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Cpu
                      style={{
                        width: '14px',
                        height: '14px',
                        color: '#9d7fff',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      paddingTop: '6px',
                    }}
                  >
                    {[0, 150, 300].map((delay) => (
                      <div
                        key={delay}
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
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
        style={{
          borderTop: '1px solid rgba(124,92,252,0.1)',
          background: 'rgba(8,8,16,0.95)',
          flexShrink: 0,
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
