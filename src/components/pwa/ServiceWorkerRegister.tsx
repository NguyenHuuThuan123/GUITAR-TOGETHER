'use client';

import { useEffect } from 'react';
import { useBandStore } from '@/lib/store';

export function ServiceWorkerRegister() {
  const hydrateFromStorage = useBandStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    // 1. Đồng bộ dữ liệu bài hát từ máy chủ khi vừa mở trang
    hydrateFromStorage();

    // 2. Tự động đồng bộ lại khi người dùng quay lại tab (window focus)
    const handleFocus = () => {
      hydrateFromStorage();
    };
    window.addEventListener('focus', handleFocus);

    // 3. Tự động thăm dò đồng bộ ngầm mỗi 4 giây để dữ liệu bài hát trên mọi thiết bị luôn khớp nhau
    const interval = setInterval(() => {
      hydrateFromStorage();
    }, 4000);

    // 4. Đăng ký Service Worker
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

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [hydrateFromStorage]);

  return null;
}
