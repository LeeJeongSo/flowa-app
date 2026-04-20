import type { DocMode, User } from '../types';
import { FileText, Table2, Presentation, Zap, Bell } from 'lucide-react';

interface Props {
  mode: DocMode;
  onModeChange: (m: DocMode) => void;
  users: User[];
  currentUser: User;
  docName: string;
}

const MODE_TABS = [
  { key: 'word' as DocMode, label: 'Document', icon: FileText, color: '#3B82F6' },
  { key: 'excel' as DocMode, label: 'Spreadsheet', icon: Table2, color: '#10B981' },
  { key: 'ppt' as DocMode, label: 'Slides', icon: Presentation, color: '#F59E0B' },
];

const STATUS_COLOR: Record<string, string> = {
  active: '#10B981',
  reading: '#3B82F6',
  focus: '#F59E0B',
  away: '#94A3B8',
};

export default function TopBar({ mode, onModeChange, users, currentUser, docName }: Props) {
  return (
    <header style={{
      height: 52,
      background: 'var(--navy)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 8,
      flexShrink: 0,
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 12 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Zap size={15} color="#fff" fill="#fff" />
        </div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>FLOWA</span>
      </div>

      {/* Doc name */}
      <div style={{
        color: '#94A3B8', fontSize: 13, fontWeight: 500,
        padding: '4px 10px', borderRadius: 6,
        background: 'rgba(255,255,255,0.06)',
        marginRight: 8,
        maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {docName}
      </div>

      {/* Mode tabs */}
      <div style={{ display: 'flex', gap: 4, marginRight: 'auto' }}>
        {MODE_TABS.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => onModeChange(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: mode === key ? `${color}22` : 'transparent',
              color: mode === key ? color : '#94A3B8',
              fontSize: 13, fontWeight: mode === key ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Presence avatars */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {[currentUser, ...users].slice(0, 5).map((u, i) => (
            <div key={u.id} style={{ position: 'relative', marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: u.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 12,
                border: '2px solid var(--navy)',
                cursor: 'default',
              }} title={u.name}>
                {u.avatar}
              </div>
              <div style={{
                position: 'absolute', bottom: -1, right: -1,
                width: 9, height: 9, borderRadius: '50%',
                background: STATUS_COLOR[u.status],
                border: '1.5px solid var(--navy)',
              }} />
            </div>
          ))}
          {users.length > 4 && (
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: '#334155',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#94A3B8', fontSize: 11, fontWeight: 600,
              border: '2px solid var(--navy)', marginLeft: -8,
            }}>
              +{users.length - 4}
            </div>
          )}
        </div>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />
        <button style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#94A3B8', padding: 4, borderRadius: 6,
          display: 'flex', alignItems: 'center',
        }}>
          <Bell size={16} />
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '4px 10px', borderRadius: 6,
          background: 'rgba(255,255,255,0.06)',
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%',
            background: currentUser.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 11, fontWeight: 700,
          }}>
            {currentUser.avatar}
          </div>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 500 }}>{currentUser.name}</span>
        </div>
      </div>
    </header>
  );
}
