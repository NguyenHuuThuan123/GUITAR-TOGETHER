'use client';

import React, { useState, useMemo, use } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useBandStore } from '@/lib/store';
import { Navbar } from '@/components/layout/Navbar';
import { ChordSheetViewer } from '@/components/chord-engine/ChordSheetViewer';
import { transposeParsedSong, transposeNote } from '@/lib/chord-engine/transposer';
import { ChordDiagram } from '@/components/chord-engine/ChordDiagram';
import { extractUniqueChords, parseChordProText } from '@/lib/chord-engine/parser';
import { ColumnCount } from '@/types/chord';
import {
  Tv2,
  Edit,
  Star,
  MessageSquare,
  History,
  Printer,
  ChevronLeft,
  Share2,
  Send,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function SongDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { songs, toggleFavoriteSong, addComment, updateSong } = useBandStore();

  const song = songs.find((s) => s.id === resolvedParams.id);
  const [semitones, setSemitones] = useState(0);
  const [columns, setColumns] = useState<ColumnCount>(1);
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'sheet' | 'comments' | 'history'>('sheet');

  if (!song) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Không tìm thấy bài hát</h2>
          <p className="text-sm text-neutral-400 mb-6">Bài hát này có thể đã bị xóa hoặc không tồn tại.</p>
          <Link
            href="/songs"
            className="px-5 py-2.5 bg-amber-500 text-neutral-950 font-bold rounded-xl"
          >
            Quay lại thư viện
          </Link>
        </div>
      </div>
    );
  }

  // Tông hiện tại sau khi dịch
  const currentKey = useMemo(() => {
    return transposeNote(song.originalKey, semitones);
  }, [song.originalKey, semitones]);

  // Cấu trúc bài hát sau khi dịch tông
  const transposedSong = useMemo(() => {
    if (!song) return { sections: [] };
    const parsed = song.rawContent
      ? parseChordProText(song.rawContent)
      : (song.parsedData || { sections: [] });
    return transposeParsedSong(parsed, semitones, currentKey);
  }, [song, semitones, currentKey]);

  const uniqueChords = useMemo(() => {
    return extractUniqueChords(transposedSong);
  }, [transposedSong]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(song.id, commentText.trim());
    setCommentText('');
  };

  const handleRestoreVersion = (content: string) => {
    if (confirm('Khôi phục nội dung bài hát về phiên bản này?')) {
      updateSong(song.id, { rawContent: content });
      alert('Đã khôi phục thành công!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col print:bg-white print:text-black">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Navigation Breadcrumb & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            href="/songs"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Thư viện bài hát</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/stage?songId=${song.id}&transpose=${semitones}`}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm transition-all"
            >
              <Tv2 size={16} />
              <span>Mở Sân Khấu (Stage Mode)</span>
            </Link>

            <Link
              href={`/songs/${song.id}/edit`}
              className="flex items-center gap-1 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded-xl text-xs border border-neutral-800"
            >
              <Edit size={14} />
              <span>Sửa bài hát</span>
            </Link>

            <button
              onClick={handlePrint}
              className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs border border-neutral-800"
              title="In ấn bản nhạc"
            >
              <Printer size={16} />
            </button>

            <button
              onClick={() => toggleFavoriteSong(song.id)}
              className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs border border-neutral-800"
            >
              <Star
                size={16}
                className={song.isFavorite ? 'fill-amber-400 text-amber-400' : ''}
              />
            </button>
          </div>
        </div>

        {/* Header thông tin bài hát */}
        <div className="p-6 bg-neutral-900/80 border border-neutral-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                {song.title}
              </h1>
              <p className="text-sm md:text-base text-neutral-400 mt-1">
                {song.artist || 'Chưa cập nhật nghệ sĩ'}
              </p>
            </div>

            {/* Quick Transpose in details */}
            <div className="flex items-center gap-2 bg-neutral-950 px-3 py-2 rounded-2xl border border-neutral-800 print:hidden">
              <span className="text-xs text-neutral-400 font-medium">Tông:</span>
              <span className="text-lg font-bold font-mono text-amber-400 min-w-[2.2rem] text-center">
                {currentKey}
              </span>
              {semitones !== 0 && (
                <span className="text-xs text-emerald-400 font-mono">
                  ({semitones > 0 ? `+${semitones}` : semitones})
                </span>
              )}

              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => setSemitones(semitones - 1)}
                  className="w-7 h-7 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-bold text-neutral-200"
                >
                  -
                </button>
                <button
                  onClick={() => setSemitones(semitones + 1)}
                  className="w-7 h-7 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-bold text-neutral-200"
                >
                  +
                </button>
                {semitones !== 0 && (
                  <button
                    onClick={() => setSemitones(0)}
                    className="text-xs text-neutral-500 hover:text-white px-1.5"
                  >
                    Gốc
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Metadata badges */}
          <div className="flex items-center gap-3 text-xs text-neutral-400 flex-wrap pt-2 border-t border-neutral-800/80">
            <span>Tông gốc: <strong className="text-amber-400">{song.originalKey}</strong></span>
            {song.tempoBpm && <span>BPM: <strong className="text-white">{song.tempoBpm}</strong></span>}
            {song.timeSignature && <span>Nhịp: <strong className="text-white">{song.timeSignature}</strong></span>}
            {song.capo !== undefined && song.capo > 0 && (
              <span>Capo: <strong className="text-amber-400">Ngăn {song.capo}</strong></span>
            )}
            <div className="flex gap-1.5 ml-auto">
              {song.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 bg-neutral-800 rounded-full text-[11px] text-neutral-300">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Performance Note chung nếu có */}
          {song.performanceNote && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200">
              <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-300 font-semibold mb-0.5">Lưu ý biểu diễn của Band:</strong>
                <span>{song.performanceNote}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tab navigation: Bản nhạc / Bình luận / Lịch sử sửa */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 print:hidden">
          <button
            onClick={() => setActiveTab('sheet')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-colors ${
              activeTab === 'sheet'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Bản nhạc & Hợp âm
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'comments'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <MessageSquare size={15} />
            <span>Trao đổi band ({song.comments?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'history'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <History size={15} />
            <span>Lịch sử ({song.versions?.length || 1})</span>
          </button>
        </div>

        {/* Tab 1: Bản nhạc & Sơ đồ hợp âm */}
        {activeTab === 'sheet' && (
          <div className="space-y-6">
            {/* Chord Diagram overview row */}
            {uniqueChords.length > 0 && (
              <div className="p-4 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl">
                <span className="text-xs font-semibold text-neutral-400 block mb-3">
                  Sơ đồ thế bấm các hợp âm trong bài (Tông {currentKey}):
                </span>
                <div className="flex items-center gap-4 overflow-x-auto pb-1">
                  {uniqueChords.map((chord) => (
                    <div
                      key={chord}
                      className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 shrink-0"
                    >
                      <ChordDiagram chord={chord} width={90} height={105} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Viewer lời và hợp âm */}
            <div className="p-6 bg-neutral-900/40 border border-neutral-800 rounded-3xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 flex-wrap gap-2 print:hidden">
                <span className="text-xs text-neutral-400 font-semibold">Lời bài hát & Hợp âm:</span>
                
                {/* Bộ điều khiển chia cột */}
                <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-xl p-1 text-xs">
                  <span className="text-[11px] text-neutral-500 px-1 font-medium">Bố cục:</span>
                  {([1, 2, 3, 'auto'] as const).map((c) => (
                    <button
                      key={String(c)}
                      onClick={() => setColumns(c)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        columns === c
                          ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                      title={c === 'auto' ? 'Tự động co giãn theo độ rộng màn hình' : `Chia làm ${c} cột`}
                    >
                      {c === 'auto' ? 'Tự động' : `${c} Cột`}
                    </button>
                  ))}
                </div>
              </div>

              <ChordSheetViewer
                song={transposedSong}
                showChords={true}
                fontSize="lg"
                columns={columns}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Trao đổi & Bình luận của các thành viên */}
        {activeTab === 'comments' && (
          <div className="space-y-4">
            <form onSubmit={handleSendComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Viết ghi chú hoặc trao đổi cho các thành viên (VD: Bass solo ở Verse 2)..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <Send size={14} />
                <span>Gửi</span>
              </button>
            </form>

            <div className="space-y-3">
              {(!song.comments || song.comments.length === 0) ? (
                <p className="text-xs text-neutral-500 text-center py-8">
                  Chưa có trao đổi nào. Hãy để lại ghi chú cho các thành viên trong ban nhạc!
                </p>
              ) : (
                song.comments.map((cmt) => (
                  <div
                    key={cmt.id}
                    className="p-3.5 bg-neutral-900/90 rounded-2xl border border-neutral-800/80 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-neutral-800 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {cmt.userName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-white">{cmt.userName}</span>
                        <span className="text-[10px] text-neutral-500">
                          {new Date(cmt.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">{cmt.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Lịch sử chỉnh sửa bài hát */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <p className="text-xs text-neutral-400">
              Mỗi lần chỉnh sửa nội dung bài hát, hệ thống tự động ghi lại bản sao để có thể hoàn tác
              bất cứ lúc nào.
            </p>

            <div className="space-y-2">
              {song.versions?.map((ver, idx) => (
                <div
                  key={ver.id}
                  className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-sm font-semibold text-white block">
                      Phiên bản {song.versions!.length - idx}: {ver.note || 'Chỉnh sửa lời & hợp âm'}
                    </span>
                    <span className="text-xs text-neutral-400">
                      Bởi {ver.editedByName || 'Thành viên band'} • {new Date(ver.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRestoreVersion(ver.content)}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-semibold text-xs rounded-lg transition-colors"
                  >
                    Khôi phục bản này
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
