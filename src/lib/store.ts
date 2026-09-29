'use client';

import { create } from 'zustand';
import { Song, Setlist, Band, User } from '@/types/database';
import { InstrumentType, ColumnCount } from '@/types/chord';
import { MOCK_SONGS, MOCK_SETLISTS, MOCK_BAND, CURRENT_USER } from './mock-data';
import { parseChordProText } from './chord-engine/parser';

interface BandStore {
  // Dữ liệu
  isHydrated: boolean;
  currentUser: User;
  currentBand: Band;
  songs: Song[];
  setlists: Setlist[];

  // Tuỳ chọn hiển thị sân khấu (Stage Settings)
  stageSettings: {
    fontSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    showChords: boolean;
    columns: ColumnCount;
    instrument: InstrumentType;
    autoScrollSpeed: number;
    theme: 'dark' | 'oled' | 'light';
  };

  // Actions cho Bài hát
  addSong: (songData: Omit<Song, 'id' | 'createdAt' | 'updatedAt' | 'bandId' | 'createdById'>) => Song;
  updateSong: (id: string, updates: Partial<Song>) => void;
  deleteSong: (id: string) => void;
  toggleFavoriteSong: (id: string) => void;
  addComment: (songId: string, content: string) => void;

  // Actions cho Setlist
  addSetlist: (name: string, description?: string, eventDate?: string) => Setlist;
  updateSetlist: (id: string, updates: Partial<Setlist>) => void;
  deleteSetlist: (id: string) => void;
  addSongToSetlist: (setlistId: string, songId: string, keyOverride?: string) => void;
  removeSongFromSetlist: (setlistId: string, songId: string) => void;
  reorderSetlistSongs: (setlistId: string, songIds: string[]) => void;
  updateSetlistItemKey: (setlistId: string, songId: string, keyOverride?: string) => void;

  // Stage Preferences
  updateStageSettings: (settings: Partial<BandStore['stageSettings']>) => void;
  hydrateFromStorage: () => void;
}

const STORAGE_KEY = 'nhac_band_data_v1';

// Lấy state đã lưu từ LocalStorage nếu có
const loadSavedState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load local storage state:', e);
  }
  return null;
};

let lastSyncTime = '';

const saveState = async (state: Partial<BandStore>) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        songs: state.songs,
        setlists: state.setlists,
        stageSettings: state.stageSettings,
      })
    );
  } catch (e) {
    console.error('Failed to save to local storage:', e);
  }

  // Đồng bộ lên máy chủ trung tâm để tất cả thiết bị khác trong ban nhạc cùng nhìn thấy ngay
  try {
    const res = await fetch('/api/band-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        songs: state.songs,
        setlists: state.setlists,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.lastUpdated) {
        lastSyncTime = data.lastUpdated;
      }
    }
  } catch (e) {
    console.warn('Không thể đồng bộ lên máy chủ:', e);
  }
};

