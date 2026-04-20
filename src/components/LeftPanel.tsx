import type { User } from '../types';
import { FileText, Table2, Presentation, Clock } from 'lucide-react';

interface Props {
  users: User[];
  currentUser: User;
}

const FILES = [
  { name: '4월 팀 회의록', type: 'word', icon: FileText, color: '#3B82F6', activity: '방금 전' },
  { name: 'Q2 예산 계획', type: 'excel', icon: Table2, color: '#10B981', activity: '5분 전' },
  { name: '제품 로드맵', type: 'ppt', icon: Presentation, color: '#F59E0B', activity: '1시간 전' },
  { name: '기술 스펙 문서', type: 'word', icon: FileText, color: '#3B82F6', activity: '어제' },
];

const TIMELINE = [
  { user: '혜진', color: '#3B82F6', action: '인라인 댓글 작성', time: '14:32' },
  { user: '민준', color: '#10B981', action: '3섹션 편집', time: '14:28' },
  { user: '소연', color: '#F59E0B', action: '문서 접속', time: '14:15' },
];

export default function LeftPanel({ users, currentUser: _currentUser }: Props) {
  return (
    <aside style={{
      width: 240,
      background: '#EEF2FF',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Project Map */}
      <div style={{ padding: '14px 14px 8px', borderBottom: '1px solid #DBEAFE' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
          프로젝트 파일
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {FILES.map((f, i) => {
            const Icon = f.icon;
            const activeUser = users.find(u => u.currentDoc === f.name);
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 8,
                background: i === 0 ? '#fff' : 'transparent',
                cursor: 'pointer', transition: 'background 0.15s',
                border: i === 0 ? '1px solid #BFDBFE' : '1px solid transparent',
              }}
              onMouseEnter={e => { if (i !== 0) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.6)'; }}
              onMouseLeave={e => { if (i !== 0) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                <Icon size={14} color={f.color} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {f.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>{f.activity}</div>
                </div>
                {activeUser && (
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: activeUser.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 9, fontWeight: 700, flexShrink: 0,
                  }}>
                    {activeUser.avatar}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Context stack */}
      <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid #DBEAFE', flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
          관련 파일
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { name: '작년 Q2 회의록', hint: '참고 문서' },
            { name: '팀 연락처', hint: '자주 사용' },
          ].map((f, i) => (
            <div key={i} style={{
              padding: '8px 10px', borderRadius: 8,
              background: 'rgba(255,255,255,0.5)',
              border: '1px solid #E0E7FF',
              cursor: 'pointer',
            }}>
              <div style={{ fontSize: 11, color: '#6366F1', fontWeight: 500 }}>{f.hint}</div>
              <div style={{ fontSize: 12, color: '#1E293B', marginTop: 2 }}>{f.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid #DBEAFE' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={10} />
          오늘 활동
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TIMELINE.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                background: t.color, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 8, fontWeight: 700,
              }}>
                {t.user[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 11, color: '#1E293B', fontWeight: 500 }}>{t.user}</span>
                <span style={{ fontSize: 11, color: '#64748B' }}>이 {t.action}</span>
              </div>
              <span style={{ fontSize: 10, color: '#94A3B8', flexShrink: 0 }}>{t.time}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
