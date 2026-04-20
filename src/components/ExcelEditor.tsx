import { useState, useRef, useCallback } from 'react';
import type { User, ExcelCell } from '../types';

interface Props {
  currentUser: User;
  users: User[];
  onCellChange?: (row: number, col: number, value: string) => void;
}

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const ROWS = 20;

const INITIAL_DATA: Record<string, ExcelCell> = {
  'A1': { value: '항목', bold: true, bg: '#EFF6FF', align: 'center' },
  'B1': { value: '1월', bold: true, bg: '#EFF6FF', align: 'center' },
  'C1': { value: '2월', bold: true, bg: '#EFF6FF', align: 'center' },
  'D1': { value: '3월', bold: true, bg: '#EFF6FF', align: 'center' },
  'E1': { value: 'Q1 합계', bold: true, bg: '#DBEAFE', align: 'center' },
  'F1': { value: '목표', bold: true, bg: '#FEF9C3', align: 'center' },
  'G1': { value: '달성률', bold: true, bg: '#FEF9C3', align: 'center' },

  'A2': { value: '마케팅비', bold: false },
  'B2': { value: '2,400,000', align: 'right' },
  'C2': { value: '2,100,000', align: 'right' },
  'D2': { value: '3,200,000', align: 'right' },
  'E2': { value: '7,700,000', bold: true, align: 'right', bg: '#EFF6FF' },
  'F2': { value: '8,000,000', align: 'right' },
  'G2': { value: '96.3%', align: 'center', bg: '#ECFDF5' },

  'A3': { value: '인건비', bold: false },
  'B3': { value: '12,000,000', align: 'right' },
  'C3': { value: '12,000,000', align: 'right' },
  'D3': { value: '12,500,000', align: 'right' },
  'E3': { value: '36,500,000', bold: true, align: 'right', bg: '#EFF6FF' },
  'F3': { value: '36,000,000', align: 'right' },
  'G3': { value: '101.4%', align: 'center', bg: '#FEF2F2' },

  'A4': { value: '운영비', bold: false },
  'B4': { value: '1,800,000', align: 'right' },
  'C4': { value: '1,650,000', align: 'right' },
  'D4': { value: '2,100,000', align: 'right' },
  'E4': { value: '5,550,000', bold: true, align: 'right', bg: '#EFF6FF' },
  'F4': { value: '5,500,000', align: 'right' },
  'G4': { value: '100.9%', align: 'center', bg: '#FEF2F2' },

  'A5': { value: '기술비', bold: false },
  'B5': { value: '4,200,000', align: 'right' },
  'C5': { value: '3,800,000', align: 'right' },
  'D5': { value: '5,100,000', align: 'right' },
  'E5': { value: '13,100,000', bold: true, align: 'right', bg: '#EFF6FF' },
  'F5': { value: '14,000,000', align: 'right' },
  'G5': { value: '93.6%', align: 'center', bg: '#ECFDF5' },

  'A7': { value: '합계', bold: true, bg: '#F1F5F9' },
  'B7': { value: '20,400,000', bold: true, align: 'right', bg: '#F1F5F9' },
  'C7': { value: '19,550,000', bold: true, align: 'right', bg: '#F1F5F9' },
  'D7': { value: '22,900,000', bold: true, align: 'right', bg: '#F1F5F9' },
  'E7': { value: '62,850,000', bold: true, align: 'right', bg: '#DBEAFE' },
  'F7': { value: '63,500,000', bold: true, align: 'right', bg: '#F1F5F9' },
  'G7': { value: '99.0%', bold: true, align: 'center', bg: '#ECFDF5' },

  'A9': { value: '비고', bold: true, bg: '#EFF6FF' },
  'B9': { value: '마케팅비 절감으로 전체 예산 1% 절약 성공' },
};

