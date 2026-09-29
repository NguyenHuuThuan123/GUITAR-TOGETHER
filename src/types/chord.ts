export type SectionType =
  | 'INTRO'
  | 'VERSE'
  | 'PRE_CHORUS'
  | 'CHORUS'
  | 'BRIDGE'
  | 'SOLO'
  | 'OUTRO'
  | 'CUSTOM';

export interface ChordPair {
  chord: string | null; // Hợp âm, ví dụ: "Am", "F#m7b5", hoặc null nếu từ chỉ có lời
  lyric: string;        // Âm tiết/từ đi kèm với hợp âm
}

export interface SongLine {
  pairs: ChordPair[];
  cueNote?: string;     // Ghi chú sân khấu cho dòng này: {cue: Trống dồn}
}

export type ColumnCount = 1 | 2 | 3 | 'auto';

export interface SongSection {
  id: string;
  type: SectionType;
  title: string;        // "Verse 1", "Điệp khúc", "Solo Guitar"
  lines: SongLine[];
  isColumnBreak?: boolean; // Đánh dấu ngắt sang cột mới (ChordPro {colb})
}

export interface ParsedSong {
  sections: SongSection[];
}

export type InstrumentType = 'guitar' | 'ukulele' | 'piano';

export interface ChordFingering {
  frets: number[];       // 6 dây guitar hoặc 4 dây ukulele (-1 nếu mute 'x', 0 nếu buông 'o')
  fingers?: number[];    // Ngón bấm tương ứng (1, 2, 3, 4)
  barres?: number[];     // Ngón chặn barre
  baseFret?: number;     // Vị trí ngăn bắt đầu nếu hợp âm ở thế bấm cao
}

export interface ChordDefinition {
  chord: string;
  guitar: ChordFingering;
  ukulele: ChordFingering;
  pianoNotes?: string[]; // Các nốt cấu thành hợp âm trên phím đàn
}
