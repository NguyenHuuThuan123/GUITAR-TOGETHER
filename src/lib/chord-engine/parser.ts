import { ParsedSong, SongSection, SongLine, ChordPair, SectionType } from '@/types/chord';

const SECTION_HEADER_REGEX = /^\[(Intro|Verse(?:\s*\d+)?|Pre-Chorus|Chorus(?:\s*\d+)?|Bridge|Solo|Outro|Custom)(?::\s*([^\]]+))?\]/i;
const CUE_REGEX = /^(?:\{|\b)(?:cue|note):\s*([^}\]]+)(?:\}|\b)/i;
const COLUMN_BREAK_REGEX = /^(?:\{|\b)(?:colb|column_break|new_col|chia_cot)(?:\}|\b)|^\[(?:Column\s*Break|Chia\s*Cột)\]/i;
export const CHORD_REGEX = /^[A-G][b#]?(?:maj|min|m|dim|aug|sus|add|M)?[0-9]*(?:[\/\\][A-G][b#]?)?$/;

/**
 * Phân tích văn bản định dạng ChordPro / bracket:
 * Ví dụ:
 * [Intro]
 * [C] [Am] [F] [G]
 * [Verse 1]
 * [C]Một ngày nắng [G/B]gió qua thềm [Am]vắng
 * {cue: Trống đánh nhẹ nhàng}
 * {column_break}
 * [Chorus]
 * [C]Cầm tay anh đi...
 */
export function parseChordProText(text: string): ParsedSong {
  if (!text) return { sections: [] };

  const lines = text.split('\n');
  const sections: SongSection[] = [];

  let currentSection: SongSection = {
    id: 'sec-0',
    type: 'VERSE',
    title: 'Verse',
    lines: []
  };

  let sectionCount = 0;
  let nextSectionIsColumnBreak = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].replace(/\r$/, '');
    const trimmed = rawLine.trim();

    // Dòng trống
    if (!trimmed) {
      if (currentSection.lines.length > 0) {
        currentSection.lines.push({ pairs: [{ chord: null, lyric: ' ' }] });
      }
      continue;
    }

    // 0. Kiểm tra ngắt cột {column_break} hoặc {colb}
    if (trimmed.match(COLUMN_BREAK_REGEX)) {
      nextSectionIsColumnBreak = true;
      if (currentSection.lines.length > 0) {
        currentSection.isColumnBreak = true;
      }
      continue;
    }

    // Bỏ qua dòng metadata dạo đầu như "Capo1: F", "Tone: E", "Điệu: Ballad"
    // để tránh tạo một section "VERSE" trống vô nghĩa ở đầu bài
    if (sectionCount === 0 && trimmed.match(/^(?:capo|tone|điệu|tempo|bpm|key|nhịp)\s*\d*[:\s]/i)) {
      continue;
    }

    // 1. Kiểm tra Section Header dạng có ngoặc [Intro], [Chorus 1], [Verse 2]
    const sectionMatch = trimmed.match(SECTION_HEADER_REGEX);
    // Hoặc Section Header dạng tự do không ngoặc: VER 1, Intro:, Điệp khúc:, Chorus:, Dk2, DK 2, ĐK:
    const unbracketedMatch = sectionMatch
      ? null
      : trimmed.match(/^(Intro|Verse(?:\s*\d+)?|VER(?:\s*\d+)?|Pre-Chorus|Pre|Chorus(?:\s*\d+)?|Bridge|Solo|Outro|[ĐD]K(?:\s*\d+)?|Điệp\s*khúc(?:\s*\d+)?|Đoạn\s*\d+|Coda|Giang\s*tấu)(?::|\s+-|\s*$)(.*)$/i);

    if (sectionMatch || unbracketedMatch) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }

      const matchedName = sectionMatch ? sectionMatch[1] : (unbracketedMatch ? unbracketedMatch[1] : 'Verse');
      const rawType = matchedName.toUpperCase().replace(/\s+/g, '_');
      let type: SectionType = 'CUSTOM';
      if (rawType.startsWith('INTRO')) type = 'INTRO';
      else if (rawType.startsWith('VERSE') || rawType.startsWith('VER')) type = 'VERSE';
      else if (rawType.startsWith('PRE_CHORUS') || rawType === 'PRE') type = 'PRE_CHORUS';
      else if (rawType.startsWith('CHORUS') || rawType.startsWith('ĐK') || rawType.startsWith('DK') || rawType.startsWith('ĐIỆP')) type = 'CHORUS';
      else if (rawType.startsWith('BRIDGE')) type = 'BRIDGE';
      else if (rawType.startsWith('SOLO')) type = 'SOLO';
      else if (rawType.startsWith('OUTRO')) type = 'OUTRO';

      const customTitle = sectionMatch
        ? (sectionMatch[2] ? sectionMatch[2].trim() : sectionMatch[1])
        : (unbracketedMatch ? unbracketedMatch[1] : 'Phần');
      sectionCount++;

      currentSection = {
        id: `sec-${sectionCount}`,
        type,
        title: customTitle,
        lines: [],
        isColumnBreak: nextSectionIsColumnBreak
      };
      nextSectionIsColumnBreak = false;

      // Nếu dòng tiêu đề tự do có chứa lời ngay phía sau (VD: "Intro: Mình xa thành...")
      if (unbracketedMatch && unbracketedMatch[2]?.trim()) {
        const remainingLyrics = unbracketedMatch[2].trim();
        const parsedLine = parseLineToPairs(remainingLyrics);
        currentSection.lines.push(parsedLine);
      }
      continue;
    }

    // 2. Kiểm tra Cue / Ghi chú nhạc công (VD: {cue: Trống dồn từ đây})
    const cueMatch = trimmed.match(CUE_REGEX);
    if (cueMatch) {
      currentSection.lines.push({
        pairs: [],
        cueNote: cueMatch[1].trim()
      });
      continue;
    }

    // 3. Parse dòng thông thường chứa hợp âm & lời
    const parsedLine = parseLineToPairs(rawLine);
    currentSection.lines.push(parsedLine);
  }

  if (currentSection.lines.length > 0) {
    sections.push(currentSection);
  }

  // Đảm bảo có ít nhất 1 section
  if (sections.length === 0) {
    sections.push({
      id: 'sec-default',
      type: 'VERSE',
      title: 'Phần 1',
      lines: []
    });
  }

  return { sections };
}

