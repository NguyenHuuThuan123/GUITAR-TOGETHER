'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useBandStore } from '@/lib/store';
import { ChordEditor } from '@/components/editor/ChordEditor';
import { Navbar } from '@/components/layout/Navbar';

export default function NewSongPage() {
  const router = useRouter();
  const { addSong } = useBandStore();

  const handleSave = (songData: any) => {
    const created = addSong(songData);
    router.push(`/songs/${created.id}`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 p-3 md:p-6 max-w-7xl w-full mx-auto">
        <ChordEditor
          onSave={handleSave}
          onCancel={() => router.push('/songs')}
        />
      </main>
    </div>
  );
}
