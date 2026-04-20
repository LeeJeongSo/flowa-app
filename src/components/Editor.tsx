import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import type { User } from '../types';
import {
  Bold, Italic, Strikethrough,
  List, ListOrdered, Quote, Code, Minus, Heading1, Heading2, Heading3,
  Undo, Redo,
} from 'lucide-react';

interface Props {
  currentUser: User;
  users: User[];
  onContentChange?: (html: string) => void;
  remoteContent?: string;
  onCursorMove?: (x: number, y: number) => void;
}

const INITIAL_CONTENT = `<h1>4월 팀 회의록</h1>
<p><strong>일시:</strong> 2026년 4월 20일 (월) 오후 2:00</p>
<p><strong>참석자:</strong> 혜진, 민준, 소연, 지훈</p>
<p><strong>진행자:</strong> 혜진</p>
<hr>
<h2>1. 이번 분기 주요 성과</h2>
<p>Q1 목표 대비 <strong>112% 달성</strong>. 특히 신규 사용자 유입에서 예상치를 크게 웃돌았으며, 리텐션 지표도 전월 대비 8%p 상승했습니다.</p>
<ul>
  <li>MAU: 24,500 → 31,200 (+27%)</li>
  <li>전환율: 3.2% → 4.1%</li>
  <li>NPS: 42 → 61</li>
</ul>
<h2>2. 다음 분기 계획</h2>
<p>Q2에는 협업 기능 고도화와 모바일 경험 개선에 집중합니다. 특히 <mark>Flowa 실시간 협업 모듈</mark> 출시가 핵심 마일스톤입니다.</p>
<blockquote>
  "팀원이 지금 어디를 보고 있는지 알 수 있다면, 슬랙을 열 이유가 없다." — 김혜진
</blockquote>
<h3>주요 액션 아이템</h3>
<ol>
  <li>인라인 컨텍스트 채팅 MVP 개발 착수 (담당: 민준)</li>
  <li>시선 브로드캐스트 UX 리서치 (담당: 소연)</li>
  <li>기술 스택 최종 결정 및 아키텍처 문서화 (담당: 지훈)</li>
</ol>
<h2>3. 기타 논의 사항</h2>
<p>다음 팀 워크샵 일정은 5월 첫째 주로 잠정 확정. 장소 및 세부 일정은 추후 공유 예정입니다.</p>`;

const ToolBtn = ({ onClick, active, title, children }: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      padding: '4px 6px',
      borderRadius: 4,
      border: 'none',
      cursor: 'pointer',
      background: active ? '#DBEAFE' : 'transparent',
      color: active ? '#1D4ED8' : '#475569',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.12s',
    }}
    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = '#F1F5F9'; }}
    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
  >
    {children}
  </button>
);

const Divider = () => (
  <div style={{ width: 1, height: 20, background: '#E2E8F0', margin: '0 2px' }} />
);

export default function Editor({ currentUser: _currentUser, users, onContentChange, remoteContent, onCursorMove }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: '내용을 입력하세요...' }),
      Highlight.configure({ multicolor: false }),
    ],
    content: INITIAL_CONTENT,
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getHTML());
    },
  });

  // Sync remote content
  useEffect(() => {
    if (remoteContent && editor && !editor.isFocused) {
      const current = editor.getHTML();
      if (current !== remoteContent) {
        editor.commands.setContent(remoteContent);
      }
    }
  }, [remoteContent, editor]);

  // Track cursor for presence
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) {
      onCursorMove?.(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  if (!editor) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8FAFC' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1,
        padding: '6px 12px', background: '#fff',
        borderBottom: '1px solid #E2E8F0',
        flexShrink: 0,
      }}>
        {/* Undo/Redo */}
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="실행 취소">
          <Undo size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="다시 실행">
          <Redo size={14} />
        </ToolBtn>
        <Divider />

        {/* Headings */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="제목 1"
        >
          <Heading1 size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="제목 2"
        >
          <Heading2 size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="제목 3"
        >
          <Heading3 size={14} />
        </ToolBtn>
        <Divider />

        {/* Text formatting */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="굵게"
        >
          <Bold size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="기울임"
        >
          <Italic size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="취소선"
        >
          <Strikethrough size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive('highlight')}
          title="형광펜"
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: editor.isActive('highlight') ? '#1D4ED8' : '#475569' }}>H</span>
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="코드"
        >
          <Code size={14} />
        </ToolBtn>
        <Divider />

        {/* Lists */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="글머리 기호"
        >
          <List size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="번호 목록"
        >
          <ListOrdered size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="인용구"
        >
          <Quote size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="구분선"
        >
          <Minus size={14} />
        </ToolBtn>
      </div>

      {/* Editor area */}
      <div
        ref={wrapperRef}
        onMouseMove={handleMouseMove}
        style={{
          flex: 1, overflowY: 'auto', position: 'relative',
          background: '#F8FAFC',
        }}
      >
        <div style={{
          maxWidth: 780, margin: '0 auto',
          background: '#fff',
          minHeight: 'calc(100% - 40px)',
          marginTop: 24, marginBottom: 24,
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <EditorContent editor={editor} />
        </div>

        {/* Remote cursor overlays */}
        {users.map(u => u.cursorX !== undefined && u.cursorY !== undefined ? (
          <div key={u.id} style={{
            position: 'absolute',
            left: (u.cursorX ?? 0),
            top: (u.cursorY ?? 0),
            pointerEvents: 'none',
            zIndex: 50,
            transform: 'translate(-2px, -2px)',
          }}>
            {/* Cursor */}
            <svg width="12" height="18" viewBox="0 0 12 18">
              <path d="M0 0 L0 14 L4 10 L7 17 L9 16 L6 9 L11 9 Z" fill={u.color} />
            </svg>
            {/* Label */}
            <div style={{
              background: u.color,
              color: '#fff',
              fontSize: 10, fontWeight: 600,
              padding: '1px 5px', borderRadius: 3,
              whiteSpace: 'nowrap',
              marginTop: -2, marginLeft: 10,
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }}>
              {u.name}
            </div>
          </div>
        ) : null)}
      </div>

      {/* Status bar */}
      <div style={{
        height: 24, background: '#fff', borderTop: '1px solid #E2E8F0',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, color: '#94A3B8' }}>
          {editor.storage?.characterCount?.characters?.() ?? ''} 자
        </span>
        <span style={{ fontSize: 11, color: '#94A3B8' }}>
          Cmd+/ 로 인라인 채팅
        </span>
        <span style={{ fontSize: 11, color: '#10B981', marginLeft: 'auto' }}>
          ● 자동 저장됨
        </span>
      </div>
    </div>
  );
}
