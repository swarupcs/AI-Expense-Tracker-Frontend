export type StreamMessageType =
  | { type: 'ai'; payload: { text: string } }
  | {
      type: 'toolCall:start';
      payload: { name: string; args: Record<string, unknown> };
    }
  | { type: 'tool'; payload: { name: string; result: Record<string, unknown> } }
  | { type: 'error'; payload: { text: string } };

export type UserMessage = { type: 'user'; payload: { text: string } };

export type StreamMessage = (StreamMessageType | UserMessage) & { id: string };
