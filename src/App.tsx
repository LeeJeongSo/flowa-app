import { useState, useCallback, useEffect, useRef } from 'react';
import type { User, DocMode, ChatMessage, ChatThread, BroadcastEvent } from './types';
import { useCollaboration } from './hooks/useCollaboration';
import TopBar from './components/TopBar';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import Editor from './components/Editor';
import ExcelEditor from './components/ExcelEditor';
import PPTViewer from './components/PPTViewer';
import InlineChat from './components/InlineChat';

const USER_POOL: User[] = [
  { id: 'u1', name: '김혜진', color: '#3B82F6', avatar: '혜', status: 'active', currentDoc: '4월 팀 회의록' },
  { id: 'u2', name: '이민준', color: '#10B981', avatar: '민', status: 'reading', currentDoc: 'Q2 예산 계획' },
  { id: 'u3', name: '박소연', color: '#F59E0B', avatar: '소', status: 'focus', currentDoc: '4월 팀 회의록' },
  { id: 'u4', name: '최지훈', color: '#7C3AED', avatar: '지', status: 'active', currentDoc: '제품 로드맵' },
];

function pickCurrentUser(): User {
  const idx = parseInt(sessionStorage.getItem('flowa-user-idx') ?? '-1');
  if (idx >= 0 && idx < USER_POOL.length) return USER_POOL[idx];
  const next = (parseInt(localStorage.getItem('flowa-next-user') ?? '0')) % USER_POOL.length;
  localStorage.setItem('flowa-next-user', String(next + 1));
  sessionStorage.setItem('flowa-user-idx', String(next));
  return USER_POOL[next];
}

const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: 'm1', userId: 'u2', userName: '이민준', userColor: '#10B981',
    content: '3섹션 액션 아이템 담당자 명시하면 좋을 것 같아요!',
    timestamp: Date.now() - 12 * 60 * 1000,
  },
  {
    id: 'm2', userId: 'u3', userName: '박소연', userColor: '#F59E0B',
    content: '동의해요. 마감일도 같이 넣어주면 더 명확할 것 같아요 👍',
    anchorText: '주요 액션 아이템',
    timestamp: Date.now() - 8 * 60 * 1000,
  },
];

export default function App() {
  const [currentUser] = useState<User>(pickCurrentUser);
  const [mode, setMode] = useState<DocMode>('word');
  const [remoteUsers, setRemoteUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [partyMode, setPartyMode] = useState(false);
  const [remoteContent, setRemoteContent] = useState<string | undefined>();
  const editorWrapRef = useRef<HTMLDivElement>(null);

  const DOC_NAMES: Record<DocMode, string> = {
    word: '4월 팀 회의록',
    excel: 'Q2 예산 계획',
    ppt: '제품 로드맵',
  };

  const handleEvent = useCallback((event: BroadcastEvent) => {
    switch (event.type) {
      case 'join': {
        const u = event.payload as User;
        setRemoteUsers(prev => prev.find(x => x.id === u.id) ? prev : [...prev, u]);
        break;
      }
      case 'leave':
        setRemoteUsers(prev => prev.filter(u => u.id !== event.userId));
        break;
      case 'cursor':
        setRemoteUsers(prev => prev.map(u =>
          u.id === event.userId ? { ...u, cursorX: event.payload.x, cursorY: event.payload.y } : u
        ));
        break;
      case 'status':
        setRemoteUsers(prev => prev.map(u =>
          u.id === event.userId ? { ...u, status: event.payload.status } : u
        ));
        break;
      case 'content':
        setRemoteContent(event.payload.html);
        break;
      case 'chat':
        setMessages(prev => [...prev, event.payload as ChatMessage]);
        break;
      case 'gaze':
        setRemoteUsers(prev => prev.map(u =>
          u.id === event.userId ? { ...u, currentDoc: event.payload.doc } : u
        ));
        break;
    }
  }, []);

  const { broadcast } = useCollaboration(currentUser, handleEvent);

  useEffect(() => {
    broadcast('gaze', { doc: DOC_NAMES[mode] });
  }, [mode]);

  // Cmd+/ inline chat trigger
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        const selection = window.getSelection();
        const text = selection?.toString().trim();
        if (!text) return;
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        const wrapRect = editorWrapRef.current?.getBoundingClientRect();
        const threadId = `thread-${Date.now()}`;
        setThreads(prev => [...prev, {
          id: threadId,
          anchorId: threadId,
          anchorText: text.slice(0, 60),
          messages: [],
          resolved: false,
          position: {
            top: rect && wrapRect ? rect.bottom - wrapRect.top + 8 : 120,
            left: rect && wrapRect ? Math.min(rect.left - wrapRect.left, wrapRect.width - 300) : 60,
          },
        }]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSendMessage = useCallback((content: string) => {
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userColor: currentUser.color,
      content,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, msg]);
    broadcast('chat', msg);
  }, [currentUser, broadcast]);

  const handleAddThreadMessage = useCallback((threadId: string, content: string) => {
    setThreads(prev => prev.map(t =>
      t.id === threadId
        ? {
          ...t, messages: [...t.messages, {
            id: `tmsg-${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            userColor: currentUser.color,
            content,
            timestamp: Date.now(),
          }],
        }
        : t
    ));
  }, [currentUser]);

  const handleToggleParty = useCallback(() => {
    setPartyMode(p => {
      broadcast('status', { status: !p ? 'focus' : 'active' });
      return !p;
    });
  }, [broadcast]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar
        mode={mode}
        onModeChange={setMode}
        users={remoteUsers}
        currentUser={currentUser}
        docName={DOC_NAMES[mode]}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <LeftPanel users={remoteUsers} currentUser={currentUser} />

        <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }} ref={editorWrapRef}>
          {mode === 'word' && (
            <Editor
              currentUser={currentUser}
              users={remoteUsers}
              onContentChange={html => broadcast('content', { html })}
              remoteContent={remoteContent}
              onCursorMove={(x, y) => broadcast('cursor', { x, y })}
            />
          )}
          {mode === 'excel' && (
            <ExcelEditor currentUser={currentUser} users={remoteUsers} />
          )}
          {mode === 'ppt' && (
            <PPTViewer currentUser={currentUser} users={remoteUsers} />
          )}

          <InlineChat
            threads={threads}
            currentUser={currentUser}
            onAddMessage={handleAddThreadMessage}
            onResolve={id => setThreads(prev => prev.map(t => t.id === id ? { ...t, resolved: true } : t))}
            onClose={id => setThreads(prev => prev.filter(t => t.id !== id))}
          />
        </main>

        <RightPanel
          users={remoteUsers}
          currentUser={currentUser}
          messages={messages}
          onSendMessage={handleSendMessage}
          partyMode={partyMode}
          onToggleParty={handleToggleParty}
        />
      </div>

      {partyMode && (
        <div style={{
          position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
          color: '#fff', borderRadius: 20, padding: '6px 18px',
          fontSize: 12, fontWeight: 600, zIndex: 200,
          boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
          pointerEvents: 'none',
        }}>
          🎉 작업 파티 모드 — 팀원과 같은 화면을 보고 있어요
        </div>
      )}
    </div>
  );
}
