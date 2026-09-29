const CHORD_TOKEN_REGEX = /\b([A-G][b#]?(?:maj|min|m|dim|aug|sus|add|M)?[0-9]*(?:[\/\\][A-G][b#]?)?)\b/g;

/**
 * Kiểm tra xem một dòng có phải là dòng chứa toàn/chủ yếu là hợp âm hay không
 */
export function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Nếu dòng bắt đầu bằng section tag hoặc cue thì không phải chord line
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return false;
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return false;

  const words = trimmed.split(/\s+/);
  const chordMatches = line.match(CHORD_TOKEN_REGEX) || [];

  if (words.length === 0) return false;

  // Nếu ít nhất 70% từ trên dòng là hợp âm hợp lệ -> xem như dòng hợp âm
  return chordMatches.length / words.length >= 0.65;
}

/**
 * Chuyển đổi văn bản 2 dòng truyền thống:
 * Dòng 1: C               Am          F           G
 * Dòng 2: Một ngày nắng gió qua thềm vắng ngắt nơi này
 * Thành định dạng chuẩn:
 * [C]Một ngày nắng [Am]gió qua thềm [F]vắng ngắt nơi [G]này
 */
export function convertTwoLineToBracket(input: string): string {
  const lines = input.split('\n');
  const output: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];
    const nextLine = lines[i + 1];

    if (isChordLine(currentLine) && nextLine !== undefined && !isChordLine(nextLine)) {
      // Tìm vị trí cột của từng hợp âm trên currentLine
      const chords: { col: number; chord: string }[] = [];
      let match: RegExpExecArray | null;
      CHORD_TOKEN_REGEX.lastIndex = 0;

      while ((match = CHORD_TOKEN_REGEX.exec(currentLine)) !== null) {
        chords.push({
          col: match.index,
          chord: match[1]
        });
      }

      // Nối hợp âm vào đúng vị trí ký tự của dòng lời bên dưới
      let merged = '';
      let lastIndex = 0;

      for (const { col, chord } of chords) {
        if (col < nextLine.length) {
          // Lấy phần lời trước vị trí hợp âm
          merged += nextLine.slice(lastIndex, col);
          merged += `[${chord}]`;
          lastIndex = col;
        } else {
          // Nếu hợp âm nằm vượt quá độ dài dòng lời (thường là hợp âm kết dòng)
          if (lastIndex < nextLine.length) {
            merged += nextLine.slice(lastIndex);
            lastIndex = nextLine.length;
          }
          merged += ` [${chord}]`;
        }
      }

      // Phần lời còn lại sau hợp âm cuối cùng
      if (lastIndex < nextLine.length) {
        merged += nextLine.slice(lastIndex);
      }

      output.push(merged);
      i++; // Bỏ qua nextLine vì đã được gộp
    } else {
      // Giữ nguyên các dòng khác (tiêu đề, dòng trống, hoặc đã có sẵn [Chord])
      output.push(currentLine);
    }
  }

  return output.join('\n');
}
