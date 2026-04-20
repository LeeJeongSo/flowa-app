import { useState } from 'react';
import type { User, Slide } from '../types';
import { ChevronLeft, ChevronRight, Play, Square } from 'lucide-react';

interface Props {
  currentUser: User;
  users: User[];
  onSlideChange?: (index: number) => void;
}

const SLIDES: Slide[] = [
  {
    id: 's1',
    title: 'Flowa',
    content: '같은 맥락, 같은 흐름 — 끊기지 않는 팀\n\n실시간 협업 워크스테이션 · 2026 Q2 로드맵',
    bg: 'linear-gradient(135deg, #1A2744 0%, #1D4ED8 100%)',
    titleColor: '#FFFFFF',
  },
  {
    id: 's2',
    title: '문제: 왜 지금 협업 툴이 실패하는가',
    content: '• 맥락 단절: Slack 스레드와 Google Docs 사이의 7번 전환\n• 존재의 불투명함: 팀원이 지금 무엇을 보는지 알 수 없음\n• 몰입 파괴: 알림 하나로 25분의 집중 시간 소멸\n\n→ 밤 11시 마감 전, 팀원이 어디서 막혔는지 아무도 모른다',
    bg: '#FFFFFF',
    titleColor: '#1A2744',
  },
  {
    id: 's3',
    title: 'Flowa 핵심 기능 4가지',
    content: '① 인라인 컨텍스트 채팅\n   텍스트를 선택하고 Cmd+/ — 대화가 문서에 핀된다\n\n② 시선 브로드캐스트\n   팀원의 커서와 뷰포트를 실시간으로 공유\n\n③ 무음 존재감 시스템\n   알림 없이 5단계 레이어로 팀의 현재 상태 표시\n\n④ 작업 파티 모드\n   같은 화면을 같이 보며 복잡한 결정을 함께',
    bg: '#EFF6FF',
    titleColor: '#1A2744',
  },
  {
    id: 's4',
    title: 'MVP 타임라인 — 8주 스프린트',
    content: 'Week 1-2: Tiptap 에디터 + 3패널 레이아웃\nWeek 3-4: BroadcastChannel 실시간 동기화\nWeek 5-6: 인라인 채팅 + 존재감 시스템\nWeek 7-8: 파티 모드 + 베타 출시\n\n🎯 목표: 5팀 파일럿, NPS 50+',
    bg: '#FFFFFF',
    titleColor: '#1A2744',
  },
  {
    id: 's5',
    title: '비즈니스 모델',
    content: 'Free   — 3인 팀 / $0 / 기본 협업\nTeam  — $12/user/month / 무제한 기록 + 시선 공유\nPro    — $20/user/month / 파티 모드 + 분석\n\nSlack+Notion 조합($23.25) 대비 48% 절약\n\n목표: 6개월 내 ARR $120K',
    bg: 'linear-gradient(135deg, #1A2744 0%, #1D4ED8 100%)',
    titleColor: '#FFFFFF',
  },
];

