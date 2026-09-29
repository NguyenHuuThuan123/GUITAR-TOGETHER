'use client';

import React, { useState } from 'react';
import {
  Search,
  Link as LinkIcon,
  Download,
  Music,
  ExternalLink,
  Sparkles,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export interface HopAmChuanSongResult {
  title: string;
  artist: string;
  originalKey: string;
  capo: number;
  tempoBpm?: number;
  timeSignature?: string;
  performanceNote?: string;
  rawContent: string;
  sourceUrl?: string;
}

interface SearchItem {
  title: string;
  artist: string;
  url: string;
  previewLyric: string;
  chords: string[];
}

interface HopAmChuanImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSong: (song: HopAmChuanSongResult) => void;
}

export const HopAmChuanImporterModal: React.FC<HopAmChuanImporterModalProps> = ({
  isOpen,
  onClose,
  onImportSong,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'url'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  // Xử lý tìm kiếm bài hát theo tên
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setErrorMessage('');
    setHasSearched(true);

    try {
      const res = await fetch(`/api/hopamchuan?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi tìm kiếm trên Hợp Âm Chuẩn');
      }

      setSearchResults(data.results || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể tìm kiếm bài hát, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý tải bài hát từ URL
  const handleFetchFromUrl = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/hopamchuan?url=${encodeURIComponent(targetUrl.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.song) {
        throw new Error(data.error || 'Không thể bóc tách nội dung bài hát này');
      }

      onImportSong(data.song);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi tải bài hát từ link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Nhập bài từ Hợp Âm Chuẩn</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
                  Auto ChordPro
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Tìm kiếm bài hát hoặc dán link trực tiếp từ hopamchuan.com
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'search'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Search size={15} />
            <span>Tìm kiếm theo tên bài</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'url'
                ? 'bg-neutral-800 text-amber-400 shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LinkIcon size={15} />
            <span>Dán đường link (URL)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Thông báo lỗi nếu có */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: TÌM KIẾM */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
                  />
                  <input
                    type="text"
                    placeholder="Nhập tên bài hát (VD: Miền an nhiên, Nàng thơ, Cắt đôi nỗi sầu...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !searchQuery.trim()}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold rounded-xl text-sm flex items-center gap-2 transition-all shadow-md shadow-amber-500/20"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  <span>Tìm</span>
                </button>
              </form>

              {/* Danh sách kết quả tìm kiếm */}
              <div className="space-y-2.5">
                {isLoading && (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-neutral-400">
                    <Loader2 size={28} className="animate-spin text-amber-400" />
                    <span className="text-xs">Đang tìm bài hát từ Hợp Âm Chuẩn...</span>
                  </div>
                )}

                {!isLoading && hasSearched && searchResults.length === 0 && (
                  <div className="py-12 text-center text-neutral-500 text-xs">
                    Không tìm thấy bài hát nào phù hợp với từ khoá "{searchQuery}".
                  </div>
                )}

                {!isLoading &&
                  searchResults.map((item, idx) => (
                    <div
                      key={`search-${idx}`}
                      className="p-3.5 bg-neutral-950/70 hover:bg-neutral-800/80 border border-neutral-800/80 rounded-2xl flex items-center justify-between gap-4 transition-all group"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm truncate group-hover:text-amber-400 transition-colors">
                            {item.title}
                          </h4>
                          {item.artist && (
                            <span className="text-xs text-neutral-400 truncate">
                              • {item.artist}
                            </span>
                          )}
                        </div>

                        {item.previewLyric && (
                          <p className="text-[11px] text-neutral-400 font-mono line-clamp-1">
                            {item.previewLyric}
                          </p>
                        )}

                        {item.chords && item.chords.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            {item.chords.map((c, cIdx) => (
                              <span
                                key={`chord-${cIdx}`}
                                className="px-1.5 py-0.2 bg-neutral-800 border border-neutral-700/60 rounded text-[10px] font-mono text-amber-400 font-bold"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleFetchFromUrl(item.url)}
                        disabled={isLoading}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition-all"
                      >
                        <Download size={14} />
                        <span>Chọn bài</span>
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 2: NHẬP QUA LINK */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-neutral-300 font-semibold block">
                  Đường dẫn bài hát trên hopamchuan.com hoặc ID bài hát:
                </label>
                <div className="relative">
                  <LinkIcon
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
                  />
                  <input
                    type="text"
                    placeholder="https://hopamchuan.com/song/57151/mien-an-nhien hoặc 57151"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-2xl space-y-2 text-xs text-neutral-400">
                <span className="font-semibold text-neutral-300 block">💡 Cách lấy link:</span>
                <p>
                  1. Mở trang bài hát bất kỳ trên{' '}
                  <a
                    href="https://hopamchuan.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 underline"
                  >
                    hopamchuan.com
                  </a>
                  .
                </p>
                <p>2. Sao chép thanh địa chỉ (URL) trên trình duyệt.</p>
                <p>3. Dán vào ô trên và bấm nút "Tải dữ liệu bài hát".</p>
              </div>

              <button
                type="button"
                onClick={() => handleFetchFromUrl(urlInput)}
                disabled={isLoading || !urlInput.trim()}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                <span>Tải dữ liệu bài hát về form</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
