import { ParsedSong } from './chord';

export type BandRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
}

export interface BandMember {
  id: string;
  bandId: string;
  userId: string;
  role: BandRole;
  joinedAt: string;
  user: User;
}

export interface Band {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  inviteCode: string;
  members: BandMember[];
  songsCount?: number;
  setlistsCount?: number;
  createdAt: string;
}

export interface SongVersion {
  id: string;
  songId: string;
  content: string;
  note?: string;
  editedById: string;
  editedByName?: string;
  createdAt: string;
}

export interface SongComment {
  id: string;
  songId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Song {
  id: string;
  bandId: string;
  title: string;
  artist?: string;
  originalKey: string;     // VD: "C", "Am", "G", "F#m"
  tempoBpm?: number;        // Tempo BPM
  timeSignature?: string;   // "4/4", "3/4", "6/8"
  capo?: number;            // Vị trí Capo
  rawContent: string;       // Nội dung thô theo định dạng [Chord]lyric
  parsedData?: ParsedSong;  // Dữ liệu đã parse
  tags: string[];           // ["Ballad", "Acoustic", "Rock", ...]
  performanceNote?: string; // Ghi chú biểu diễn cho cả bài
  isPublic?: boolean;
  shareSlug?: string;
  createdById: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  comments?: SongComment[];
  versions?: SongVersion[];
}

export interface SetlistSongItem {
  id: string;
  setlistId: string;
  songId: string;
  orderIndex: number;
  keyOverride?: string;
  capoOverride?: number;
  notesOverride?: string;
  song: Song;
}

export interface Setlist {
  id: string;
  bandId: string;
  name: string;
  description?: string;
  eventDate?: string;
  songs: SetlistSongItem[];
  createdAt: string;
  updatedAt: string;
}
