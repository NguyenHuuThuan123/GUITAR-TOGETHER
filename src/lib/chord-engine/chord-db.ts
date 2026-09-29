import { ChordDefinition } from '@/types/chord';

/**
 * Thư viện thế bấm hợp âm cho Guitar và Ukulele
 * frets: mảng các ngăn bấm từ dây trầm nhất đến dây cao nhất
 * -1 = x (không gảy / mute)
 *  0 = o (dây buông / open)
 *  1, 2, 3, 4, 5... = ngăn bấm tương ứng
 */
export const CHORD_DATABASE: Record<string, ChordDefinition> = {
  // C
  'C': {
    chord: 'C',
    guitar: { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], baseFret: 1 },
    ukulele: { frets: [0, 0, 0, 3], fingers: [0, 0, 0, 3], baseFret: 1 },
    pianoNotes: ['C4', 'E4', 'G4']
  },
  'Cm': {
    chord: 'Cm',
    guitar: { frets: [-1, 3, 5, 5, 4, 3], barres: [3], baseFret: 3 },
    ukulele: { frets: [0, 3, 3, 3], barres: [3], baseFret: 1 },
    pianoNotes: ['C4', 'Eb4', 'G4']
  },
  'C7': {
    chord: 'C7',
    guitar: { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], baseFret: 1 },
    ukulele: { frets: [0, 0, 0, 1], fingers: [0, 0, 0, 1], baseFret: 1 },
    pianoNotes: ['C4', 'E4', 'G4', 'Bb4']
  },
  'Cmaj7': {
    chord: 'Cmaj7',
    guitar: { frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], baseFret: 1 },
    ukulele: { frets: [0, 0, 0, 2], fingers: [0, 0, 0, 2], baseFret: 1 },
    pianoNotes: ['C4', 'E4', 'G4', 'B4']
  },

  // D
  'D': {
    chord: 'D',
    guitar: { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], baseFret: 1 },
    ukulele: { frets: [2, 2, 2, 0], barres: [2], baseFret: 1 },
    pianoNotes: ['D4', 'F#4', 'A4']
  },
  'Dm': {
    chord: 'Dm',
    guitar: { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], baseFret: 1 },
    ukulele: { frets: [2, 2, 1, 0], fingers: [2, 3, 1, 0], baseFret: 1 },
    pianoNotes: ['D4', 'F4', 'A4']
  },
  'D7': {
    chord: 'D7',
    guitar: { frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], baseFret: 1 },
    ukulele: { frets: [2, 0, 2, 0], fingers: [2, 0, 1, 0], baseFret: 1 },
    pianoNotes: ['D4', 'F#4', 'A4', 'C5']
  },

  // E
  'E': {
    chord: 'E',
    guitar: { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], baseFret: 1 },
    ukulele: { frets: [4, 4, 4, 2], barres: [4], baseFret: 1 },
    pianoNotes: ['E4', 'G#4', 'B4']
  },
  'Em': {
    chord: 'Em',
    guitar: { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], baseFret: 1 },
    ukulele: { frets: [0, 4, 3, 2], fingers: [0, 3, 2, 1], baseFret: 1 },
    pianoNotes: ['E4', 'G4', 'B4']
  },
  'E7': {
    chord: 'E7',
    guitar: { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], baseFret: 1 },
    ukulele: { frets: [1, 2, 0, 2], fingers: [1, 2, 0, 3], baseFret: 1 },
    pianoNotes: ['E4', 'G#4', 'B4', 'D5']
  },

  // F
  'F': {
    chord: 'F',
    guitar: { frets: [1, 3, 3, 2, 1, 1], barres: [1], baseFret: 1 },
    ukulele: { frets: [2, 0, 1, 0], fingers: [2, 0, 1, 0], baseFret: 1 },
    pianoNotes: ['F4', 'A4', 'C5']
  },
  'Fm': {
    chord: 'Fm',
    guitar: { frets: [1, 3, 3, 1, 1, 1], barres: [1], baseFret: 1 },
    ukulele: { frets: [1, 0, 1, 3], fingers: [1, 0, 2, 4], baseFret: 1 },
    pianoNotes: ['F4', 'Ab4', 'C5']
  },
  'F#m': {
    chord: 'F#m',
    guitar: { frets: [2, 4, 4, 2, 2, 2], barres: [2], baseFret: 2 },
    ukulele: { frets: [2, 1, 2, 0], fingers: [2, 1, 3, 0], baseFret: 1 },
    pianoNotes: ['F#4', 'A4', 'C#5']
  },

  // G
  'G': {
    chord: 'G',
    guitar: { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], baseFret: 1 },
    ukulele: { frets: [0, 2, 3, 2], fingers: [0, 1, 3, 2], baseFret: 1 },
    pianoNotes: ['G4', 'B4', 'D5']
  },
  'Gm': {
    chord: 'Gm',
    guitar: { frets: [3, 5, 5, 3, 3, 3], barres: [3], baseFret: 3 },
    ukulele: { frets: [0, 2, 3, 1], fingers: [0, 2, 3, 1], baseFret: 1 },
    pianoNotes: ['G4', 'Bb4', 'D5']
  },
  'G7': {
    chord: 'G7',
    guitar: { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], baseFret: 1 },
    ukulele: { frets: [0, 2, 1, 2], fingers: [0, 2, 1, 3], baseFret: 1 },
    pianoNotes: ['G4', 'B4', 'D5', 'F5']
  },
  'G/B': {
    chord: 'G/B',
    guitar: { frets: [-1, 2, 0, 0, 0, 3], fingers: [0, 1, 0, 0, 0, 3], baseFret: 1 },
    ukulele: { frets: [0, 2, 3, 2], fingers: [0, 1, 3, 2], baseFret: 1 },
    pianoNotes: ['B3', 'D4', 'G4']
  },

  // A
  'A': {
    chord: 'A',
    guitar: { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], baseFret: 1 },
    ukulele: { frets: [2, 1, 0, 0], fingers: [2, 1, 0, 0], baseFret: 1 },
    pianoNotes: ['A4', 'C#5', 'E5']
  },
  'Am': {
    chord: 'Am',
    guitar: { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], baseFret: 1 },
    ukulele: { frets: [2, 0, 0, 0], fingers: [1, 0, 0, 0], baseFret: 1 },
    pianoNotes: ['A4', 'C5', 'E5']
  },
  'A7': {
    chord: 'A7',
    guitar: { frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0], baseFret: 1 },
    ukulele: { frets: [0, 1, 0, 0], fingers: [0, 1, 0, 0], baseFret: 1 },
    pianoNotes: ['A4', 'C#5', 'E5', 'G5']
  },

  // B
  'B': {
    chord: 'B',
    guitar: { frets: [-1, 2, 4, 4, 4, 2], barres: [2], baseFret: 2 },
    ukulele: { frets: [4, 3, 2, 2], barres: [2], baseFret: 1 },
    pianoNotes: ['B4', 'D#5', 'F#5']
  },
  'Bm': {
    chord: 'Bm',
    guitar: { frets: [-1, 2, 4, 4, 3, 2], barres: [2], baseFret: 2 },
    ukulele: { frets: [4, 2, 2, 2], barres: [2], baseFret: 1 },
    pianoNotes: ['B4', 'D5', 'F#5']
  },
  'B7': {
    chord: 'B7',
    guitar: { frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4], baseFret: 1 },
    ukulele: { frets: [2, 3, 2, 2], barres: [2], baseFret: 1 },
    pianoNotes: ['B4', 'D#5', 'F#5', 'A5']
  },

  // Bb
  'Bb': {
    chord: 'Bb',
    guitar: { frets: [-1, 1, 3, 3, 3, 1], barres: [1], baseFret: 1 },
    ukulele: { frets: [3, 2, 1, 1], barres: [1], baseFret: 1 },
    pianoNotes: ['Bb4', 'D5', 'F5']
  },
  'Bbm': {
    chord: 'Bbm',
    guitar: { frets: [-1, 1, 3, 3, 2, 1], barres: [1], baseFret: 1 },
    ukulele: { frets: [3, 1, 1, 1], barres: [1], baseFret: 1 },
    pianoNotes: ['Bb4', 'Db5', 'F5']
  }
};

/**
 * Tìm kiếm thế bấm hợp âm từ cơ sở dữ liệu
 */
export function getChordDefinition(chordName: string): ChordDefinition | null {
  const clean = chordName.trim();
  if (CHORD_DATABASE[clean]) return CHORD_DATABASE[clean];

  // Thử bỏ phần bass nếu là slash chord (VD: C/E -> C)
  if (clean.includes('/')) {
    const root = clean.split('/')[0];
    if (CHORD_DATABASE[root]) return CHORD_DATABASE[root];
  }

  return null;
}
