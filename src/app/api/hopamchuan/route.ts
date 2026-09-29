import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
};

/**
 * Bóc tách nội dung chi tiết bài hát từ HTML của Hợp Âm Chuẩn
 */
function parseSongHtml(html: string, fallbackUrl: string) {
  // 1. Tên bài hát
  const titleMatch = html.match(/<h1[^>]*id="song-title"[^>]*>[\s\S]*?<span>([^<]+)<\/span>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'Bài hát chưa đặt tên';

  // 2. Tông gốc (Original Key)
  const keyMatch = html.match(/id="display-key"[^>]*data-key="([^"]+)"/i);
  const originalKey = keyMatch ? keyMatch[1].trim() : 'C';

  // 3. Điệu nhạc (Rhythm)
  const rhythmMatch = html.match(/id="display-rhythm"[^>]*>[\s\S]*?(?:Điệu\s+)?([^<]+)<\/span>/i);
  const rhythm = rhythmMatch ? rhythmMatch[1].trim() : '';

  // 4. Ca sĩ / Nghệ sĩ
  const artistMatch = html.match(
    /class="perform-singer-list"[\s\S]*?<a[^>]*class="author-item"[^>]*>([^<]+)<\/a>/i
  );
  const artist = artistMatch ? artistMatch[1].trim() : '';

  // 5. Capo nếu có ghi trong ghi chú
  let capo = 0;
  const capoMatch = html.match(/capo\s*(\d+)/i);
  if (capoMatch) {
    capo = parseInt(capoMatch[1], 10) || 0;
  }

  // 6. Lời bài hát & hợp âm (ChordPro format)
  const lyricMatch = html.match(
    /<div[^>]*id="song-lyric"[^>]*>([\s\S]*?)<div[^>]*id="song-leftover-space"/i
  );

  let rawContent = '';
  if (lyricMatch) {
    const body = lyricMatch[1];
    // Tách theo từng dòng chord_lyric_line
    const lines = body.split(/<div class="chord_lyric_line[^"]*">/gi);
    const parsedLines: string[] = [];

    for (const l of lines) {
      if (!l.trim()) continue;
      const cleanLine = l.split('</div>')[0];

      // Dòng trống
      if (cleanLine.includes('empty_line') || cleanLine.trim() === '&nbsp;') {
        parsedLines.push('');
        continue;
      }

      // Đổi thẻ span hợp âm thành dạng chuẩn [Chord]
      let textLine = cleanLine.replace(
        /<span class="hopamchuan_chord_inline"><i>\[<\/i><span class="hopamchuan_chord">([^<]+)<\/span><i>\]<\/i><\/span>/gi,
        '[$1]'
      );

      // Loại bỏ các thẻ HTML còn sót lại và decode HTML entities
      textLine = textLine
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();

      parsedLines.push(textLine);
    }
    rawContent = parsedLines.join('\n').trim();
  }

  return {
    title,
    artist,
    originalKey,
    capo,
    tempoBpm: 85,
    timeSignature: '4/4',
    performanceNote: rhythm ? `Điệu: ${rhythm}` : '',
    rawContent,
    sourceUrl: fallbackUrl,
  };
}

/**
 * Bóc tách danh sách kết quả tìm kiếm từ HTML Hợp Âm Chuẩn
 */
function parseSearchHtml(html: string) {
  const songItems = html.split('<div class="song-item">');
  const results = [];

  for (let i = 1; i < Math.min(songItems.length, 15); i++) {
    const chunk = songItems[i];

    // Tiêu đề & Link bài hát
    const titleMatch = chunk.match(
      /<a[^>]*href="([^"]+)"[^>]*class="song-title"[^>]*>([\s\S]*?)<\/a>/i
    );
    if (!titleMatch) continue;

    let songUrl = titleMatch[1].trim();
    if (!songUrl.startsWith('http')) {
      songUrl = `https://hopamchuan.com${songUrl.startsWith('/') ? '' : '/'}${songUrl}`;
    }
    songUrl = songUrl.replace(/\?.*$/, ''); // Xoá query param thừa

    const title = titleMatch[2].replace(/<[^>]+>/g, '').trim();

    // Ca sĩ thể hiện
    const artistMatch = chunk.match(
      /class="song-singers"[\s\S]*?<a[^>]*class="author-item"[^>]*>([\s\S]*?)<\/a>/i
    );
    const artist = artistMatch ? artistMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    // Lời xem trước
    const lyricMatch = chunk.match(/<div class="song-preview-lyric"[^>]*>([\s\S]*?)<\/div>/i);
    const previewLyric = lyricMatch ? lyricMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    // Hợp âm chính
    const chords: string[] = [];
    const chordBlock = chunk.match(/<span class="song-chords">([\s\S]*?)<\/span>/i);
    if (chordBlock) {
      const chordMatches = chordBlock[1].matchAll(/<span>([^<]+)<\/span>/gi);
      for (const m of chordMatches) {
        chords.push(m[1].trim());
      }
    }

    results.push({
      title,
      artist,
      url: songUrl,
      previewLyric,
      chords: chords.slice(0, 8),
    });
  }

  return results;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const songUrlParam = searchParams.get('url');

  try {
    // 1. Nếu có tham số url: Lấy chi tiết toàn bộ bài hát từ URL
    if (songUrlParam) {
      let targetUrl = songUrlParam.trim();
      // Nếu người dùng chỉ nhập số id bài hát (ví dụ: 57151)
      if (/^\d+$/.test(targetUrl)) {
        targetUrl = `https://hopamchuan.com/song/${targetUrl}/`;
      } else if (!targetUrl.startsWith('http')) {
        targetUrl = `https://${targetUrl}`;
      }

      const res = await fetch(targetUrl, {
        headers: HEADERS,
        next: { revalidate: 3600 }, // Cache 1 giờ để tiết kiệm băng thông và tăng tốc
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: `Không thể kết nối tới Hợp Âm Chuẩn (${res.status})` },
          { status: res.status }
        );
      }

      const html = await res.text();
      const songData = parseSongHtml(html, targetUrl);

      return NextResponse.json({
        success: true,
        song: songData,
      });
    }

    // 2. Nếu có tham số q: Tìm kiếm danh sách bài hát theo tên
    if (query) {
      const searchUrl = `https://hopamchuan.com/search?q=${encodeURIComponent(query.trim())}&mode=song`;
      const res = await fetch(searchUrl, {
        headers: HEADERS,
        next: { revalidate: 1800 },
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: `Không thể tìm kiếm trên Hợp Âm Chuẩn (${res.status})` },
          { status: res.status }
        );
      }

      const html = await res.text();
      const results = parseSearchHtml(html);

      return NextResponse.json({
        success: true,
        query,
        count: results.length,
        results,
      });
    }

    return NextResponse.json(
      { error: 'Vui lòng cung cấp tham số "q" (tìm kiếm) hoặc "url" (nhập bài)' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error fetching from Hop Am Chuan:', error);
    return NextResponse.json(
      { error: error?.message || 'Lỗi xử lý yêu cầu tới Hợp Âm Chuẩn' },
      { status: 500 }
    );
  }
}
