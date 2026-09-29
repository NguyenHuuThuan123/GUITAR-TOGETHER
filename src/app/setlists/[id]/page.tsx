'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useBandStore } from '@/lib/store';
import { Navbar } from '@/components/layout/Navbar';
import {
  ListMusic,
  Plus,
  Play,
  ArrowUp,
  ArrowDown,
  Trash2,
  Tv2,
  ChevronLeft,
  Music,
  Clock,
  Sparkles,
  Edit2,
  Save,
} from 'lucide-react';

export default function SetlistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const {
    setlists,
    songs,
    addSongToSetlist,
    removeSongFromSetlist,
    reorderSetlistSongs,
    updateSetlistItemKey,
  } = useBandStore();

  const setlist = setlists.find((sl) => sl.id === resolvedParams.id);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [selectedSongToAdd, setSelectedSongToAdd] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  if (!setlist) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <p className="text-neutral-400 mb-4">Không tìm thấy Setlist này.</p>
          <Link href="/setlists" className="px-4 py-2 bg-amber-500 text-neutral-950 font-bold rounded-xl">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  // Move song up/down
  const moveSong = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= setlist.songs.length) return;

    const ids = setlist.songs.map((s) => s.songId);
    const temp = ids[index];
    ids[index] = ids[newIndex];
    ids[newIndex] = temp;

    reorderSetlistSongs(setlist.id, ids);
  };

  const handleAddSong = () => {
    if (!selectedSongToAdd) return;
    addSongToSetlist(setlist.id, selectedSongToAdd);
    setSelectedSongToAdd('');
    setShowAddSongModal(false);
  };

  const estimatedMinutes = setlist.songs.length * 4;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/setlists"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Tất cả Setlists</span>
          </Link>

          {setlist.songs.length > 0 && (
            <Link
              href={`/stage?setlistId=${setlist.id}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all text-xs sm:text-sm hover:scale-102"
            >
              <Tv2 size={16} />
              <span>Bắt Đầu Biểu Diễn Sân Khấu</span>
            </Link>
          )}
        </div>

        {/* Setlist Info Banner */}
        <div className="p-6 bg-neutral-900/80 border border-neutral-800 rounded-3xl space-y-3 shadow-xl">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <ListMusic className="text-amber-400" size={28} />
            <span>{setlist.name}</span>
          </h1>

          <p className="text-xs md:text-sm text-neutral-400">
            {setlist.description || 'Chưa có ghi chú mô tả cho buổi diễn'}
          </p>

          <div className="flex items-center gap-4 text-xs text-neutral-400 pt-2 border-t border-neutral-800/80">
            <span className="flex items-center gap-1">
              <Music size={14} className="text-amber-400" />
              <strong className="text-white">{setlist.songs.length} bài hát</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={14} className="text-blue-400" />
              <span>Thời lượng ước tính: ~{estimatedMinutes} phút</span>
            </span>
          </div>
        </div>

        {/* Songs in Setlist (Order & Overrides) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              Thứ tự bài hát trong buổi diễn ({setlist.songs.length})
            </h2>

            <button
              onClick={() => setShowAddSongModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-300 font-semibold border border-neutral-800 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Plus size={15} />
              <span>Thêm bài từ thư viện</span>
            </button>
          </div>

          {setlist.songs.length === 0 ? (
            <div className="text-center py-12 bg-neutral-900/40 rounded-2xl border border-neutral-800 space-y-2">
              <p className="text-xs text-neutral-400">Setlist chưa có bài hát nào.</p>
              <button
                onClick={() => setShowAddSongModal(true)}
                className="px-4 py-2 bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs"
              >
                + Thêm bài hát ngay
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {setlist.songs.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 bg-neutral-900/90 hover:bg-neutral-900 border border-neutral-800/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Số thứ tự */}
                    <span className="w-7 h-7 rounded-lg bg-neutral-800 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/songs/${item.songId}`}
                        className="font-bold text-sm md:text-base text-white hover:text-amber-400 transition-colors truncate block"
                      >
                        {item.song.title}
                      </Link>
                      <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                        <span>{item.song.artist || 'Không rõ nghệ sĩ'}</span>
                        <span>•</span>
                        <span className="text-[11px] text-neutral-500">
                          Tông gốc: {item.song.originalKey}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cụm chỉnh Tông biểu diễn riêng (Key Override) & Reorder */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
                    <div className="flex items-center gap-1.5 bg-neutral-950 px-2.5 py-1 rounded-xl border border-neutral-800">
                      <span className="text-[11px] text-neutral-400">Tông show:</span>
                      <select
                        value={item.keyOverride || item.song.originalKey}
                        onChange={(e) => updateSetlistItemKey(setlist.id, item.songId, e.target.value)}
                        className="bg-transparent text-amber-400 font-mono font-bold text-xs focus:outline-none"
                      >
                        {['C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B', 'Am', 'Em', 'Dm', 'Bm', 'F#m'].map(
                          (k) => (
                            <option key={k} value={k} className="bg-neutral-900 text-white">
                              {k}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* Điều khiển di chuyển thứ tự bài */}
                    <div className="flex items-center gap-1">
                      <button
                        disabled={idx === 0}
                        onClick={() => moveSong(idx, 'up')}
                        className="p-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-neutral-300 rounded-lg text-xs transition-colors"
                        title="Đẩy lên trước"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        disabled={idx === setlist.songs.length - 1}
                        onClick={() => moveSong(idx, 'down')}
                        className="p-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-neutral-300 rounded-lg text-xs transition-colors"
                        title="Đẩy xuống sau"
                      >
                        <ArrowDown size={14} />
                      </button>

                      <button
                        onClick={() => removeSongFromSetlist(setlist.id, item.songId)}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors ml-1"
                        title="Bỏ bài này khỏi Setlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Chọn bài hát từ thư viện để thêm vào */}
      {showAddSongModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Plus className="text-amber-400" size={18} />
              <span>Thêm bài hát vào Setlist</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Chọn bài từ kho nhạc của ban nhạc để đưa vào danh sách diễn
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {songs.map((song) => {
                const isAlreadyIn = setlist.songs.some((s) => s.songId === song.id);

                return (
                  <button
                    key={song.id}
                    disabled={isAlreadyIn}
                    onClick={() => {
                      addSongToSetlist(setlist.id, song.id);
                      setShowAddSongModal(false);
                    }}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-colors ${
                      isAlreadyIn
                        ? 'bg-neutral-950/40 border-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-white'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-xs md:text-sm block">{song.title}</span>
                      <span className="text-[11px] text-neutral-400">
                        {song.artist || 'Không rõ ca sĩ'} • Tông {song.originalKey}
                      </span>
                    </div>

                    {isAlreadyIn ? (
                      <span className="text-[10px] text-neutral-500">Đã có</span>
                    ) : (
                      <span className="text-xs text-amber-400 font-bold">+ Chọn</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowAddSongModal(false)}
                className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
