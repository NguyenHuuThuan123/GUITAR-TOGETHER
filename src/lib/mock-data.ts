import { Song, Band, Setlist, User } from '@/types/database';
import { parseChordProText } from './chord-engine/parser';

export const CURRENT_USER: User = {
  id: 'usr-1',
  name: 'Trưởng Band',
  email: 'leader@band.vn',
  image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  role: 'Leader / Guitarist',
};

export const MOCK_BAND: Band = {
  id: 'band-1',
  name: 'The Midnight Echoes',
  description: 'Acoustic & Pop-Rock Band Sài Gòn',
  logoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200',
  inviteCode: 'MIDNIGHT-2026',
  createdAt: '2026-01-15T00:00:00Z',
  members: [
    {
      id: 'bm-1',
      bandId: 'band-1',
      userId: 'usr-1',
      role: 'OWNER',
      joinedAt: '2026-01-15T00:00:00Z',
      user: CURRENT_USER,
    },
    {
      id: 'bm-2',
      bandId: 'band-1',
      userId: 'usr-2',
      role: 'EDITOR',
      joinedAt: '2026-01-16T00:00:00Z',
      user: {
        id: 'usr-2',
        name: 'Hoàng Bass',
        email: 'bass@band.vn',
        role: 'Bassist',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
    },
    {
      id: 'bm-3',
      bandId: 'band-1',
      userId: 'usr-3',
      role: 'EDITOR',
      joinedAt: '2026-01-18T00:00:00Z',
      user: {
        id: 'usr-3',
        name: 'Minh Trống',
        email: 'drum@band.vn',
        role: 'Drummer',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      },
    },
    {
      id: 'bm-4',
      bandId: 'band-1',
      userId: 'usr-4',
      role: 'VIEWER',
      joinedAt: '2026-02-01T00:00:00Z',
      user: {
        id: 'usr-4',
        name: 'Khánh Vocal Khách Mời',
        email: 'guest@band.vn',
        role: 'Guest Singer',
      },
    },
  ],
};

const RAW_SONG_1 = `[Intro]
[C] [G/B] [Am7] [F] [G]
{cue: Guitar acoustic tỉa nhẹ, piano đệm hợp âm rải}

[Verse 1]
[C]Khắp nhân gian này chỉ [G/B]có một nụ cười
Làm cho [Am7]trái tim anh bồi hồi thổn [F]thức từng đêm
[C]Ánh mắt em như mùa thu [G/B]rót ngàn tia nắng
Sưởi ấm [Am7]cho anh qua những ngày lạnh [F]giá...

[Pre-Chorus]
{cue: Bass bắt đầu vào nhịp nhẹ}
[Dm7]Cứ ngỡ như là một [Em7]giấc chiêm bao tuyệt vời
[F]Nắm đôi tay nàng đi [G]đến chân trời xa xôi...

[Chorus]
{cue: Trống đánh beat 4/4 đầy đủ, cả band bùng nổ}
[C]Cầm tay anh đi qua từng góc [G/B]phố thênh thang
Để nghe [Am7]hương thơm tình yêu lan [Em7]tỏa mênh mang
[F]Dẫu cho mai này sông cạn [C/E]đá mòn theo tháng năm
Thì tình [Dm7]anh trao em vẫn luôn vẹn [G]nguyên như thuở đầu!

[Bridge]
{cue: Trống ngắt nghỉ, chỉ còn Piano và Vocal}
[F]Thời gian trôi qua có thể [G]làm phai mờ ký ức
[Em7]Nhưng hình bóng em mãi [Am7]in sâu nơi ngực trái
[Dm7]Hứa cùng anh nhé, ta [G]bên nhau trọn đời...

[Outro]
{cue: Guitar solo nhẹ fade out}
[C] [G/B] [Am7] [F] [C]`;

const RAW_SONG_2 = `[Intro]
[Em] [C] [G] [D]
{cue: Drum snare đếm 1-2-3-4 rồi guitar riff mạnh}

[Verse 1]
[Em]Một ngày trôi qua với bao muộn [C]phiền âu lo
[G]Đường về hôm nay bỗng thấy xa xôi [D]mịt mờ
[Em]Ta đi tìm một khoảng lặng giữa [C]dòng đời vội vã
[G]Bao tiền một mớ bình [D]yên?

[Chorus]
{cue: Cả band đánh dồn dập, bass đánh theo kick drum}
[Em]Tìm lại chính ta sau những [C]vấp ngã cuộc đời
[G]Tìm lại nụ cười rạng rỡ [D]trên môi ngày xưa
[Em]Dù cho bão giông có xô nghiêng [C]bước chân này
[G]Ta vẫn đứng vững bước [D]qua niềm đau!

[Solo]
{cue: Guitar Lead Solo 16 nhịp}
[Em] [C] [G] [D]
[Em] [C] [G] [D]

[Outro]
[Em] [C] [G] [D] [Em]
{cue: Hợp âm Em kết bài crash cymbal vang dội}`;

const RAW_SONG_3 = `[Intro]
[C] [Am] [F] [G]

[Verse 1]
[C]Tháng tư về mang theo làn gió [Am]mát hiền hòa
[F]Em bước qua đời tôi như một giấc [G]mơ thần tiên
[C]Từng lời em nói dối [Am]ngọt ngào đến lạ kỳ
[F]Để tôi mãi ngây ngô [G]chìm đắm trong tin yêu...

[Chorus]
{cue: Dồn trống vào điệp khúc}
[F]Và tôi biết em sẽ [G]không bao giờ trở lại
[Em]Lời nói dối tháng tư [Am]nay hóa thành vết thương sâu
[Dm7]Nhưng cảm ơn em đã [G]cho tôi biết yêu thương một lần
[C]Một lần trọn vẹn...`;

export const MOCK_SONGS: Song[] = [
  {
    id: 'song-1',
    bandId: 'band-1',
    title: 'Nơi Này Có Em (Acoustic Version)',
    artist: 'Sơn Tùng M-TP',
    originalKey: 'C',
    tempoBpm: 105,
    timeSignature: '4/4',
    capo: 0,
    rawContent: RAW_SONG_1,
    parsedData: parseChordProText(RAW_SONG_1),
    tags: ['Acoustic', 'Ballad', 'Pop', 'Show Cà Phê'],
    performanceNote: 'Đoạn Pre-Chorus bass chỉ đi note gốc. Đoạn Bridge pianist solo fill nhẹ.',
    isPublic: true,
    shareSlug: 'noi-nay-co-em-acoustic',
    createdById: 'usr-1',
    createdByName: 'Trưởng Band',
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-02-15T14:30:00Z',
    isFavorite: true,
    comments: [
      {
        id: 'cmt-1',
        songId: 'song-1',
        userId: 'usr-2',
        userName: 'Hoàng Bass',
        content: 'Đoạn Chorus anh em đánh chậm hơn 2 nhịp để ca sĩ phiêu nhé!',
        createdAt: '2026-02-12T09:15:00Z',
      },
      {
        id: 'cmt-2',
        songId: 'song-1',
        userId: 'usr-3',
        userName: 'Minh Trống',
        content: 'Nhớ cue trống ở Bridge, em sẽ gõ rimshot cho êm.',
        createdAt: '2026-02-12T11:40:00Z',
      },
    ],
  },
  {
    id: 'song-2',
    bandId: 'band-1',
    title: 'Tìm Lại Bản Thân',
    artist: 'Microwave / Band Cover',
    originalKey: 'Em',
    tempoBpm: 128,
    timeSignature: '4/4',
    capo: 0,
    rawContent: RAW_SONG_2,
    parsedData: parseChordProText(RAW_SONG_2),
    tags: ['Rock', 'High Energy', 'Điện', 'Chốt Show'],
    performanceNote: 'Bài chốt show, đánh hết năng lượng, đoạn Solo guitar distortion dầy.',
    isPublic: true,
    shareSlug: 'tim-lai-ban-than',
    createdById: 'usr-1',
    createdByName: 'Trưởng Band',
    createdAt: '2026-02-11T11:00:00Z',
    updatedAt: '2026-02-16T16:00:00Z',
    isFavorite: true,
  },
  {
    id: 'song-3',
    bandId: 'band-1',
    title: 'Tháng Tư Là Lời Nói Dối Của Em',
    artist: 'Hà Anh Tuấn',
    originalKey: 'C',
    tempoBpm: 82,
    timeSignature: '4/4',
    capo: 0,
    rawContent: RAW_SONG_3,
    parsedData: parseChordProText(RAW_SONG_3),
    tags: ['Ballad', 'Sâu lắng', 'Mùa mưa'],
    performanceNote: 'Tone nữ hát thì transpose lên +3 (Eb).',
    isPublic: false,
    createdById: 'usr-1',
    createdByName: 'Trưởng Band',
    createdAt: '2026-02-14T08:00:00Z',
    updatedAt: '2026-02-14T08:00:00Z',
    isFavorite: false,
  },
];

export const MOCK_SETLISTS: Setlist[] = [
  {
    id: 'setlist-1',
    bandId: 'band-1',
    name: 'Show Acoustic Thứ 7 - The Vintage Lounge',
    description: 'Đêm nhạc Acoustic 8h tối ngày 20/03. Dự kiến 45 phút.',
    eventDate: '2026-03-20T20:00:00Z',
    createdAt: '2026-02-18T10:00:00Z',
    updatedAt: '2026-02-18T10:00:00Z',
    songs: [
      {
        id: 'sl-song-1',
        setlistId: 'setlist-1',
        songId: 'song-1',
        orderIndex: 0,
        keyOverride: 'D', // Ca sĩ hát tone D (+2)
        notesOverride: 'Kẹp Capo 2 bấm thế C',
        song: MOCK_SONGS[0],
      },
      {
        id: 'sl-song-2',
        setlistId: 'setlist-1',
        songId: 'song-3',
        orderIndex: 1,
        song: MOCK_SONGS[2],
      },
      {
        id: 'sl-song-3',
        setlistId: 'setlist-1',
        songId: 'song-2',
        orderIndex: 2,
        notesOverride: 'Bài này hát chốt phần 1, đánh cháy!',
        song: MOCK_SONGS[1],
      },
    ],
  },
  {
    id: 'setlist-2',
    bandId: 'band-1',
    name: 'Buổi Tập Tuần 42 - Thử Bài Mới',
    description: 'Tập kỹ đoạn chuyển điệp khúc và solo.',
    eventDate: '2026-03-15T18:30:00Z',
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-02-15T09:00:00Z',
    songs: [
      {
        id: 'sl-song-4',
        setlistId: 'setlist-2',
        songId: 'song-2',
        orderIndex: 0,
        song: MOCK_SONGS[1],
      },
    ],
  },
];
