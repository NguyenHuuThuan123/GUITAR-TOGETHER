'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBandStore } from '@/lib/store';
import { ChordEditor } from '@/components/editor/ChordEditor';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';

export default function EditSongPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { songs, updateSong } = useBandStore();

  const song = songs.find((s) => s.id === resolvedParams.id);

  if (!song) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <p className="text-neutral-400 mb-4">Không tìm thấy bài hát để chỉnh sửa.</p>
          <Link href="/songs" className="px-4 py-2 bg-amber-500 text-neutral-950 font-bold rounded-xl">
            Quay về thư viện
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = (updatedData: any) => {
    updateSong(song.id, updatedData);
    router.push(`/songs/${song.id}`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 p-3 md:p-6 max-w-7xl w-full mx-auto">
        <ChordEditor
          initialSong={song}
          onSave={handleSave}
          onCancel={() => router.push(`/songs/${song.id}`)}
        />
      </main>
    </div>
  );
}