/**
 * Tách một dòng thành các cặp ChordPair [{ chord, lyric }]
 * Đảm bảo khi hiển thị, hợp âm luôn dính chặt với từ tương ứng, không bị lệch khi co giãn màn hình.
 */
export function parseLineToPairs(line: string): SongLine {
  const pairs: ChordPair[] = [];
  
  // Tách theo regex ngoặc vuông [Chord]
  const tokens = line.split(/(\[[^\]]+\])/g);
  let pendingChord: string | null = null;

  for (const token of tokens) {
    if (!token) continue;

    if (token.startsWith('[') && token.endsWith(']')) {
      const inside = token.slice(1, -1).trim();
      
      // Nếu là cue nội dòng: [cue: trống vào]
      if (inside.toLowerCase().startsWith('cue:') || inside.toLowerCase().startsWith('note:')) {
        const cueContent = inside.replace(/^(?:cue|note):\s*/i, '');
        return { pairs, cueNote: cueContent };
      }

      if (pendingChord) {
        // Hai hợp âm liên tiếp: [C][Am] hoặc [C] [G]
        pairs.push({ chord: pendingChord, lyric: '' });
      }
      pendingChord = inside;
    } else {
      // Phần lời bài hát đi liền sau hợp âm
      pairs.push({
        chord: pendingChord,
        lyric: token
      });
      pendingChord = null;
    }
  }

  // Hợp âm ở cuối dòng không có lời
  if (pendingChord) {
    pairs.push({ chord: pendingChord, lyric: '' });
  }

  return { pairs };
}

/**
 * Trích xuất danh sách tất cả hợp âm duy nhất có trong bài hát
 */
export function extractUniqueChords(parsed: ParsedSong): string[] {
  const chords = new Set<string>();
  for (const section of parsed.sections) {
    for (const line of section.lines) {
      for (const pair of line.pairs) {
        if (pair.chord) {
          chords.add(pair.chord.trim());
        }
      }
    }
  }
  return Array.from(chords);
}
