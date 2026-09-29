'use client';

import React, { useState, useMemo } from 'react';
import { ParsedSong, SongSection, SongLine, SectionType, InstrumentType, ColumnCount } from '@/types/chord';
import { ChordPair } from './ChordPair';
import { ChevronDown, ChevronRight, AlertCircle, Split } from 'lucide-react';

interface ChordSheetViewerProps {
  song: ParsedSong;
  showChords?: boolean;
  fontSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  columns?: ColumnCount;
  instrument?: InstrumentType;
  onChordClick?: (chord: string) => void;
}

const SECTION_COLOR_MAP: Record<SectionType, { badge: string; border: string }> = {
  INTRO: {
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    border: 'border-l-emerald-500',
  },
  VERSE: {
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    border: 'border-l-blue-500',
  },
  PRE_CHORUS: {
    badge: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    border: 'border-l-violet-500',
  },
  CHORUS: {
    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold',
    border: 'border-l-amber-500',
  },
  BRIDGE: {
    badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    border: 'border-l-cyan-500',
  },
  SOLO: {
    badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30 font-bold',
    border: 'border-l-rose-500',
  },
  OUTRO: {
    badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    border: 'border-l-indigo-500',
  },
  CUSTOM: {
    badge: 'bg-neutral-500/20 text-neutral-300 border-neutral-500/30',
    border: 'border-l-neutral-500',
  },
};

interface HeaderFlowItem {
  type: 'header';
  sectionId: string;
  sectionType: SectionType;
  title: string;
  isColumnBreak?: boolean;
}

interface LineFlowItem {
  type: 'line';
  sectionId: string;
  sectionType: SectionType;
  lineIndex: number;
  line: SongLine;
}

type FlowItem = HeaderFlowItem | LineFlowItem;

/**
 * Thuật toán "CHIA ĐỀU" (Even Height Distribution)
 * Phân bổ toàn bộ nội dung (dòng lời + hợp âm + tiêu đề) đều sang N cột
 * để chiều cao các cột luôn bằng nhau, không bị dồn cục hay để trống cột.
 */
function createEvenFlowColumns(
  sections: SongSection[],
  targetCols: number,
  collapsed: Record<string, boolean>
): FlowItem[][] {
  // 1. Tạo danh sách tuần tự tất cả các phần tử trong bài hát
  const allItems: FlowItem[] = [];
  for (const sec of sections) {
    allItems.push({
      type: 'header',
      sectionId: sec.id,
      sectionType: sec.type,
      title: sec.title,
      isColumnBreak: !!sec.isColumnBreak,
    });
    if (!collapsed[sec.id]) {
      for (let i = 0; i < sec.lines.length; i++) {
        allItems.push({
          type: 'line',
          sectionId: sec.id,
          sectionType: sec.type,
          lineIndex: i,
          line: sec.lines[i],
        });
      }
    }
  }

  if (targetCols <= 1 || allItems.length === 0) {
    return [allItems];
  }

  // 2. Nếu có lệnh ngắt cột thủ công {column_break}
  const hasManualBreak = allItems.some(
    (it, idx) => idx > 0 && it.type === 'header' && it.isColumnBreak
  );
  if (hasManualBreak) {
    const cols: FlowItem[][] = [[]];
    for (const it of allItems) {
      if (
        it.type === 'header' &&
        it.isColumnBreak &&
        cols.length < targetCols &&
        cols[cols.length - 1].length > 0
      ) {
        cols.push([it]);
      } else {
        cols[cols.length - 1].push(it);
      }
    }
    return cols;
  }

  // 3. Phân chia đều theo trọng số trực quan:
  // Dòng hợp âm + lời = 1, Tiêu đề section = 1.2
  const getItemWeight = (it: FlowItem) => (it.type === 'header' ? 1.2 : 1);
  const totalWeight = allItems.reduce((acc, it) => acc + getItemWeight(it), 0);
  const targetWeightPerCol = totalWeight / targetCols;

  const cols: FlowItem[][] = [];
  let currentCol: FlowItem[] = [];
  let currentWeight = 0;

  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const w = getItemWeight(item);
    const remainingItems = allItems.length - i;
    const remainingCols = targetCols - cols.length;

    // Không để tiêu đề bị bỏ rơi trơ trọi ở đáy cột
    const isHeader = item.type === 'header';

    const shouldBreak =
      cols.length < targetCols - 1 &&
      currentCol.length > 0 &&
      (currentWeight + w * 0.45 >= targetWeightPerCol || remainingItems === remainingCols);

    if (shouldBreak) {
      // Nếu mục cuối cùng của cột hiện tại là tiêu đề (chưa có dòng lời theo sau),
      // dời tiêu đề đó sang đầu cột mới
      if (currentCol.length > 0 && currentCol[currentCol.length - 1].type === 'header') {
        const trailingHeader = currentCol.pop()!;
        cols.push(currentCol);
        currentCol = [trailingHeader, item];
        currentWeight = getItemWeight(trailingHeader) + w;
      } else if (isHeader) {
        // Nếu mục chuẩn bị thêm vào là tiêu đề và cột đã đủ độ dài, đưa luôn sang cột mới
        cols.push(currentCol);
        currentCol = [item];
        currentWeight = w;
      } else {
        cols.push(currentCol);
        currentCol = [item];
        currentWeight = w;
      }
    } else {
      currentCol.push(item);
      currentWeight += w;
    }
  }

  if (currentCol.length > 0) {
    cols.push(currentCol);
  }

  return cols;
}

