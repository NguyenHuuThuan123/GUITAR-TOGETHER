'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useBandStore } from '@/lib/store';
import { Navbar } from '@/components/layout/Navbar';
import {
  Music2,
  ListMusic,
  Tv2,
  Plus,
  Play,
  Star,
  Search,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function HomePage() {
  const { songs, setlists, currentBand, toggleFavoriteSong } = useBandStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSongs = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const favoriteSongs = songs.filter((s) => s.isFavorite);
  const nextSetlist = setlists[0];

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-8 space-y-8">
        {/* Hero Section: Band Live Status & Quick Actions */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-amber-950/40 border border-neutral-800 p-6 md:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-xl shadow-amber-500/10 shrink-0 bg-neutral-900">
                <img src="/logo.png" alt="BAND GUITAR TOGETHER" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono tracking-wider">
                    <Sparkles size={13} className="text-amber-400" />
                    <span>BAND GUITAR TOGETHER</span>
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">
                    {songs.length} bài hát • {setlists.length} setlist
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  Không gian âm nhạc của{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
                    {currentBand.name}
                  </span>
                </h1>
                <p className="text-neutral-400 text-xs sm:text-sm max-w-2xl">
                  Quản lý hợp âm, đồng bộ lời bài hát, căn chỉnh tông tức thì và biểu diễn tự tin với
                  chế độ Stage Mode chuyên nghiệp.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {nextSetlist && (
                <Link
                  href={`/stage?setlistId=${nextSetlist.id}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold shadow-xl shadow-amber-500/25 transition-all hover:scale-102"
                >
                  <Play size={18} className="fill-neutral-950" />
                  <span>Diễn Setlist: {nextSetlist.name}</span>
                </Link>
              )}

              <Link
                href="/songs/new"
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold border border-neutral-700 transition-colors"
              >
                <Plus size={18} />
                <span>Thêm bài hát mới</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Thanh Tìm kiếm & Lọc nhanh */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Tìm nhanh bài hát theo tên, ca sĩ, thể loại hoặc hợp âm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm md:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/80 transition-colors shadow-inner"
          />
        </div>

        {/* Grid: Bài hát yêu thích & Setlists gần đây */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột 1 & 2: Danh sách bài hát */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Music2 size={20} className="text-amber-400" />
                <span>Thư viện bài hát ({filteredSongs.length})</span>
              </h2>
              <Link
                href="/songs"
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredSongs.slice(0, 6).map((song) => (
                <div
                  key={song.id}
                  className="p-4 rounded-2xl bg-neutral-900/80 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <Link
                        href={`/songs/${song.id}`}
                        className="font-bold text-base text-white group-hover:text-amber-400 transition-colors line-clamp-1"
                      >
                        {song.title}
                      </Link>
                      <button
                        onClick={() => toggleFavoriteSong(song.id)}
                        className="text-neutral-500 hover:text-amber-400 transition-colors p-1"
                      >
                        <Star
                          size={16}
                          className={song.isFavorite ? 'fill-amber-400 text-amber-400' : ''}
                        />
                      </button>
                    </div>

                    <div className="text-xs text-neutral-400 mb-3 flex items-center gap-2">
                      <span>{song.artist || 'Không rõ nghệ sĩ'}</span>
                      <span>•</span>
                      <span className="font-mono font-bold text-amber-400">
                        Tone: {song.originalKey}
                      </span>
                      {song.tempoBpm && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{song.tempoBpm} BPM</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-xs">
                    <div className="flex gap-1 flex-wrap">
                      {song.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[10px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/stage?songId=${song.id}`}
                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Tv2 size={13} />
                        <span>Stage</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cột 3: Setlists biểu diễn */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ListMusic size={20} className="text-amber-400" />
                <span>Setlist biểu diễn</span>
              </h2>
              <Link
                href="/setlists"
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {setlists.map((sl) => (
                <div
                  key={sl.id}
                  className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <Link
                      href={`/setlists/${sl.id}`}
                      className="font-bold text-base text-white hover:text-amber-400 transition-colors block mb-1 line-clamp-1"
                    >
                      {sl.name}
                    </Link>
                    <p className="text-xs text-neutral-400 line-clamp-2 mb-3">
                      {sl.description || 'Không có mô tả'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-xs">
                    <span className="text-neutral-400 font-medium">
                      {sl.songs.length} bài hát
                    </span>

                    <Link
                      href={`/stage?setlistId=${sl.id}`}
                      className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg text-xs transition-colors"
                    >
                      <Play size={13} className="fill-neutral-950" />
                      <span>Vào diễn</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
