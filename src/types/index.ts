export type DocMode = 'word' | 'excel' | 'ppt';

export interface User {
  id: string;
  name: string;
  color: string;
  avatar: string;
  status: 'active' | 'reading' | 'focus' | 'away';
  currentDoc: string;
  cursorX?: number;
  cursorY?: number;
  scrollY?: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  content: string;
  anchorId?: string;
  anchorText?: string;
  timestamp: number;
  resolved?: boolean;
}

export interface ChatThread {
  id: string;
  anchorId: string;
  anchorText: string;
  messages: ChatMessage[];
  resolved: boolean;
  position: { top: number; left: number };
}

export interface BroadcastEvent {
  type: 'cursor' | 'content' | 'chat' | 'status' | 'join' | 'leave' | 'gaze';
  userId: string;
  payload: any;
}

export interface ExcelCell {
  value: string;
  formula?: string;
  bold?: boolean;
  align?: 'left' | 'center' | 'right';
  bg?: string;
}

export interface Slide {
  id: string;
  title: string;
  content: string;
  bg: string;
  titleColor: string;
}
