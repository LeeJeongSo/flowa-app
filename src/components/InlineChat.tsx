import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, ChatThread, User } from '../types';
import { Send, X, CheckCircle, MessageCircle } from 'lucide-react';

interface Props {
  threads: ChatThread[];
  currentUser: User;
  onAddMessage: (threadId: string, content: string) => void;
  onResolve: (threadId: string) => void;
  onClose: (threadId: string) => void;
}

function ThreadPopup({
  thread,
  currentUser,
  onAddMessage,
  onResolve,
  onClose,
}: {
  thread: ChatThread;
  currentUser: User;
  onAddMessage: (threadId: string, content: string) => void;
  onResolve: (threadId: string) => void;
  onClose: (threadId: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.messages]);

  const send = () => {
    if (!draft.trim()) return;
    onAddMessage(thread.id, draft.trim());
    setDraft('');
  };

  return (
    <div
      className="fade-in"
      style={{
        position: 'absolute',
        top: thread.position.top,
        left: thread.position.left,
        width: 280,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #E0E7FF',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '8px 10px',
        borderBottom: '1px solid #F1F5F9',
        display: 'flex', alignItems: 'center', gap: 6,
        background: '#F8FAFF',
      }}>
        <MessageCircle size={12} color="#6366F1" />
        <div style={{
          flex: 1, fontSize: 11, color: '#64748B',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontStyle: 'italic',
        }}>
          "{thread.anchorText}"
        </div>
        <button
          onClick={() => onResolve(thread.id)}
          title="해결됨으로 표시"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#10B981', padding: 2, borderRadius: 4,
            display: 'flex', alignItems: 'center',
          }}
        >
          <CheckCircle size={14} />
        </button>
        <button
          onClick={() => onClose(thread.id)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#94A3B8', padding: 2, borderRadius: 4,
            display: 'flex', alignItems: 'center',
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ maxHeight: 200, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {thread.messages.map(msg => {
          const isOwn = msg.userId === currentUser.id;
          const time = new Date(msg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
          return (
            <div key={msg.id} style={{ display: 'flex', gap: 6, flexDirection: isOwn ? 'row-reverse' : 'row' }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: msg.userColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 9, fontWeight: 700,
              }}>
                {msg.userName[0]}
              </div>
              <div style={{ maxWidth: 180 }}>
                <div style={{
                  fontSize: 11, color: '#94A3B8', marginBottom: 2,
                  textAlign: isOwn ? 'right' : 'left',
                }}>
                  {isOwn ? '나' : msg.userName} · {time}
                </div>
                <div style={{
                  padding: '6px 9px', borderRadius: isOwn ? '8px 2px 8px 8px' : '2px 8px 8px 8px',
                  background: isOwn ? '#3B82F6' : '#F1F5F9',
                  color: isOwn ? '#fff' : '#1E293B',
                  fontSize: 12, lineHeight: 1.45,
                }}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '6px 10px', borderTop: '1px solid #F1F5F9',
        display: 'flex', gap: 6, alignItems: 'center',
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          background: currentUser.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 9, fontWeight: 700,
        }}>
          {currentUser.avatar}
        </div>
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') send();
            if (e.key === 'Escape') onClose(thread.id);
          }}
          placeholder="댓글 작성..."
          style={{
            flex: 1, border: 'none', outline: 'none',
            fontSize: 12, color: '#1E293B', background: 'transparent',
          }}
        />
        <button
          onClick={send}
          disabled={!draft.trim()}
          style={{
            width: 24, height: 24, borderRadius: 6, border: 'none',
            background: draft.trim() ? '#3B82F6' : '#E2E8F0',
            color: draft.trim() ? '#fff' : '#94A3B8',
            cursor: draft.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          <Send size={11} />
        </button>
      </div>
    </div>
  );
}

export default function InlineChat({ threads, currentUser, onAddMessage, onResolve, onClose }: Props) {
  const activeThreads = threads.filter(t => !t.resolved);

  if (activeThreads.length === 0) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 90 }}>
      {activeThreads.map(thread => (
        <div key={thread.id} style={{ pointerEvents: 'auto' }}>
          <ThreadPopup
            thread={thread}
            currentUser={currentUser}
            onAddMessage={onAddMessage}
            onResolve={onResolve}
            onClose={onClose}
          />
        </div>
      ))}
    </div>
  );
}
