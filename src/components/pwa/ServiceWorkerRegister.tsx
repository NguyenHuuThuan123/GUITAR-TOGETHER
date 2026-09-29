'use client';

import { useEffect } from 'react';
import { useBandStore } from '@/lib/store';

export function ServiceWorkerRegister() {
  const hydrateFromStorage = useBandStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    // Đồng bộ an toàn dữ liệu từ localStorage sau khi client mount để tránh hydration mismatch
    hydrateFromStorage();

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Band Chord Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('Band Chord Service Worker failed:', err);
        });
    }
  }, [hydrateFromStorage]);

  return null;
}
