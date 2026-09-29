import { ParsedSong, SongSection, SongLine, ChordPair } from '@/types/chord';

const SHARP_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_SCALE  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Các giọng thường dùng dấu giáng
const KEYS_PREFERRING_FLATS = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm'];

/**
 * Dịch giọng cho 1 nốt đơn
 */
export function transposeNote(note: string, semitones: number, preferFlat = false): string {
  if (semitones === 0) return note;

  let index = SHARP_SCALE.indexOf(note);
  if (index === -1) index = FLAT_SCALE.indexOf(note);
  if (index === -1) return note;

  const newIndex = ((index + semitones) % 12 + 12) % 12;
  return preferFlat ? FLAT_SCALE[newIndex] : SHARP_SCALE[newIndex];
}

/**
 * Dịch giọng cho hợp âm (bao gồm hợp âm đảo Bass: C/E, G/B, D/F#)
 */
export function transposeChord(chord: string, semitones: number, targetKey?: string): string {
  if (!chord || semitones === 0) return chord;

  const preferFlat = targetKey ? KEYS_PREFERRING_FLATS.includes(targetKey) : chord.includes('b');

  // Kiểm tra slash chord (hợp âm bass, VD: G/B, D/F#)
  if (chord.includes('/')) {
    const [mainChord, bass] = chord.split('/');
    const transposedMain = transposeRoot(mainChord, semitones, preferFlat);
    const transposedBass = transposeRoot(bass, semitones, preferFlat);
    return `${transposedMain}/${transposedBass}`;
  }

  return transposeRoot(chord, semitones, preferFlat);
}

function transposeRoot(chordPart: string, semitones: number, preferFlat: boolean): string {
  const match = chordPart.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return chordPart;

  const [, root, modifier] = match;
  const transposedRoot = transposeNote(root, semitones, preferFlat);
  return `${transposedRoot}${modifier}`;
}

/**
 * Dịch giọng toàn bộ bài hát ở dạng AST
 */
export function transposeParsedSong(parsed: ParsedSong, semitones: number, targetKey?: string): ParsedSong {
  if (semitones === 0) return parsed;

  const transposedSections: SongSection[] = parsed.sections.map((section) => ({
    ...section,
    lines: section.lines.map((line) => ({
      ...line,
      pairs: line.pairs.map((pair) => ({
        ...pair,
        chord: pair.chord ? transposeChord(pair.chord, semitones, targetKey) : null
      }))
    }))
  }));

  return { sections: transposedSections };
}

/**
 * Dịch giọng toàn bộ chuỗi text raw ChordPro
 */
export function transposeRawText(rawText: string, semitones: number, targetKey?: string): string {
  if (semitones === 0) return rawText;

  // Thay thế tất cả các cặp [Chord]
  return rawText.replace(/\[([A-G][b#]?[^\]]*)\]/g, (match, chord) => {
    // Nếu là cue note thì giữ nguyên
    if (chord.toLowerCase().startsWith('cue:') || chord.toLowerCase().startsWith('note:')) {
      return match;
    }
    return `[${transposeChord(chord, semitones, targetKey)}]`;
  });
}