export default function ExcelEditor({ currentUser: _currentUser, users, onCellChange }: Props) {
  const [data, setData] = useState<Record<string, ExcelCell>>(INITIAL_DATA);
  const [selected, setSelected] = useState<string | null>('A1');
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const cellKey = (col: string, row: number) => `${col}${row}`;

  const selectCell = useCallback((col: string, row: number) => {
    if (editing) commitEdit();
    setSelected(cellKey(col, row));
  }, [editing]);

  const startEdit = useCallback((col: string, row: number) => {
    const key = cellKey(col, row);
    setEditing(key);
    setEditValue(data[key]?.value ?? '');
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [data]);

  const commitEdit = useCallback(() => {
    if (!editing) return;
    setData(prev => ({
      ...prev,
      [editing]: { ...(prev[editing] ?? {}), value: editValue },
    }));
    onCellChange?.(
      parseInt(editing.slice(1)) - 1,
      COLS.indexOf(editing[0]),
      editValue,
    );
    setEditing(null);
  }, [editing, editValue, onCellChange]);

  // Find which user is looking at each cell
  const userOnCell: Record<string, User> = {};
  users.forEach(u => {
    if (u.currentDoc === 'Q2 예산 계획' && u.cursorX !== undefined) {
      const colIdx = Math.floor((u.cursorX ?? 0) / 100);
      const rowIdx = Math.floor((u.cursorY ?? 0) / 32);
      if (colIdx >= 0 && colIdx < COLS.length && rowIdx >= 0 && rowIdx < ROWS) {
        userOnCell[cellKey(COLS[colIdx], rowIdx + 1)] = u;
      }
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8FAFC' }}>
      {/* Formula bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '4px 10px', background: '#fff',
        borderBottom: '1px solid #E2E8F0', flexShrink: 0,
      }}>
        <div style={{
          width: 52, height: 24, borderRadius: 4, border: '1px solid #CBD5E1',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 600, color: '#1D4ED8', background: '#EFF6FF',
        }}>
          {selected ?? ''}
        </div>
        <div style={{ width: 1, height: 20, background: '#E2E8F0' }} />
        <div style={{ flex: 1, fontSize: 13, color: '#334155' }}>
          {editing ? editValue : (selected ? data[selected]?.value ?? '' : '')}
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
          fontSize: 12,
          userSelect: 'none',
        }}>
          <thead>
            <tr>
              <th style={{
                width: 40, height: 28,
                background: '#F1F5F9', border: '1px solid #E2E8F0',
                color: '#94A3B8', fontSize: 11, fontWeight: 500,
                position: 'sticky', top: 0, left: 0, zIndex: 10,
              }}></th>
              {COLS.map(col => (
                <th key={col} style={{
                  width: col === 'A' ? 110 : 100,
                  height: 28,
                  background: '#F1F5F9', border: '1px solid #E2E8F0',
                  color: '#64748B', fontSize: 11, fontWeight: 600,
                  textAlign: 'center',
                  position: 'sticky', top: 0, zIndex: 5,
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }, (_, ri) => {
              const row = ri + 1;
              return (
                <tr key={row}>
                  <td style={{
                    width: 40, height: 28,
                    background: '#F8FAFC', border: '1px solid #E2E8F0',
                    color: '#94A3B8', fontSize: 11, textAlign: 'center',
                    position: 'sticky', left: 0, zIndex: 3,
                  }}>
                    {row}
                  </td>
                  {COLS.map(col => {
                    const key = cellKey(col, row);
                    const cell = data[key];
                    const isSelected = selected === key;
                    const isEditing = editing === key;
                    const remoteUser = userOnCell[key];

                    return (
                      <td
                        key={col}
                        onClick={() => selectCell(col, row)}
                        onDoubleClick={() => startEdit(col, row)}
                        style={{
                          height: 28,
                          padding: '0 6px',
                          border: isSelected
                            ? '2px solid #3B82F6'
                            : `1px solid ${remoteUser ? remoteUser.color + '66' : '#E2E8F0'}`,
                          background: isSelected
                            ? '#EFF6FF'
                            : cell?.bg ?? (remoteUser ? remoteUser.color + '18' : '#fff'),
                          fontWeight: cell?.bold ? 700 : 400,
                          textAlign: cell?.align ?? 'left',
                          color: '#1E293B',
                          cursor: 'default',
                          position: 'relative',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}
                      >
                        {isEditing ? (
                          <input
                            ref={inputRef}
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={e => {
                              if (e.key === 'Enter') commitEdit();
                              if (e.key === 'Escape') { setEditing(null); }
                            }}
                            style={{
                              width: '100%', height: '100%',
                              border: 'none', outline: 'none', background: 'transparent',
                              fontSize: 12, fontWeight: cell?.bold ? 700 : 400,
                              textAlign: cell?.align ?? 'left', color: '#1E293B',
                            }}
                          />
                        ) : (
                          <>
                            {cell?.value ?? ''}
                            {remoteUser && (
                              <div style={{
                                position: 'absolute', top: 1, right: 2,
                                width: 10, height: 10, borderRadius: '50%',
                                background: remoteUser.color,
                              }} title={remoteUser.name} />
                            )}
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div style={{
        height: 24, background: '#fff', borderTop: '1px solid #E2E8F0',
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16,
        flexShrink: 0, fontSize: 11, color: '#94A3B8',
      }}>
        <span>셀 더블클릭으로 편집</span>
        {selected && data[selected] && (
          <span>선택: {selected} = {data[selected].value}</span>
        )}
        <span style={{ marginLeft: 'auto', color: '#10B981' }}>● 자동 저장됨</span>
      </div>
    </div>
  );
}