export const useBandStore = create<BandStore>((set, get) => {
  return {
    isHydrated: false,
    currentUser: CURRENT_USER,
    currentBand: MOCK_BAND,
    songs: MOCK_SONGS,
    setlists: MOCK_SETLISTS,

    stageSettings: {
      fontSize: 'lg',
      showChords: true,
      columns: 1,
      instrument: 'guitar',
      autoScrollSpeed: 3,
      theme: 'dark',
    },

    hydrateFromStorage: async () => {
      // 1. Nạp nhanh từ localStorage nếu có để tránh giật giao diện
      const saved = loadSavedState();
      if (saved && !get().isHydrated) {
        const rawSongs = saved.songs && saved.songs.length > 0 ? saved.songs : MOCK_SONGS;
        const refreshedSongs = rawSongs.map((s: Song) => ({
          ...s,
          parsedData: s.rawContent ? parseChordProText(s.rawContent) : s.parsedData,
        }));

        set({
          isHydrated: true,
          songs: refreshedSongs,
          setlists: saved.setlists && saved.setlists.length > 0 ? saved.setlists : MOCK_SETLISTS,
          stageSettings: saved.stageSettings ? { ...get().stageSettings, ...saved.stageSettings } : get().stageSettings,
        });
      }

      // 2. Tải dữ liệu mới nhất từ máy chủ (Server Central Storage)
      try {
        const res = await fetch('/api/band-data');
        if (res.ok) {
          const serverData = await res.json();
          // Nếu dữ liệu trên máy chủ không có thay đổi và đã hydrate rồi thì BỎ QUA để không re-render giao diện!
          if (serverData.lastUpdated && serverData.lastUpdated === lastSyncTime && get().isHydrated) {
            return;
          }
          lastSyncTime = serverData.lastUpdated || '';

          if (serverData.songs && serverData.songs.length > 0) {
            let finalSongs = serverData.songs;

            // Nếu máy client này (ví dụ localhost) có bài hát trong localStorage mà trên server chưa có, hợp nhất lên server
            if (saved?.songs && saved.songs.length > 0) {
              const serverIds = new Set(serverData.songs.map((s: Song) => s.id));
              const localExtras = saved.songs.filter((s: Song) => !serverIds.has(s.id));
              if (localExtras.length > 0) {
                finalSongs = [...localExtras, ...serverData.songs];
                fetch('/api/band-data', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ songs: finalSongs, setlists: serverData.setlists || saved.setlists }),
                }).catch(() => {});
              }
            }

            const refreshedSongs = finalSongs.map((s: Song) => ({
              ...s,
              parsedData: s.rawContent ? parseChordProText(s.rawContent) : s.parsedData,
            }));

            set({
              isHydrated: true,
              songs: refreshedSongs,
              setlists: serverData.setlists && serverData.setlists.length > 0 ? serverData.setlists : (saved?.setlists || MOCK_SETLISTS),
            });

            // Ghi đè lại localStorage để các lần sau nạp nhanh
            try {
              localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                  songs: refreshedSongs,
                  setlists: serverData.setlists || get().setlists,
                  stageSettings: get().stageSettings,
                })
              );
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Lỗi đồng bộ dữ liệu từ máy chủ:', err);
      } finally {
        set({ isHydrated: true });
      }
    },

    addSong: (songData) => {
      const now = new Date().toISOString();
      const newSong: Song = {
        ...songData,
        id: `song-${Date.now()}`,
        bandId: get().currentBand.id,
        createdById: get().currentUser.id,
        createdByName: get().currentUser.name,
        createdAt: now,
        updatedAt: now,
        parsedData: parseChordProText(songData.rawContent),
        comments: [],
        versions: [
          {
            id: `ver-${Date.now()}`,
            songId: `song-${Date.now()}`,
            content: songData.rawContent,
            note: 'Bản khởi tạo đầu tiên',
            editedById: get().currentUser.id,
            editedByName: get().currentUser.name,
            createdAt: now,
          },
        ],
      };

      set((state) => {
        const updatedSongs = [newSong, ...state.songs];
        saveState({ songs: updatedSongs, setlists: state.setlists, stageSettings: state.stageSettings });
        return { songs: updatedSongs };
      });

      return newSong;
    },

    updateSong: (id, updates) => {
      set((state) => {
        const updatedSongs = state.songs.map((song) => {
          if (song.id !== id) return song;

          const updatedContent = updates.rawContent ?? song.rawContent;
          const parsedData = updates.rawContent ? parseChordProText(updates.rawContent) : song.parsedData;
          const now = new Date().toISOString();

          // Thêm version history nếu nội dung bài hát thay đổi
          const versions = song.versions ? [...song.versions] : [];
          if (updates.rawContent && updates.rawContent !== song.rawContent) {
            versions.unshift({
              id: `ver-${Date.now()}`,
              songId: song.id,
              content: updates.rawContent,
              note: 'Chỉnh sửa nội dung',
              editedById: state.currentUser.id,
              editedByName: state.currentUser.name,
              createdAt: now,
            });
          }

          return {
            ...song,
            ...updates,
            parsedData,
            versions,
            updatedAt: now,
          };
        });

        // Cập nhật lại các bài hát tương ứng trong setlist nếu có
        const updatedSetlists = state.setlists.map((sl) => ({
          ...sl,
          songs: sl.songs.map((item) => {
            const freshSong = updatedSongs.find((s) => s.id === item.songId);
            return freshSong ? { ...item, song: freshSong } : item;
          }),
        }));

        saveState({ songs: updatedSongs, setlists: updatedSetlists, stageSettings: state.stageSettings });
        return { songs: updatedSongs, setlists: updatedSetlists };
      });
    },

    deleteSong: (id) => {
      set((state) => {
        const updatedSongs = state.songs.filter((s) => s.id !== id);
        const updatedSetlists = state.setlists.map((sl) => ({
          ...sl,
          songs: sl.songs.filter((item) => item.songId !== id),
        }));

        saveState({ songs: updatedSongs, setlists: updatedSetlists, stageSettings: state.stageSettings });
        return { songs: updatedSongs, setlists: updatedSetlists };
      });
    },

    toggleFavoriteSong: (id) => {
      set((state) => {
        const updatedSongs = state.songs.map((song) =>
          song.id === id ? { ...song, isFavorite: !song.isFavorite } : song
        );
        saveState({ songs: updatedSongs, setlists: state.setlists, stageSettings: state.stageSettings });
        return { songs: updatedSongs };
      });
    },

    addComment: (songId, content) => {
      set((state) => {
        const updatedSongs = state.songs.map((song) => {
          if (song.id !== songId) return song;
          const newComment = {
            id: `cmt-${Date.now()}`,
            songId,
            userId: state.currentUser.id,
            userName: state.currentUser.name,
            userAvatar: state.currentUser.image,
            content,
            createdAt: new Date().toISOString(),
          };
          return {
            ...song,
            comments: [...(song.comments || []), newComment],
          };
        });

        saveState({ songs: updatedSongs, setlists: state.setlists, stageSettings: state.stageSettings });
        return { songs: updatedSongs };
      });
    },

    addSetlist: (name, description, eventDate) => {
      const now = new Date().toISOString();
      const newSetlist: Setlist = {
        id: `setlist-${Date.now()}`,
        bandId: get().currentBand.id,
        name,
        description,
        eventDate,
        songs: [],
        createdAt: now,
        updatedAt: now,
      };

      set((state) => {
        const updatedSetlists = [newSetlist, ...state.setlists];
        saveState({ songs: state.songs, setlists: updatedSetlists, stageSettings: state.stageSettings });
        return { setlists: updatedSetlists };
      });

      return newSetlist;
    },

    updateSetlist: (id, updates) => {
      set((state) => {
        const updatedSetlists = state.setlists.map((sl) =>
          sl.id === id ? { ...sl, ...updates, updatedAt: new Date().toISOString() } : sl
        );
        saveState({ songs: state.songs, setlists: updatedSetlists, stageSettings: state.stageSettings });
        return { setlists: updatedSetlists };
      });
    },

    deleteSetlist: (id) => {
      set((state) => {
        const updatedSetlists = state.setlists.filter((sl) => sl.id !== id);
        saveState({ songs: state.songs, setlists: updatedSetlists, stageSettings: state.stageSettings });
        return { setlists: updatedSetlists };
      });
    },

    addSongToSetlist: (setlistId, songId, keyOverride) => {
      set((state) => {
        const targetSong = state.songs.find((s) => s.id === songId);
        if (!targetSong) return state;

        const updatedSetlists = state.setlists.map((sl) => {
          if (sl.id !== setlistId) return sl;
          // Tránh thêm trùng lặp
          if (sl.songs.some((item) => item.songId === songId)) return sl;

          const newItem = {
            id: `sl-item-${Date.now()}`,
            setlistId,
            songId,
            orderIndex: sl.songs.length,
            keyOverride: keyOverride || targetSong.originalKey,
            song: targetSong,
          };

          return {
            ...sl,
            songs: [...sl.songs, newItem],
            updatedAt: new Date().toISOString(),
          };
        });

        saveState({ songs: state.songs, setlists: updatedSetlists, stageSettings: state.stageSettings });
        return { setlists: updatedSetlists };
      });
    },

    removeSongFromSetlist: (setlistId, songId) => {
      set((state) => {
        const updatedSetlists = state.setlists.map((sl) => {
          if (sl.id !== setlistId) return sl;
          const filtered = sl.songs
            .filter((item) => item.songId !== songId)
            .map((item, idx) => ({ ...item, orderIndex: idx }));
          return { ...sl, songs: filtered, updatedAt: new Date().toISOString() };
        });

        saveState({ songs: state.songs, setlists: updatedSetlists, stageSettings: state.stageSettings });
        return { setlists: updatedSetlists };
      });
    },

    reorderSetlistSongs: (setlistId, songIds) => {
      set((state) => {
        const updatedSetlists = state.setlists.map((sl) => {
          if (sl.id !== setlistId) return sl;
          const reordered = songIds
            .map((id, index) => {
              const item = sl.songs.find((s) => s.songId === id);
              return item ? { ...item, orderIndex: index } : null;
            })
            .filter(Boolean) as Setlist['songs'];

          return { ...sl, songs: reordered, updatedAt: new Date().toISOString() };
        });

        saveState({ songs: state.songs, setlists: updatedSetlists, stageSettings: state.stageSettings });
        return { setlists: updatedSetlists };
      });
    },

    updateSetlistItemKey: (setlistId, songId, keyOverride) => {
      set((state) => {
        const updatedSetlists = state.setlists.map((sl) => {
          if (sl.id !== setlistId) return sl;
          const updatedSongs = sl.songs.map((item) =>
            item.songId === songId ? { ...item, keyOverride } : item
          );
          return { ...sl, songs: updatedSongs, updatedAt: new Date().toISOString() };
        });

        saveState({ songs: state.songs, setlists: updatedSetlists, stageSettings: state.stageSettings });
        return { setlists: updatedSetlists };
      });
    },

    updateStageSettings: (settings) => {
      set((state) => {
        const updatedSettings = { ...state.stageSettings, ...settings };
        saveState({ songs: state.songs, setlists: state.setlists, stageSettings: updatedSettings });
        return { stageSettings: updatedSettings };
      });
    },
  };
});
