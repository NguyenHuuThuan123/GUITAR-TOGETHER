'use client';

import React from 'react';
import { getChordDefinition } from '@/lib/chord-engine/chord-db';
import { InstrumentType } from '@/types/chord';

interface ChordDiagramProps {
  chord: string;
  instrument?: InstrumentType;
  width?: number;
  height?: number;
  showTitle?: boolean;
}

export const ChordDiagram: React.FC<ChordDiagramProps> = ({
  chord,
  instrument = 'guitar',
  width = 130,
  height = 150,
  showTitle = true,
}) => {
  const def = getChordDefinition(chord);

  if (!def) {
    return (
      <div className="flex flex-col items-center justify-center p-3 text-xs text-neutral-400 bg-neutral-900/60 rounded-lg border border-neutral-800">
        <span className="font-bold text-amber-400 text-sm">{chord}</span>
        <span className="text-[10px] mt-1 text-neutral-400">Chưa có sơ đồ</span>
      </div>
    );
  }

  if (instrument === 'piano') {
    return (
      <div className="flex flex-col items-center p-2 bg-neutral-900/80 rounded-lg border border-neutral-800">
        {showTitle && <span className="text-amber-400 font-bold text-sm mb-1">{chord}</span>}
        <div className="text-xs text-neutral-300 font-mono">
          Nốt: {def.pianoNotes?.join(' - ') || 'N/A'}
        </div>
      </div>
    );
  }

  const isGuitar = instrument === 'guitar';
  const fingering = isGuitar ? def.guitar : def.ukulele;
  const numStrings = isGuitar ? 6 : 4;
  const numFrets = 5;

  const startX = 22;
  const startY = 32;
  const stringSpacing = (width - startX * 2) / (numStrings - 1);
  const fretSpacing = (height - startY - 20) / numFrets;

  const baseFret = fingering.baseFret || 1;

  return (
    <div className="flex flex-col items-center select-none">
      {showTitle && (
        <span className="font-bold text-amber-400 text-sm md:text-base tracking-wider mb-0.5">
          {chord}
        </span>
      )}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Nut (ngăn 0) hoặc đường kẻ dày nếu baseFret === 1 */}
        {baseFret === 1 ? (
          <line
            x1={startX}
            y1={startY}
            x2={startX + (numStrings - 1) * stringSpacing}
            y2={startY}
            stroke="#e5e5e5"
            strokeWidth="4"
            strokeLinecap="round"
          />
        ) : (
          <>
            <line
              x1={startX}
              y1={startY}
              x2={startX + (numStrings - 1) * stringSpacing}
              y2={startY}
              stroke="#737373"
              strokeWidth="1.5"
            />
            {/* Hiển thị số ngăn bắt đầu ở cạnh bên */}
            <text
              x={startX - 14}
              y={startY + fretSpacing * 0.7}
              fill="#fbbf24"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
            >
              {baseFret}fr
            </text>
          </>
        )}

        {/* Các ngăn phím nằm ngang */}
        {Array.from({ length: numFrets }).map((_, i) => {
          const y = startY + (i + 1) * fretSpacing;
          return (
            <line
              key={`fret-${i}`}
              x1={startX}
              y1={y}
              x2={startX + (numStrings - 1) * stringSpacing}
              y2={y}
              stroke="#525252"
              strokeWidth="1"
            />
          );
        })}

        {/* Các dây đàn dọc */}
        {Array.from({ length: numStrings }).map((_, i) => {
          const x = startX + i * stringSpacing;
          return (
            <line
              key={`string-${i}`}
              x1={x}
              y1={startY}
              x2={x}
              y2={startY + numFrets * fretSpacing}
              stroke="#737373"
              strokeWidth={isGuitar && i < 3 ? '1.5' : '1'}
            />
          );
        })}

        {/* Barre chord nếu có */}
        {fingering.barres?.map((fret) => {
          const fretIndex = baseFret === 1 ? fret : fret - baseFret + 1;
          if (fretIndex >= 1 && fretIndex <= numFrets) {
            const y = startY + (fretIndex - 0.5) * fretSpacing;
            return (
              <rect
                key={`barre-${fret}`}
                x={startX}
                y={y - 5}
                width={(numStrings - 1) * stringSpacing}
                height="10"
                rx="5"
                fill="#f59e0b"
                opacity="0.8"
              />
            );
          }
          return null;
        })}

        {/* Vị trí các ngón tay và ký hiệu x / o */}
        {fingering.frets.map((fret, stringIdx) => {
          const x = startX + stringIdx * stringSpacing;

          if (fret === -1) {
            // Mute (X)
            return (
              <text
                key={`mute-${stringIdx}`}
                x={x}
                y={startY - 8}
                fill="#ef4444"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
              >
                ✕
              </text>
            );
          }

          if (fret === 0) {
            // Open string (O)
            return (
              <circle
                key={`open-${stringIdx}`}
                cx={x}
                cy={startY - 10}
                r="4"
                fill="none"
                stroke="#10b981"
                strokeWidth="1.5"
              />
            );
          }

          // Ngăn bấm thực tế hiển thị trên đồ thị
          const fretIndex = baseFret === 1 ? fret : fret - baseFret + 1;
          if (fretIndex >= 1 && fretIndex <= numFrets) {
            const y = startY + (fretIndex - 0.5) * fretSpacing;
            const finger = fingering.fingers ? fingering.fingers[stringIdx] : null;

            return (
              <g key={`dot-${stringIdx}`}>
                <circle cx={x} cy={y} r="6.5" fill="#f59e0b" />
                {finger && finger > 0 && (
                  <text
                    x={x}
                    y={y + 3.5}
                    fill="#18181b"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {finger}
                  </text>
                )}
              </g>
            );
          }

          return null;
        })}
      </svg>
    </div>
  );
};