export default function PPTViewer({ currentUser: _currentUser, users, onSlideChange }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [presenting, setPresenting] = useState(false);

  const goTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(SLIDES.length - 1, idx));
    setCurrentSlide(clamped);
    onSlideChange?.(clamped);
  };

  const slide = SLIDES[currentSlide];

  // Find remote viewers
  const remoteViewers = users.filter(u => u.currentDoc === '제품 로드맵');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1E293B' }}>
      {/* Controls */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '6px 14px', gap: 8,
        background: '#0F172A', flexShrink: 0,
        borderBottom: '1px solid #334155',
      }}>
        <span style={{ color: '#94A3B8', fontSize: 12 }}>
          {currentSlide + 1} / {SLIDES.length}
        </span>
        <div style={{ flex: 1 }}>
          {/* Slide strip */}
          <div style={{ display: 'flex', gap: 4 }}>
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                style={{
                  width: 40, height: 24, borderRadius: 3,
                  border: i === currentSlide ? '2px solid #3B82F6' : '1px solid #334155',
                  background: i === currentSlide ? '#1D4ED8' : '#1E293B',
                  color: '#94A3B8', fontSize: 9, cursor: 'pointer',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setPresenting(p => !p)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 4, border: 'none',
            background: presenting ? '#EF4444' : '#3B82F6',
            color: '#fff', fontSize: 12, cursor: 'pointer',
          }}
        >
          {presenting ? <Square size={12} /> : <Play size={12} />}
          {presenting ? '중지' : '발표'}
        </button>
        {remoteViewers.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {remoteViewers.map(u => (
              <div key={u.id} style={{
                width: 20, height: 20, borderRadius: '50%',
                background: u.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 9, fontWeight: 700,
              }} title={u.name}>
                {u.avatar}
              </div>
            ))}
            <span style={{ fontSize: 10, color: '#64748B' }}>시청 중</span>
          </div>
        )}
      </div>

      {/* Slide canvas */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, position: 'relative',
      }}>
        <div style={{
          width: '100%', maxWidth: 740,
          aspectRatio: '16/9',
          background: slide.bg,
          borderRadius: 10,
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column',
          padding: '48px 56px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 4,
            background: 'linear-gradient(90deg, #3B82F6, #60A5FA, #3B82F6)',
          }} />

          {/* Slide number badge */}
          <div style={{
            position: 'absolute', bottom: 20, right: 24,
            fontSize: 12, color: slide.titleColor === '#FFFFFF' ? 'rgba(255,255,255,0.4)' : '#CBD5E1',
          }}>
            {currentSlide + 1}
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: 28, fontWeight: 700,
            color: slide.titleColor,
            marginBottom: 24, lineHeight: 1.2,
            fontFamily: 'Inter, sans-serif',
          }}>
            {slide.title}
          </h2>

          {/* Content */}
          <div style={{
            fontSize: 15, lineHeight: 1.8,
            color: slide.titleColor === '#FFFFFF' ? 'rgba(255,255,255,0.85)' : '#334155',
            whiteSpace: 'pre-line',
            fontFamily: 'Inter, sans-serif',
          }}>
            {slide.content}
          </div>

          {/* Remote user gaze indicators */}
          {remoteViewers.map((u, i) => (
            <div key={u.id} style={{
              position: 'absolute', bottom: 16 + i * 24, left: 16,
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: '2px 8px 2px 4px',
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                background: u.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 8, fontWeight: 700,
              }}>{u.avatar}</div>
              <span style={{ fontSize: 10, color: '#fff' }}>{u.name} 시청 중</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        padding: '10px', flexShrink: 0, background: '#0F172A',
        borderTop: '1px solid #1E293B',
      }}>
        <button
          onClick={() => goTo(currentSlide - 1)}
          disabled={currentSlide === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 14px', borderRadius: 6, border: '1px solid #334155',
            background: 'transparent', color: currentSlide === 0 ? '#334155' : '#94A3B8',
            cursor: currentSlide === 0 ? 'default' : 'pointer', fontSize: 13,
          }}
        >
          <ChevronLeft size={14} /> 이전
        </button>

        <div style={{ display: 'flex', gap: 6 }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{
              width: i === currentSlide ? 20 : 6,
              height: 6, borderRadius: 3,
              background: i === currentSlide ? '#3B82F6' : '#334155',
              cursor: 'pointer', transition: 'all 0.2s',
            }} onClick={() => goTo(i)} />
          ))}
        </div>

        <button
          onClick={() => goTo(currentSlide + 1)}
          disabled={currentSlide === SLIDES.length - 1}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 14px', borderRadius: 6, border: '1px solid #334155',
            background: 'transparent', color: currentSlide === SLIDES.length - 1 ? '#334155' : '#94A3B8',
            cursor: currentSlide === SLIDES.length - 1 ? 'default' : 'pointer', fontSize: 13,
          }}
        >
          다음 <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
