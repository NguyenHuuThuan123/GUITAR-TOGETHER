'use client';

import React, { useState } from 'react';
import { useBandStore } from '@/lib/store';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { InstrumentType } from '@/types/chord';
import {
  Play,
  Pause,
  Sun,
  Eye,
  EyeOff,
  Columns,
  Square,
  Maximize2,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface StageControlsBarProps {
  currentKey: string;
  originalKey: string;
  semitones: number;
  onTransposeChange: (semitones: number) => void;
  capoFret?: number;
  onCapoChange?: (fret: number) => void;
  onPrintPdf?: () => void;
  prevSongHref?: string;
  nextSongHref?: string;
  songIndexTitle?: string;
}

export const StageControlsBar: React.FC<StageControlsBarProps> = ({
  currentKey,
  originalKey,
  semitones,
  onTransposeChange,
  capoFret = 0,
  onCapoChange,
  onPrintPdf,
  prevSongHref,
  nextSongHref,
  songIndexTitle,
}) => {
  const { stageSettings, updateStageSettings } = useBandStore();
  const { isLocked, isSupported: isWakeLockSupported, toggleLock } = useWakeLock();
  const { isScrolling, speed, setSpeed, toggleScroll } = useAutoScroll({
    initialSpeed: stageSettings.autoScrollSpeed,
  });

  const [showCapoMenu, setShowCapoMenu] = useState(false);

  const handleSpeedChange = (delta: number) => {
    const newSpeed = Math.min(10, Math.max(1, speed + delta));
    setSpeed(newSpeed);
    updateStageSettings({ autoScrollSpeed: newSpeed });
  };

  const handleFontSizeCycle = () => {
    const sizes: ('sm' | 'md' | 'lg' | 'xl' | '2xl')[] = ['sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = sizes.indexOf(stageSettings.fontSize);
    const nextSize = sizes[(currentIndex + 1) % sizes.length];
    updateStageSettings({ fontSize: nextSize });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 px-3 py-2 text-white flex flex-wrap items-center justify-between gap-2 shadow-2xl">
      {/* Cụm điều hướng & Tông bài hát */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 transition-colors mr-0.5 shrink-0"
          title="Về trang chủ BAND GUITAR TOGETHER"
        >
          <img src="/logo.png" alt="BAND GUITAR TOGETHER" className="w-6 h-6 rounded-lg object-cover" />
        </Link>

        {/* Nút lùi về nếu có */}
        {prevSongHref && (
          <Link
            href={prevSongHref}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-700 text-neutral-300 hover:text-white"
            title="Bài trước đó trong Setlist"
          >
            <ChevronLeft size={18} />
          </Link>
        )}

        {songIndexTitle && (
          <span className="text-xs font-semibold px-2 py-1 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
            {songIndexTitle}
          </span>
        )}

        {/* Bộ dịch tông (Transpose) 1 chạm */}
        <div className="flex items-center bg-neutral-900 border border-neutral-750 rounded-xl px-2 py-1 gap-1.5">
          <span className="text-[11px] text-neutral-400 font-medium">Tông:</span>
          <span className="text-base font-bold text-amber-400 font-mono min-w-[2rem] text-center">
            {currentKey}
          </span>
          {semitones !== 0 && (
            <span className="text-[10px] text-emerald-400 font-mono">
              ({semitones > 0 ? `+${semitones}` : semitones})
            </span>
          )}

          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={() => onTransposeChange(semitones - 1)}
              className="w-7 h-7 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 active:bg-amber-600 rounded-lg text-sm font-bold text-neutral-200 transition-colors"
              title="Hạ nửa cung (-1)"
            >
              -
            </button>
            <button
              onClick={() => onTransposeChange(semitones + 1)}
              className="w-7 h-7 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 active:bg-amber-600 rounded-lg text-sm font-bold text-neutral-200 transition-colors"
              title="Tăng nửa cung (+1)"
            >
              +
            </button>
            {semitones !== 0 && (
              <button
                onClick={() => onTransposeChange(0)}
                className="text-[10px] px-1.5 py-0.5 text-neutral-400 hover:text-amber-300 hover:underline"
                title="Về tông gốc"
              >
                Gốc
              </button>
            )}
          </div>
        </div>

        {/* Nút kẹp Capo */}
        {onCapoChange && (
          <div className="relative">
            <button
              onClick={() => setShowCapoMenu(!showCapoMenu)}
              className={`px-2 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
                capoFret > 0
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
              }`}
            >
              Capo: {capoFret > 0 ? `Ngăn ${capoFret}` : 'Không'}
            </button>

            {showCapoMenu && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl z-50 flex flex-wrap gap-1 w-44">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((fret) => (
                  <button
                    key={fret}
                    onClick={() => {
                      onCapoChange(fret);
                      setShowCapoMenu(false);
                    }}
                    className={`px-2 py-1 rounded text-xs ${
                      capoFret === fret
                        ? 'bg-amber-500 text-black font-bold'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                    }`}
                  >
                    {fret === 0 ? 'Tắt' : `Ngăn ${fret}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Nút sang bài tiếp theo nếu có */}
        {nextSongHref && (
          <Link
            href={nextSongHref}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-700 text-neutral-300 hover:text-white"
            title="Bài tiếp theo trong Setlist"
          >
            <ChevronRight size={18} />
          </Link>
        )}
      </div>

      {/* Cụm điều khiển sân khấu trung tâm & bên phải */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Bộ Auto-Scroll */}
        <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1 gap-1.5">
          <button
            onClick={toggleScroll}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              isScrolling
                ? 'bg-amber-500 text-black animate-pulse shadow-lg shadow-amber-500/30'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
            }`}
          >
            {isScrolling ? <Pause size={14} /> : <Play size={14} />}
            <span>{isScrolling ? 'Dừng cuộn' : 'Tự cuộn'}</span>
          </button>

          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <button
              onClick={() => handleSpeedChange(-1)}
              className="w-5 h-5 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300"
              title="Giảm tốc độ cuộn"
            >
              -
            </button>
            <span className="font-mono text-[11px] text-amber-400 font-bold px-1">
              v{speed}
            </span>
            <button
              onClick={() => handleSpeedChange(1)}
              className="w-5 h-5 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300"
              title="Tăng tốc độ cuộn"
            >
              +
            </button>
          </div>
        </div>

        {/* Chọn nhạc cụ sơ đồ thế bấm */}
        <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs">
          {(['guitar', 'ukulele', 'piano'] as InstrumentType[]).map((inst) => (
            <button
              key={inst}
              onClick={() => updateStageSettings({ instrument: inst })}
              className={`px-2 py-1 rounded capitalize transition-colors ${
                stageSettings.instrument === inst
                  ? 'bg-amber-500/20 text-amber-300 font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {inst}
            </button>
          ))}
        </div>

        {/* Chuyển kích cỡ chữ */}
        <button
          onClick={handleFontSizeCycle}
          className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1"
          title="Đổi kích cỡ chữ"
        >
          <span>Cỡ chữ:</span>
          <span className="text-amber-400 font-mono uppercase">{stageSettings.fontSize}</span>
        </button>

        {/* Ẩn / Hiện hợp âm */}
        <button
          onClick={() => updateStageSettings({ showChords: !stageSettings.showChords })}
          className={`p-1.5 rounded-lg border text-xs transition-colors ${
            stageSettings.showChords
              ? 'bg-neutral-900 text-amber-400 border-neutral-800'
              : 'bg-neutral-900 text-neutral-500 border-neutral-800 line-through'
          }`}
          title={stageSettings.showChords ? 'Đang hiện hợp âm (Bấm để ẩn)' : 'Đang ẩn hợp âm (Bấm để hiện)'}
        >
          {stageSettings.showChords ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>

        {/* Bộ chọn chia cột: 1 Cột, 2 Cột, 3 Cột, Tự động (Auto) */}
        <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs">
          <span className="text-[10px] text-neutral-500 px-1 font-medium hidden xl:inline">Cột:</span>
          {([1, 2, 3, 'auto'] as const).map((col) => (
            <button
              key={String(col)}
              onClick={() => updateStageSettings({ columns: col })}
              className={`px-2 py-1 rounded text-xs transition-all font-semibold cursor-pointer ${
                stageSettings.columns === col
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title={col === 'auto' ? 'Tự động co giãn theo độ rộng màn hình' : `Hiển thị dạng ${col} cột`}
            >
              {col === 'auto' ? 'Auto' : `${col}C`}
            </button>
          ))}
        </div>

        {/* Wake Lock: Màn hình luôn sáng */}
        {isWakeLockSupported && (
          <button
            onClick={toggleLock}
            className={`px-2 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
              isLocked
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
            }`}
            title={isLocked ? 'Màn hình luôn sáng (Đang BẬT)' : 'Bật giữ màn hình luôn sáng'}
          >
            <Sun size={14} className={isLocked ? 'text-emerald-400 animate-spin-slow' : ''} />
            <span className="hidden sm:inline">{isLocked ? 'Sáng liên tục' : 'Wake Lock'}</span>
          </button>
        )}

        {/* Toàn màn hình */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white"
          title="Toàn màn hình sân khấu"
        >
          <Maximize2 size={16} />
        </button>

        {/* Xuất bản in PDF */}
        {onPrintPdf && (
          <button
            onClick={onPrintPdf}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white"
            title="In ấn hoặc lưu PDF"
          >
            <Printer size={16} />
          </button>
        )}
      </div>
    </header>
  );
};
