'use client';

import React, { useState } from 'react';
import { ChordDiagram } from './ChordDiagram';
import { InstrumentType } from '@/types/chord';

interface ChordPairProps {
  chord: string | null;
  lyric: string;
  showChords?: boolean;
  fontSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  instrument?: InstrumentType;
  onChordClick?: (chord: string) => void;
}

export const ChordPair: React.FC<ChordPairProps> = ({
  chord,
  lyric,
  showChords = true,
  fontSize = 'lg',
  instrument = 'guitar',
  onChordClick,
}) => {
  const [showPopup, setShowPopup] = useState(false);

  // Dynamic font sizing classes
  const lyricSizeMap = {
    sm: 'text-base leading-snug',
    md: 'text-lg leading-normal',
    lg: 'text-xl md:text-2xl leading-relaxed',
    xl: 'text-2xl md:text-3xl leading-relaxed',
    '2xl': 'text-3xl md:text-4xl leading-loose',
  };

  const chordSizeMap = {
    sm: 'text-xs',
    md: 'text-sm font-semibold',
    lg: 'text-base font-bold',
    xl: 'text-lg font-bold',
    '2xl': 'text-xl font-bold',
  };

  const handleChordClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPopup(!showPopup);
    if (chord && onChordClick) {
      onChordClick(chord);
    }
  };

  return (
    <span className="relative inline-flex flex-col items-start align-bottom mx-[1px] group">
      {/* Hợp âm hiển thị phía trên */}
      {showChords && (
        <span
          onClick={chord ? handleChordClick : undefined}
          className={`cursor-pointer transition-colors select-none min-h-[1.35rem] leading-none mb-0.5 tracking-wide ${
            chord
              ? 'text-amber-400 hover:text-amber-300 font-mono font-bold'
              : 'opacity-0'
          } ${chordSizeMap[fontSize]}`}
          title={chord ? `Bấm xem thế bấm hợp âm ${chord}` : undefined}
        >
          {chord || '\u00A0'}
        </span>
      )}

      {/* Lời bài hát tương ứng ở phía dưới */}
      <span
        className={`text-neutral-100 font-sans tracking-wide transition-all ${
          lyric === ' ' ? 'whitespace-pre' : ''
        } ${lyricSizeMap[fontSize]}`}
      >
        {lyric === ' ' ? '\u00A0' : lyric || '\u00A0'}
      </span>

      {/* Popover hiển thị sơ đồ thế bấm khi nhấp vào hợp âm */}
      {showPopup && chord && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setShowPopup(false);
            }}
          />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 p-3 bg-neutral-900/95 backdrop-blur-md border border-neutral-700 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <ChordDiagram chord={chord} instrument={instrument} />
            <button
              onClick={() => setShowPopup(false)}
              className="mt-2 w-full py-1 text-xs text-center text-neutral-400 hover:text-white bg-neutral-800 rounded transition-colors"
            >
              Đóng
            </button>
          </div>
        </>
      )}
    </span>
  );
};
