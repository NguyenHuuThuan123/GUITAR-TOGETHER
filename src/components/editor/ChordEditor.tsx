'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { parseChordProText, extractUniqueChords } from '@/lib/chord-engine/parser';
import { convertTwoLineToBracket } from '@/lib/chord-engine/two-line-parser';
import { ChordSheetViewer } from '@/components/chord-engine/ChordSheetViewer';
import { ChordDiagram } from '@/components/chord-engine/ChordDiagram';
import { Song } from '@/types/database';
import { ColumnCount } from '@/types/chord';
import {
  Save,
  Wand2,
  HelpCircle,
  FileText,
  Eye,
  Sliders,
  Sparkles,
  Music,
  Plus,
  ArrowRight,
  ClipboardPaste,
  Split,
} from 'lucide-react';
import { HopAmChuanImporterModal, HopAmChuanSongResult } from '@/components/common/HopAmChuanImporterModal';

interface ChordEditorProps {
  initialSong?: Song;
  onSave: (songData: {
    title: string;
    artist?: string;
    originalKey: string;
    tempoBpm?: number;
    timeSignature?: string;
    capo?: number;
    rawContent: string;
    tags: string[];
    performanceNote?: string;
  }) => void;
  onCancel?: () => void;
}

export const ChordEditor: React.FC<ChordEditorProps> = ({
  initialSong,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialSong?.title || '');
  const [artist, setArtist] = useState(initialSong?.artist || '');
  const [originalKey, setOriginalKey] = useState(initialSong?.originalKey || 'C');
  const [tempoBpm, setTempoBpm] = useState<number>(initialSong?.tempoBpm || 90);
  const [timeSignature, setTimeSignature] = useState(initialSong?.timeSignature || '4/4');
  const [capo, setCapo] = useState<number>(initialSong?.capo || 0);
  const [tagsInput, setTagsInput] = useState(initialSong?.tags?.join(', ') || 'Acoustic, Ballad');
  const [performanceNote, setPerformanceNote] = useState(initialSong?.performanceNote || '');
  const [rawContent, setRawContent] = useState(
    initialSong?.rawContent ||
      `[Intro]\n[C] [G] [Am] [F]\n{cue: Guitar rải nhẹ, piano solo 4 nhịp}\n\n[Verse 1]\n[C]Một ngày nắng [G/B]gió qua thềm [Am]vắng\n[F]Gặp lại nụ cười [G]quen thuộc ngày xưa...\n\n[Chorus]\n{cue: Trống vào nhịp dồn, cả band bùng nổ}\n[C]Cầm tay anh [G]đi qua năm tháng [Am]dài\n[F]Dẫu cho mai sau muôn trùng [G]bão giông...`
  );

  // Chế độ: 'dual' (vừa gõ vừa xem preview), 'text' (chỉ gõ text), 'visual' (click gán hợp âm), 'import' (dán 2 dòng tự convert)
  const [activeTab, setActiveTab] = useState<'dual' | 'visual' | 'import'>('dual');
  const [importText, setImportText] = useState('');
  const [selectedWordToChord, setSelectedWordToChord] = useState<{ text: string; index: number } | null>(null);
  const [chordToInsert, setChordToInsert] = useState('C');
  const [previewColumns, setPreviewColumns] = useState<ColumnCount>(1);
  const [showHacModal, setShowHacModal] = useState(false);

  const handleHacImport = (importedSong: HopAmChuanSongResult) => {
    setTitle(importedSong.title);
    if (importedSong.artist) setArtist(importedSong.artist);
    if (importedSong.originalKey) setOriginalKey(importedSong.originalKey);
    if (importedSong.capo !== undefined) setCapo(importedSong.capo);
    if (importedSong.tempoBpm) setTempoBpm(importedSong.tempoBpm);
    if (importedSong.performanceNote) setPerformanceNote(importedSong.performanceNote);
    setRawContent(importedSong.rawContent);
    setActiveTab('dual');
  };

  // Parse thời gian thực
  const parsedSong = useMemo(() => {
    return parseChordProText(rawContent);
  }, [rawContent]);

  // Danh sách các hợp âm đã dùng trong bài
  const uniqueChords = useMemo(() => {
    return extractUniqueChords(parsedSong);
  }, [parsedSong]);

  // Insert nhanh cú pháp section
  const insertSection = (sectionName: string) => {
    setRawContent((prev) => `${prev.trimEnd()}\n\n[${sectionName}]\n`);
  };

  // Insert ngắt cột
  const insertColumnBreak = () => {
    setRawContent((prev) => `${prev.trimEnd()}\n\n{column_break}\n`);
  };

  // Insert nhanh cue note
  const insertCue = (cueText: string) => {
    setRawContent((prev) => `${prev.trimEnd()}\n{cue: ${cueText}}\n`);
  };

  // Chèn nhanh hợp âm vào con trỏ
  const insertChordToken = (chord: string) => {
    setRawContent((prev) => `${prev}[${chord}]`);
  };

  // Tự động convert khi dán định dạng 2 dòng
  const handleAutoConvert = () => {
    if (!importText.trim()) return;
    const converted = convertTwoLineToBracket(importText);
    setRawContent(converted);
    setActiveTab('dual');
    setImportText('');
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tên bài hát!');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      title,
      artist,
      originalKey,
      tempoBpm,
      timeSignature,
      capo,
      rawContent,
      tags,
      performanceNote,
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-950 text-white rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden">
      {/* Top Bar: Thông tin metadata & Actions */}
      <div className="p-4 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <input
            type="text"
            placeholder="Tên bài hát..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl md:text-2xl font-bold bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-amber-400 focus:outline-none px-1 py-0.5 text-white placeholder-neutral-500 w-full"
          />
          <input
            type="text"
            placeholder="Nghệ sĩ / Nhạc sĩ..."
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="text-sm bg-neutral-800/80 border border-neutral-700 rounded-lg px-2.5 py-1 text-neutral-300 placeholder-neutral-500 focus:outline-none focus:border-amber-400 w-44"
          />
        </div>

        {/* Cấu hình Tone, BPM, Capo */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded-lg border border-neutral-700">
            <span className="text-neutral-400">Tông gốc:</span>
            <select
              value={originalKey}
              onChange={(e) => setOriginalKey(e.target.value)}
              className="bg-transparent text-amber-400 font-bold font-mono focus:outline-none"
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

          <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded-lg border border-neutral-700">
            <span className="text-neutral-400">BPM:</span>
            <input
              type="number"
              value={tempoBpm}
              onChange={(e) => setTempoBpm(Number(e.target.value))}
              className="w-12 bg-transparent text-amber-400 font-mono font-bold focus:outline-none text-center"
              min={40}
              max={240}
            />
          </div>

          <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded-lg border border-neutral-700">
            <span className="text-neutral-400">Capo:</span>
            <input
              type="number"
              value={capo}
              onChange={(e) => setCapo(Number(e.target.value))}
              className="w-8 bg-transparent text-amber-400 font-mono font-bold focus:outline-none text-center"
              min={0}
              max={11}
            />
          </div>

          {/* Nút Lưu & Hủy */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Save size={16} />
            <span>Lưu bài hát</span>
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              Đóng
            </button>
          )}
        </div>
      </div>

      {/* Tabs Chế độ & Toolbar trợ giúp */}
      <div className="px-4 py-2 bg-neutral-900/60 border-b border-neutral-800/80 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
          <button
            onClick={() => setActiveTab('dual')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dual'
                ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Soạn thảo & Xem trước (Song song)
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              activeTab === 'import'
                ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Wand2 size={13} />
            <span>Import tự động (2 dòng)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHacModal(true)}
            className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 hover:text-white border border-amber-500/40 hover:border-amber-400 transition-all cursor-pointer shadow-sm"
          >
            <Sparkles size={13} className="text-amber-400 animate-pulse" />
            <span>Lấy từ Hợp Âm Chuẩn</span>
          </button>
        </div>

        {/* Chèn nhanh Section Header & Cues */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-neutral-500">Chèn đoạn:</span>
          {['Intro', 'Verse 1', 'Chorus', 'Bridge', 'Solo', 'Outro'].map((sec) => (
            <button
              key={sec}
              onClick={() => insertSection(sec)}
              className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-amber-400 rounded text-xs transition-colors"
            >
              +{sec}
            </button>
          ))}

          <span className="text-[11px] text-neutral-500 ml-2">Ghi chú cue:</span>
          <button
            onClick={() => insertCue('Trống dồn từ đây')}
            className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded text-xs border border-amber-500/20"
          >
            +Cue Trống
          </button>
          <button
            onClick={() => insertCue('Solo guitar 8 nhịp')}
            className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded text-xs border border-amber-500/20"
          >
            +Cue Solo
          </button>

          <span className="text-[11px] text-neutral-500 ml-2">Bố cục:</span>
          <button
            onClick={insertColumnBreak}
            className="px-2.5 py-0.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 rounded text-xs border border-blue-500/30 font-semibold flex items-center gap-1"
            title="Chèn lệnh {column_break} để chủ động chuyển phần tiếp theo sang cột 2"
          >
            <Split size={12} />
            <span>+Ngắt cột</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'dual' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full divide-y lg:divide-y-0 lg:divide-x divide-neutral-800">
            {/* Cột trái: Textarea soạn thảo */}
            <div className="flex flex-col h-full p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                  <FileText size={14} className="text-amber-400" />
                  <span>Trình soạn thảo văn bản (Cú pháp: [HợpÂm]LờiBàiHát)</span>
                </span>

                {/* Hợp âm nhanh */}
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-neutral-500">Thêm:</span>
                  {['C', 'G', 'Am', 'F', 'Em', 'Dm'].map((c) => (
                    <button
                      key={c}
                      onClick={() => insertChordToken(c)}
                      className="px-1.5 py-0.5 bg-neutral-800 hover:bg-amber-500/20 hover:text-amber-300 rounded font-mono font-bold text-neutral-300"
                    >
                      [{c}]
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                className="w-full flex-1 min-h-[350px] bg-neutral-900/80 text-neutral-100 font-mono text-sm p-4 rounded-xl border border-neutral-800 focus:border-amber-400/80 focus:outline-none resize-none leading-relaxed"
                placeholder="[Intro]&#10;[C] [G] [Am] [F]&#10;&#10;[Verse 1]&#10;[C]Lời bài [Am]hát bắt đầu từ [F]đây..."
              />

              {/* Ghi chú biểu diễn cho bài */}
              <div className="mt-3">
                <label className="text-xs text-neutral-400 block mb-1">
                  Ghi chú biểu diễn toàn bài (Band Notes):
                </label>
                <input
                  type="text"
                  value={performanceNote}
                  onChange={(e) => setPerformanceNote(e.target.value)}
                  placeholder="VD: Gian tấu pianist đánh trước, ca sĩ vào nhịp 3, outro fade out..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Cột phải: Live Preview Sân khấu */}
            <div className="flex flex-col h-full p-4 overflow-y-auto bg-neutral-950/70">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800 flex-wrap gap-2">
                <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Eye size={15} className="text-emerald-400" />
                  <span>Xem trước thời gian thực</span>
                </span>

                <div className="flex items-center gap-2">
                  {/* Bộ chọn cột xem trước */}
                  <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs">
                    <span className="text-[10px] text-neutral-500 px-1 font-medium">Bố cục:</span>
                    {([1, 2, 'auto'] as const).map((col) => (
                      <button
                        key={String(col)}
                        type="button"
                        onClick={() => setPreviewColumns(col)}
                        className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                          previewColumns === col
                            ? 'bg-amber-500 text-black font-bold shadow-sm'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {col === 'auto' ? 'Auto' : `${col} Cột`}
                      </button>
                    ))}
                  </div>

                  <span className="text-[11px] text-amber-400 font-mono font-medium hidden sm:inline">
                    {uniqueChords.length} hợp âm
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2">
                <ChordSheetViewer
                  song={parsedSong}
                  fontSize="md"
                  showChords={true}
                  columns={previewColumns}
                />
              </div>

              {/* Thanh hiển thị sơ đồ thế bấm các hợp âm có trong bài */}
              {uniqueChords.length > 0 && (
                <div className="mt-4 pt-3 border-t border-neutral-800">
                  <span className="text-xs font-medium text-neutral-400 block mb-2">
                    Sơ đồ hợp âm trong bài:
                  </span>
                  <div className="flex items-center gap-4 overflow-x-auto pb-2">
                    {uniqueChords.slice(0, 8).map((chord) => (
                      <div
                        key={chord}
                        className="bg-neutral-900 p-2 rounded-xl border border-neutral-800 shrink-0"
                      >
                        <ChordDiagram chord={chord} width={80} height={95} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Import Tự Động */}
        {activeTab === 'import' && (
          <div className="p-6 max-w-4xl mx-auto flex flex-col h-full">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                <Wand2 size={20} />
                <span>Nhập nhanh lời & hợp âm từ nguồn khác (Auto-Convert)</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Dán lời bài hát có hợp âm ở dòng riêng phía trên (dạng 2 dòng truyền thống). Hệ thống sẽ
                tự động quét và đóng gói thành cú pháp <code className="text-amber-300">[C]lời</code> chuẩn xác!
              </p>
            </div>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`Dán văn bản dạng 2 dòng vào đây:\n\nC             Am             F            G\nMột ngày nắng gió qua thềm vắng ngắt nơi này\nC             Am             F            G\nTừng lời yêu dấu nay đã xa mãi muôn trùng`}
              className="w-full flex-1 min-h-[300px] bg-neutral-900/90 text-neutral-100 font-mono text-sm p-4 rounded-xl border border-neutral-800 focus:border-amber-400 focus:outline-none resize-none leading-relaxed"
            />

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveTab('dual')}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-sm"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleAutoConvert}
                disabled={!importText.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold rounded-xl shadow-lg transition-all"
              >
                <Sparkles size={16} />
                <span>Chuyển đổi sang chuẩn [Chord]</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tìm kiếm & Nhập bài tự động từ Hợp Âm Chuẩn */}
      <HopAmChuanImporterModal
        isOpen={showHacModal}
        onClose={() => setShowHacModal(false)}
        onImportSong={handleHacImport}
      />
    </div>
  );
};
