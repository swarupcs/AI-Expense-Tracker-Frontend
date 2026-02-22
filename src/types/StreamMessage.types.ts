// Base type from the API (server-sent stream events)
export type StreamMessageType =
  | { type: 'ai'; payload: { text: string } }
  | {
      type: 'toolCall:start';
      payload: { name: string; args: Record<string, unknown> };
    }
  | { type: 'tool'; payload: { name: string; result: Record<string, unknown> } }
  | { type: 'error'; payload: { text: string } };

// User message added client-side (not from stream)
export type UserMessage = {
  type: 'user';
  payload: { text: string };
};

// Full union used in ChatContainer state and ChatMessage renderer
export type StreamMessage = (StreamMessageType | UserMessage) & { id: string };
