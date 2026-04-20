import React, { useState, useRef, useEffect } from 'react';
import type { User, ChatMessage } from '../types';
import { Send, Users, MessageCircle, Zap, Volume2, VolumeX, Eye, Edit3 } from 'lucide-react';

interface Props {
  users: User[];
  currentUser: User;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  partyMode: boolean;
  onToggleParty: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  active: '편집 중',
  reading: '읽는 중',
  focus: '집중 모드',
  away: '자리 비움',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  active: <Edit3 size={10} />,
  reading: <Eye size={10} />,
  focus: <Zap size={10} />,
  away: <VolumeX size={10} />,
};

const STATUS_COLOR: Record<string, string> = {
  active: '#10B981',
  reading: '#3B82F6',
  focus: '#F59E0B',
  away: '#94A3B8',
};

function UserCard({ user, isParty }: { user: User; isParty: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 10px', borderRadius: 8,
      background: isParty ? `${user.color}11` : 'rgba(255,255,255,0.6)',
      border: `1px solid ${isParty ? user.color + '33' : '#E0E7FF'}`,
      transition: 'all 0.2s',
    }}>
      {/* Avatar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: user.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 13,
          boxShadow: isParty ? `0 0 0 2px ${user.color}` : 'none',
        }}>
          {user.avatar}
        </div>
        <div style={{
          position: 'absolute', bottom: -1, right: -1,
          width: 10, height: 10, borderRadius: '50%',
          background: STATUS_COLOR[user.status],
          border: '1.5px solid #fff',
        }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {user.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: STATUS_COLOR[user.status] }}>
          {STATUS_ICONS[user.status]}
          <span>{STATUS_LABELS[user.status]}</span>
        </div>
      </div>

      {/* Current doc badge */}
      <div style={{
        fontSize: 9, color: '#64748B',
        background: '#F1F5F9', borderRadius: 4,
        padding: '2px 5px', maxWidth: 70,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {user.currentDoc}
      </div>
    </div>
  );
}

function ChatBubble({ msg, isOwn }: { msg: ChatMessage; isOwn: boolean }) {
  const time = new Date(msg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isOwn ? 'flex-end' : 'flex-start',
      gap: 3, animation: 'fadeIn 0.2s ease',
    }}>
      {!isOwn && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingLeft: 4 }}>
          <div style={{
            width: 14, height: 14, borderRadius: '50%',
            background: msg.userColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 7, fontWeight: 700,
          }}>
            {msg.userName[0]}
          </div>
          <span style={{ fontSize: 10, color: '#64748B', fontWeight: 500 }}>{msg.userName}</span>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flexDirection: isOwn ? 'row-reverse' : 'row' }}>
        <div style={{
          maxWidth: 200, padding: '7px 10px', borderRadius: isOwn ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
          background: isOwn ? '#3B82F6' : '#fff',
          color: isOwn ? '#fff' : '#1E293B',
          fontSize: 12, lineHeight: 1.5,
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          border: isOwn ? 'none' : '1px solid #E2E8F0',
        }}>
          {msg.anchorText && (
            <div style={{
              fontSize: 10, color: isOwn ? 'rgba(255,255,255,0.7)' : '#94A3B8',
              borderLeft: `2px solid ${isOwn ? 'rgba(255,255,255,0.5)' : '#3B82F6'}`,
              paddingLeft: 6, marginBottom: 4,
              fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160,
            }}>
              "{msg.anchorText}"
            </div>
          )}
          {msg.content}
        </div>
        <span style={{ fontSize: 9, color: '#CBD5E1', flexShrink: 0 }}>{time}</span>
      </div>
    </div>
  );
}

export default function RightPanel({ users, currentUser, messages, onSendMessage, partyMode, onToggleParty }: Props) {
  const [tab, setTab] = useState<'users' | 'chat'>('users');
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    onSendMessage(text);
    setDraft('');
  };

  return (
    <aside style={{
      width: 280, background: '#EEF2FF',
      borderLeft: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Tab header */}
      <div style={{
        display: 'flex', borderBottom: '1px solid #DBEAFE',
        background: '#fff', flexShrink: 0,
      }}>
        {[
          { key: 'users' as const, label: '팀원', icon: <Users size={13} /> },
          { key: 'chat' as const, label: `채팅 ${messages.length > 0 ? `(${messages.length})` : ''}`, icon: <MessageCircle size={13} /> },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '10px 0', border: 'none', cursor: 'pointer', fontSize: 12,
              fontWeight: tab === t.key ? 600 : 400,
              background: 'transparent',
              color: tab === t.key ? '#3B82F6' : '#64748B',
              borderBottom: tab === t.key ? '2px solid #3B82F6' : '2px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Party mode banner */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #DBEAFE', flexShrink: 0 }}>
        <button
          onClick={onToggleParty}
          style={{
            width: '100%', padding: '8px 12px',
            borderRadius: 8, border: 'none', cursor: 'pointer',
            background: partyMode
              ? 'linear-gradient(135deg, #3B82F6, #7C3AED)'
              : 'rgba(59,130,246,0.1)',
            color: partyMode ? '#fff' : '#3B82F6',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontSize: 12, fontWeight: 600,
            boxShadow: partyMode ? '0 2px 12px rgba(59,130,246,0.4)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <Zap size={13} fill={partyMode ? '#fff' : 'none'} />
          {partyMode ? '🎉 파티 모드 진행 중' : '작업 파티 시작'}
          {partyMode && (
            <span style={{ fontSize: 10, opacity: 0.8 }}>· {users.length + 1}명 참여</span>
          )}
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
        {tab === 'users' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Current user first */}
            <UserCard user={{ ...currentUser, status: 'active' }} isParty={partyMode} />
            {users.map(u => (
              <UserCard key={u.id} user={u} isParty={partyMode} />
            ))}
            {users.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '32px 16px',
                color: '#94A3B8', fontSize: 12,
              }}>
                <Users size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
                <div>다른 탭에서 접속하면</div>
                <div>팀원이 여기 나타납니다</div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '32px 16px',
                color: '#94A3B8', fontSize: 12,
              }}>
                <MessageCircle size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
                <div>아직 메시지가 없습니다</div>
                <div style={{ fontSize: 10, marginTop: 4 }}>텍스트 선택 후 Cmd+/ 로</div>
                <div style={{ fontSize: 10 }}>인라인 댓글을 남겨보세요</div>
              </div>
            ) : (
              messages.map(msg => (
                <ChatBubble
                  key={msg.id}
                  msg={msg}
                  isOwn={msg.userId === currentUser.id}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat input */}
      {tab === 'chat' && (
        <div style={{
          padding: '8px 10px', borderTop: '1px solid #DBEAFE',
          background: '#fff', flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 6,
            background: '#F8FAFC', borderRadius: 10,
            border: '1px solid #E2E8F0', padding: '6px 8px',
          }}>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="메시지 입력... (Enter 전송)"
              rows={2}
              style={{
                flex: 1, border: 'none', outline: 'none', resize: 'none',
                background: 'transparent', fontSize: 12, color: '#1E293B',
                lineHeight: 1.5, fontFamily: 'Inter, sans-serif',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!draft.trim()}
              style={{
                width: 28, height: 28, borderRadius: 7, border: 'none',
                background: draft.trim() ? '#3B82F6' : '#E2E8F0',
                color: draft.trim() ? '#fff' : '#94A3B8',
                cursor: draft.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.15s',
              }}
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
