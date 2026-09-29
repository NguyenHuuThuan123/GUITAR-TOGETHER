'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useBandStore } from '@/lib/store';
import { Navbar } from '@/components/layout/Navbar';
import {
  ListMusic,
  Plus,
  Play,
  Calendar,
  Clock,
  Trash2,
  Tv2,
  ChevronRight,
  Music,
} from 'lucide-react';

export default function SetlistsPage() {
  const { setlists, addSetlist, deleteSetlist } = useBandStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addSetlist(name.trim(), description.trim(), eventDate || undefined);
    setName('');
    setDescription('');
    setEventDate('');
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <ListMusic className="text-amber-400" size={28} />
              <span>Setlist Biểu Diễn & Luyện Tập</span>
            </h1>
            <p className="text-xs md:text-sm text-neutral-400 mt-1">
              Sắp xếp thứ tự các bài hát cho từng show diễn, phòng trà hoặc buổi tập band
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-102 cursor-pointer"
          >
            <Plus size={18} />
            <span>Tạo Setlist Mới</span>
          </button>
        </div>

        {/* Setlist Cards */}
        {setlists.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/40 rounded-3xl border border-neutral-800 space-y-3">
            <ListMusic size={40} className="mx-auto text-neutral-600" />
            <h3 className="text-lg font-bold text-neutral-300">Chưa có Setlist nào</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Hãy tạo danh sách bài hát cho buổi diễn hoặc buổi tập sắp tới của bạn!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {setlists.map((sl) => {
              // Ước lượng thời lượng: trung bình 4 phút/bài
              const estimatedMinutes = sl.songs.length * 4;

              return (
                <div
                  key={sl.id}
                  className="p-5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Link
                        href={`/setlists/${sl.id}`}
                        className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1"
                      >
                        {sl.name}
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm(`Xóa setlist "${sl.name}"?`)) {
                            deleteSetlist(sl.id);
                          }
                        }}
                        className="text-neutral-600 hover:text-rose-400 transition-colors p-1"
                        title="Xóa setlist"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-2 mb-3">
                      {sl.description || 'Không có ghi chú thêm'}
                    </p>

                    {/* Metadata: Date & Duration */}
                    <div className="flex items-center gap-3 text-xs text-neutral-400 mb-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Music size={13} className="text-amber-400" />
                        <strong className="text-neutral-200">{sl.songs.length} bài</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-blue-400" />
                        <span>~{estimatedMinutes} phút</span>
                      </span>
                      {sl.eventDate && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={13} className="text-emerald-400" />
                            <span>{new Date(sl.eventDate).toLocaleDateString('vi-VN')}</span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Mini song list preview */}
                    <div className="space-y-1 mb-4 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80">
                      {sl.songs.length === 0 ? (
                        <span className="text-[11px] text-neutral-500 italic block py-1">
                          Chưa có bài hát nào trong setlist
                        </span>
                      ) : (
                        sl.songs.slice(0, 3).map((item, idx) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-xs text-neutral-300 py-0.5"
                          >
                            <span className="truncate pr-2">
                              {idx + 1}. {item.song.title}
                            </span>
                            <span className="font-mono text-amber-400 text-[10px] shrink-0 font-bold">
                              {item.keyOverride || item.song.originalKey}
                            </span>
                          </div>
                        ))
                      )}
                      {sl.songs.length > 3 && (
                        <span className="text-[10px] text-neutral-500 block pt-1">
                          +{sl.songs.length - 3} bài hát khác...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80 text-xs">
                    <Link
                      href={`/setlists/${sl.id}`}
                      className="text-neutral-400 hover:text-white font-medium flex items-center gap-1"
                    >
                      <span>Sắp xếp bài hát</span>
                      <ChevronRight size={14} />
                    </Link>

                    {sl.songs.length > 0 && (
                      <Link
                        href={`/stage?setlistId=${sl.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg shadow-md transition-colors"
                      >
                        <Tv2 size={14} />
                        <span>Diễn trên sân khấu</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Tạo Setlist mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <ListMusic className="text-amber-400" size={20} />
              <span>Tạo Setlist Biểu Diễn Mới</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Đặt tên theo sự kiện hoặc ngày diễn để cả band cùng theo dõi
            </p>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-xs text-neutral-300 font-semibold block mb-1">
                  Tên Setlist *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Show Acoustic Thứ 7 - The Lounge"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 font-semibold block mb-1">
                  Mô tả / Lưu ý
                </label>
                <textarea
                  placeholder="VD: Dự kiến 8h tối bắt đầu, tone ca sĩ nam/nữ..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 resize-none h-20"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 font-semibold block mb-1">
                  Ngày diễn (Tùy chọn)
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl shadow-lg transition-colors"
                >
                  Tạo Setlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
