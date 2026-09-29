import { transposeChord } from './transposer';

/**
 * Tính toán thế bấm hợp âm khi kẹp Capo
 * Ví dụ: Tông thực tế muốn hát là D, kẹp Capo ngăn 2 -> bấm thế C
 */
export function getChordsWithCapo(chords: string[], capoFret: number): string[] {
  if (capoFret === 0) return chords;
  // Khi kẹp capo ngăn N, thế bấm thực tế trên cần đàn phải lùi N nửa cung
  return chords.map(c => transposeChord(c, -capoFret));
}

/**
 * Gợi ý các vị trí Capo thuận lợi cho Guitar (ưu tiên thế bấm các hợp âm mở: C, G, D, Em, Am)
 */
export function suggestCapoPositions(targetKey: string): { fret: number; playAsKey: string; reason: string }[] {
  const easyGuitarKeys = ['C', 'G', 'D', 'A', 'E', 'Am', 'Em', 'Dm'];
  const suggestions: { fret: number; playAsKey: string; reason: string }[] = [];

  for (let fret = 1; fret <= 7; fret++) {
    const playAsKey = transposeChord(targetKey, -fret);
    if (easyGuitarKeys.includes(playAsKey)) {
      suggestions.push({
        fret,
        playAsKey,
        reason: `Kẹp ngăn ${fret} để bấm ở thế giọng ${playAsKey} (dễ bấm hợp âm mở)`
      });
    }
  }

  return suggestions;
}
