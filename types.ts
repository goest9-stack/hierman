export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64 string
  name: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  attachments?: Attachment[];
  timestamp: number;
  isError?: boolean;
}

export interface GenerationConfig {
  temperature: number;
  topK: number;
  topP: number;
  systemInstruction?: string;
}

export interface AppState {
  messages: Message[];
  isLoading: boolean;
  input: string;
  attachments: Attachment[];
  selectedModel: string;
  config: GenerationConfig;
}