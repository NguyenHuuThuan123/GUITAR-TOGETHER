'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBandStore } from '@/lib/store';
import { Navbar } from '@/components/layout/Navbar';
import { HopAmChuanImporterModal, HopAmChuanSongResult } from '@/components/common/HopAmChuanImporterModal';
import {
  Music2,
  Plus,
  Search,
  Star,
  Tv2,
  Edit,
  Trash2,
  Filter,
  ListPlus,
  Check,
  Sparkles,
} from 'lucide-react';

export default function SongsPage() {
  const router = useRouter();
  const { songs, setlists, toggleFavoriteSong, deleteSong, addSongToSetlist, addSong } = useBandStore();
  const [search, setSearch] = useState('');
  const [selectedKey, setSelectedKey] = useState<string>('ALL');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [showHacModal, setShowHacModal] = useState(false);

  // Modal thêm bài vào setlist
  const [addingToSetlistSongId, setAddingToSetlistSongId] = useState<string | null>(null);
  const [addedSetlistId, setAddedSetlistId] = useState<string | null>(null);

  // Tập hợp tất cả các tag
  const allTags = Array.from(new Set(songs.flatMap((s) => s.tags)));

  const filteredSongs = songs.filter((song) => {
    const matchSearch =
      song.title.toLowerCase().includes(search.toLowerCase()) ||
      song.artist?.toLowerCase().includes(search.toLowerCase()) ||
      song.rawContent.toLowerCase().includes(search.toLowerCase());

    const matchKey = selectedKey === 'ALL' || song.originalKey === selectedKey;
    const matchFav = !onlyFavorites || song.isFavorite;
    const matchTag = selectedTag === 'ALL' || song.tags.includes(selectedTag);

    return matchSearch && matchKey && matchFav && matchTag;
  });

  const handleAddSongToSetlist = (setlistId: string, songId: string) => {
    addSongToSetlist(setlistId, songId);
    setAddedSetlistId(setlistId);
    setTimeout(() => {
      setAddedSetlistId(null);
      setAddingToSetlistSongId(null);
    }, 1200);
  };

  const handleImportSong = (imported: HopAmChuanSongResult) => {
    const created = addSong({
      title: imported.title,
      artist: imported.artist,
      originalKey: imported.originalKey,
      capo: imported.capo,
      tempoBpm: imported.tempoBpm,
      timeSignature: imported.timeSignature,
      performanceNote: imported.performanceNote,
      rawContent: imported.rawContent,
      tags: ['Hợp Âm Chuẩn'],
    });
    router.push(`/songs/${created.id}`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Header thư viện */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <Music2 className="text-amber-400" size={28} />
              <span>Thư viện bài hát của Band</span>
            </h1>
            <p className="text-xs md:text-sm text-neutral-400 mt-1">
              Tổng cộng {songs.length} bài hát đã được lưu trữ và đồng bộ
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowHacModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-amber-300 hover:text-white border border-amber-500/30 hover:border-amber-500 font-bold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <Sparkles size={17} className="text-amber-400 animate-pulse" />
              <span>Nhập từ Hợp Âm Chuẩn</span>
            </button>

            <Link
              href="/songs/new"
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-102"
            >
              <Plus size={18} />
              <span>Thêm bài hát mới</span>
            </Link>
          </div>
        </div>

        {/* Thanh Tìm kiếm & Bộ Lọc Nâng Cao */}
        <div className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl space-y-3">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Tìm theo tên bài hát, nghệ sĩ hoặc câu hát trong bài..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Lọc theo Tông, Thể loại, Yêu thích */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-neutral-400 font-medium flex items-center gap-1">
              <Filter size={13} />
              <span>Lọc:</span>
            </span>

            {/* Lọc tông */}
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Mọi tông</option>
              {['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Am', 'Em', 'Dm', 'Bm', 'F#m'].map((k) => (
                <option key={k} value={k}>
                  Tông {k}
                </option>
              ))}
            </select>

            {/* Lọc tag */}
            {allTags.length > 0 && (
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-300 focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">Mọi thể loại</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            )}

            {/* Nút lọc yêu thích */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                onlyFavorites
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
              }`}
            >
              <Star size={13} className={onlyFavorites ? 'fill-amber-400 text-amber-400' : ''} />
              <span>Yêu thích ({songs.filter((s) => s.isFavorite).length})</span>
            </button>
          </div>
        </div>

        {/* Danh sách bài hát */}
        {filteredSongs.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/40 rounded-3xl border border-neutral-800 space-y-3">
            <Music2 size={40} className="mx-auto text-neutral-600" />
            <h3 className="text-lg font-bold text-neutral-300">Không tìm thấy bài hát nào</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Thử tìm kiếm với từ khóa khác hoặc tạo bài hát mới cho ban nhạc của bạn!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSongs.map((song) => (
              <div
                key={song.id}
                className="p-5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link
                      href={`/songs/${song.id}`}
                      className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1"
                    >
                      {song.title}
                    </Link>
                    <button
                      onClick={() => toggleFavoriteSong(song.id)}
                      className="text-neutral-500 hover:text-amber-400 transition-colors p-1"
                      title={song.isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                    >
                      <Star
                        size={18}
                        className={song.isFavorite ? 'fill-amber-400 text-amber-400' : ''}
                      />
                    </button>
                  </div>

                  <div className="text-xs text-neutral-400 mb-3 flex items-center gap-2 flex-wrap">
                    <span>{song.artist || 'Không rõ ca sĩ'}</span>
                    <span>•</span>
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      Tông: {song.originalKey}
                    </span>
                    {song.tempoBpm && (
                      <span className="font-mono bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">
                        {song.tempoBpm} BPM
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex gap-1.5 flex-wrap mb-4">
                    {song.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-neutral-800/80 text-neutral-400 text-[10px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions bottom bar */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/stage?songId=${song.id}`}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg flex items-center gap-1 transition-colors"
                      title="Mở ngay trên sân khấu"
                    >
                      <Tv2 size={14} />
                      <span>Stage</span>
                    </Link>

                    <button
                      onClick={() => setAddingToSetlistSongId(song.id)}
                      className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-colors"
                      title="Thêm bài này vào Setlist"
                    >
                      <ListPlus size={16} />
                    </button>

                    <Link
                      href={`/songs/${song.id}/edit`}
                      className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-colors"
                      title="Chỉnh sửa bài hát"
                    >
                      <Edit size={16} />
                    </Link>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn xóa bài "${song.title}" khỏi thư viện?`)) {
                        deleteSong(song.id);
                      }
                    }}
                    className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors"
                    title="Xóa bài hát"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Thêm vào Setlist */}
      {addingToSetlistSongId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <ListPlus className="text-amber-400" size={18} />
              <span>Chọn Setlist để thêm bài hát</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Bài hát sẽ được đưa vào danh sách biểu diễn tương ứng
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {setlists.map((sl) => {
                const alreadyAdded = sl.songs.some((item) => item.songId === addingToSetlistSongId);

                return (
                  <button
                    key={sl.id}
                    disabled={alreadyAdded}
                    onClick={() => handleAddSongToSetlist(sl.id, addingToSetlistSongId)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-colors ${
                      alreadyAdded
                        ? 'bg-neutral-950/40 border-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-white'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-sm block">{sl.name}</span>
                      <span className="text-[11px] text-neutral-400">{sl.songs.length} bài hát</span>
                    </div>

                    {addedSetlistId === sl.id ? (
                      <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                        <Check size={14} /> Đã thêm
                      </span>
                    ) : alreadyAdded ? (
                      <span className="text-[11px] text-neutral-500">Đã có</span>
                    ) : (
                      <span className="text-xs text-amber-400 font-bold">+ Thêm</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setAddingToSetlistSongId(null)}
                className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tìm kiếm & Nhập bài tự động từ Hợp Âm Chuẩn */}
      <HopAmChuanImporterModal
        isOpen={showHacModal}
        onClose={() => setShowHacModal(false)}
        onImportSong={handleImportSong}
      />
    </div>
  );
}