export const ChordSheetViewer: React.FC<ChordSheetViewerProps> = ({
  song,
  showChords = true,
  fontSize = 'lg',
  columns = 1,
  instrument = 'guitar',
  onChordClick,
}) => {
  // Trạng thái thu gọn/mở rộng từng section
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Xác định số cột mục tiêu theo lựa chọn người dùng
  const targetColCount = useMemo(() => {
    if (columns === 1) return 1;
    if (columns === 2) return 2;
    if (columns === 3) return 3;
    // auto: tự động tính theo số dòng
    const totalLines = song.sections.reduce((acc, s) => acc + s.lines.length, 0);
    if (totalLines > 20) return 3;
    if (totalLines > 10) return 2;
    return 1;
  }, [columns, song.sections]);

  // Phân bổ toàn bộ nội dung đều sang N cột
  const columnBuckets = useMemo(() => {
    return createEvenFlowColumns(song.sections, targetColCount, collapsedSections);
  }, [song.sections, targetColCount, collapsedSections]);

  // Class Grid CSS đảm bảo chia đúng số cột thực tế
  const gridContainerClass = useMemo(() => {
    const actualCols = columnBuckets.length;
    if (actualCols === 1) return 'grid grid-cols-1 gap-4 md:gap-6';
    if (actualCols === 2) return 'grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 items-start';
    if (actualCols === 3) return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 items-start';
    return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 items-start';
  }, [columnBuckets.length]);

  const renderFlowItem = (item: FlowItem, itemIdx: number) => {
    if (item.type === 'header') {
      const isCollapsed = !!collapsedSections[item.sectionId];
      const style = SECTION_COLOR_MAP[item.sectionType] || SECTION_COLOR_MAP.CUSTOM;

      return (
        <div
          key={`header-${item.sectionId}-${itemIdx}`}
          onClick={() => toggleSection(item.sectionId)}
          className="flex items-center gap-2 cursor-pointer select-none mt-3.5 first:mt-0 mb-1.5 group py-0.5"
        >
          <button
            type="button"
            className="text-neutral-500 group-hover:text-white transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>

          <span
            className={`text-xs px-2.5 py-0.5 rounded-full border tracking-wide uppercase font-semibold transition-all ${style.badge}`}
          >
            {item.title}
          </span>

          {item.sectionType === 'CHORUS' && (
            <span className="text-[11px] text-amber-500/80 font-medium tracking-tight">
              ★ Điệp khúc
            </span>
          )}

          {item.isColumnBreak && targetColCount > 1 && (
            <span className="ml-auto flex items-center gap-1 text-amber-400 text-[10px] uppercase font-mono font-bold tracking-wider">
              <Split size={12} />
              <span>Ngắt cột</span>
            </span>
          )}
        </div>
      );
    }

    // Line item
    const { line, lineIndex, sectionId } = item;

    // Dòng Cue / nhắc bài biểu diễn cho nhạc công
    if (line.cueNote) {
      return (
        <div
          key={`cue-${sectionId}-${lineIndex}-${itemIdx}`}
          className="my-1.5 flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs md:text-sm font-medium tracking-wide animate-pulse"
        >
          <AlertCircle size={16} className="text-amber-400 shrink-0" />
          <span>Cue: {line.cueNote}</span>
        </div>
      );
    }

    // Dòng hợp âm + lời thông thường
    return (
      <div
        key={`line-${sectionId}-${lineIndex}-${itemIdx}`}
        className="flex flex-wrap items-end leading-none py-0.5"
      >
        {line.pairs.map((pair, pairIdx) => (
          <ChordPair
            key={`pair-${sectionId}-${lineIndex}-${pairIdx}`}
            chord={pair.chord}
            lyric={pair.lyric}
            showChords={showChords}
            fontSize={fontSize}
            instrument={instrument}
            onChordClick={onChordClick}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`w-full transition-all duration-300 ${gridContainerClass}`}>
      {columnBuckets.map((colItems, colIdx) => (
        <div
          key={`col-${colIdx}`}
          className="flex flex-col gap-y-1.5 p-4 sm:p-5 rounded-2xl bg-neutral-900/40 hover:bg-neutral-900/50 border border-neutral-800/60 transition-all min-w-0"
        >
          {colItems.map((item, itemIdx) => renderFlowItem(item, itemIdx))}
        </div>
      ))}
    </div>
  );
};
