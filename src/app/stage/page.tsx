'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBandStore } from '@/lib/store';
import { StageControlsBar } from '@/components/stage/StageControlsBar';
import { ChordSheetViewer } from '@/components/chord-engine/ChordSheetViewer';
import { transposeParsedSong, transposeNote } from '@/lib/chord-engine/transposer';
import { ChordDiagram } from '@/components/chord-engine/ChordDiagram';
import { extractUniqueChords, parseChordProText } from '@/lib/chord-engine/parser';
import {
  ListMusic,
  Tv2,
  X,
  ChevronLeft,
  ChevronRight,
  Music,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';

function StageModeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { songs, setlists, stageSettings } = useBandStore();

  const songIdParam = searchParams.get('songId');
  const setlistIdParam = searchParams.get('setlistId');
  const transposeParam = searchParams.get('transpose');

  // Tìm setlist nếu được chọn
  const currentSetlist = useMemo(() => {
    if (!setlistIdParam) return null;
    return setlists.find((sl) => sl.id === setlistIdParam) || null;
  }, [setlists, setlistIdParam]);

  // Vị trí bài hát hiện tại trong Setlist
  const [currentSetlistIndex, setCurrentSetlistIndex] = useState(0);

  // Xác định bài hát đang hiển thị
  const activeSong = useMemo(() => {
    if (currentSetlist && currentSetlist.songs.length > 0) {
      const item = currentSetlist.songs[currentSetlistIndex];
      return item ? item.song : currentSetlist.songs[0].song;
    }

    if (songIdParam) {
      return songs.find((s) => s.id === songIdParam) || songs[0];
    }

    return songs[0];
  }, [currentSetlist, currentSetlistIndex, songIdParam, songs]);

  // Override key từ Setlist nếu có
  const setlistItem = currentSetlist?.songs[currentSetlistIndex];

  // State Dịch tông (Semitones)
  const [semitones, setSemitones] = useState<number>(Number(transposeParam) || 0);
  const [capoFret, setCapoFret] = useState<number>(activeSong?.capo || 0);
  const [showDrawer, setShowDrawer] = useState(false);

  // Cập nhật lại khi chuyển bài
  useEffect(() => {
    if (setlistItem?.keyOverride && activeSong) {
      // Tính độ lệch giữa keyOverride và originalKey
      // Để đơn giản, gán semitones phù hợp
      setSemitones(0);
    } else {
      setSemitones(0);
    }
    setCapoFret(activeSong?.capo || 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSong, setlistItem]);

  // Tông hiển thị hiện tại
  const effectiveBaseKey = setlistItem?.keyOverride || activeSong?.originalKey || 'C';
  const currentKey = useMemo(() => {
    return transposeNote(effectiveBaseKey, semitones);
  }, [effectiveBaseKey, semitones]);

  // Dữ liệu bài hát đã dịch tông
  const transposedSong = useMemo(() => {
    if (!activeSong) return { sections: [] };
    const parsed = activeSong.rawContent
      ? parseChordProText(activeSong.rawContent)
      : (activeSong.parsedData || { sections: [] });
    return transposeParsedSong(parsed, semitones, currentKey);
  }, [activeSong, semitones, currentKey]);

  const uniqueChords = useMemo(() => {
    return extractUniqueChords(transposedSong);
  }, [transposedSong]);

  // Điều hướng trong Setlist
  const handlePrevSong = () => {
    if (!currentSetlist) return;
    if (currentSetlistIndex > 0) {
      setCurrentSetlistIndex((prev) => prev - 1);
    }
  };

  const handleNextSong = () => {
    if (!currentSetlist) return;
    if (currentSetlistIndex < currentSetlist.songs.length - 1) {
      setCurrentSetlistIndex((prev) => prev + 1);
    }
  };

  if (!activeSong) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <h2 className="text-xl font-bold mb-3">Chưa có bài hát nào để biểu diễn</h2>
        <Link href="/songs/new" className="px-4 py-2 bg-amber-500 text-black font-bold rounded-xl text-sm">
          + Thêm bài hát ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Stage Mode Sticky Controls Bar */}
      <StageControlsBar
        currentKey={currentKey}
        originalKey={activeSong.originalKey}
        semitones={semitones}
        onTransposeChange={(delta) => setSemitones(delta)}
        capoFret={capoFret}
        onCapoChange={(fret) => setCapoFret(fret)}
        onPrintPdf={() => window.print()}
        songIndexTitle={
          currentSetlist
            ? `Bài ${currentSetlistIndex + 1}/${currentSetlist.songs.length}`
            : undefined
        }
      />

      {/* Main Stage View Area */}
      <main
        className={`flex-1 w-full mx-auto px-4 sm:px-6 py-6 space-y-6 transition-all duration-300 ${
          stageSettings.columns === 3
            ? 'max-w-[96vw] xl:px-8'
            : stageSettings.columns === 2
            ? 'max-w-7xl'
            : 'max-w-5xl'
        }`}
      >
        {/* Banner Tên bài hát & Nghệ sĩ & Cues quan trọng trên sân khấu */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-900">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {currentSetlist && (
                <button
                  onClick={() => setShowDrawer(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-amber-400 font-semibold rounded-lg text-xs border border-neutral-800 transition-colors"
                >
                  <ListMusic size={14} />
                  <span>Setlist: {currentSetlist.name}</span>
                </button>
              )}
              {activeSong.tempoBpm && (
                <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-xs font-mono text-neutral-300">
                  ♩ = {activeSong.tempoBpm} BPM
                </span>
              )}
              {capoFret > 0 && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-xs font-bold">
                  Capo {capoFret}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {activeSong.title}
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 font-medium mt-0.5">
              {activeSong.artist || 'Không rõ nghệ sĩ'}
            </p>
          </div>

          {/* Nút thoát Stage Mode hoặc mở Drawer chuyển bài */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {currentSetlist && (
              <button
                onClick={() => setShowDrawer(true)}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-semibold text-neutral-300"
              >
                Danh sách bài ({currentSetlistIndex + 1}/{currentSetlist.songs.length})
              </button>
            )}

            <Link
              href={currentSetlist ? `/setlists/${currentSetlist.id}` : `/songs/${activeSong.id}`}
              className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-colors"
              title="Thoát chế độ sân khấu"
            >
              <X size={18} />
            </Link>
          </div>
        </div>

        {/* Ghi chú sân khấu cho toàn bài nếu có */}
        {(activeSong.performanceNote || setlistItem?.notesOverride) && (
          <div className="p-3 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-xl text-amber-200 text-xs sm:text-sm font-medium flex items-center gap-2">
            <Zap size={16} className="text-amber-400 shrink-0" />
            <span>
              {setlistItem?.notesOverride || activeSong.performanceNote}
            </span>
          </div>
        )}

        {/* Toàn bộ Lời & Hợp Âm sân khấu */}
        <div className="pb-24">
          <ChordSheetViewer
            song={transposedSong}
            showChords={stageSettings.showChords}
            fontSize={stageSettings.fontSize}
            columns={stageSettings.columns}
            instrument={stageSettings.instrument}
          />
        </div>
      </main>

      {/* Floating Bottom Navigator dành cho Setlist Biểu diễn liên tục */}
      {currentSetlist && currentSetlist.songs.length > 1 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-neutral-950/95 backdrop-blur-md border border-neutral-800 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-4 text-white">
          <button
            disabled={currentSetlistIndex === 0}
            onClick={handlePrevSong}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 rounded-xl text-neutral-200 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Bài trước</span>
          </button>

          <button
            onClick={() => setShowDrawer(true)}
            className="text-xs font-bold text-amber-400 font-mono hover:underline"
          >
            {currentSetlistIndex + 1} / {currentSetlist.songs.length}
          </button>

          <button
            disabled={currentSetlistIndex === currentSetlist.songs.length - 1}
            onClick={handleNextSong}
            className="flex items-center gap-1 text-xs font-bold px-4 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 rounded-xl text-neutral-950 shadow-md shadow-amber-500/20 transition-all"
          >
            <span>Bài kế tiếp</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Drawer Danh Sách Bài Trong Setlist (Nhảy nhanh bài khi đang diễn) */}
      {showDrawer && currentSetlist && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-neutral-950 border-l border-neutral-800 h-full p-5 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <div>
                <h3 className="font-bold text-white text-base">Danh mục Setlist</h3>
                <span className="text-xs text-neutral-400">{currentSetlist.name}</span>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="w-8 h-8 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {currentSetlist.songs.map((item, idx) => {
                const isCurrent = idx === currentSetlistIndex;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentSetlistIndex(idx);
                      setShowDrawer(false);
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'bg-amber-500/20 border-amber-500/50 text-white shadow-lg'
                        : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-xs font-mono text-neutral-500 mr-1.5">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-sm">{item.song.title}</span>
                      <span className="text-[11px] text-neutral-400 block">
                        {item.song.artist || 'Không rõ nghệ sĩ'}
                      </span>
                    </div>

                    <span className="font-mono text-xs font-bold text-amber-400 shrink-0">
                      {item.keyOverride || item.song.originalKey}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StageModePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <span className="text-amber-400 font-bold text-lg animate-pulse">
            Đang tải chế độ Sân Khấu...
          </span>
        </div>
      }
    >
      <StageModeContent />
    </Suspense>
  );
}
