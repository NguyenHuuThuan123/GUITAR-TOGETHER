'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook sử dụng Screen Wake Lock API để ngăn màn hình thiết bị tắt/sleep khi biểu diễn
 */
export function useWakeLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [wakeLockSentinel, setWakeLockSentinel] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
      setIsSupported(true);
    }
  }, []);

  const requestLock = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const sentinel = await (navigator as any).wakeLock.request('screen');
      setWakeLockSentinel(sentinel);
      setIsLocked(true);

      sentinel.addEventListener('release', () => {
        setIsLocked(false);
        setWakeLockSentinel(null);
      });

      return true;
    } catch (err) {
      console.warn('Wake Lock request error:', err);
      setIsLocked(false);
      return false;
    }
  }, [isSupported]);

  const releaseLock = useCallback(async () => {
    if (wakeLockSentinel) {
      try {
        await wakeLockSentinel.release();
      } catch (err) {
        console.warn('Wake Lock release error:', err);
      }
      setWakeLockSentinel(null);
      setIsLocked(false);
    }
  }, [wakeLockSentinel]);

  const toggleLock = useCallback(() => {
    if (isLocked) {
      releaseLock();
    } else {
      requestLock();
    }
  }, [isLocked, requestLock, releaseLock]);

  // Giải phóng khi unmount
  useEffect(() => {
    return () => {
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, [wakeLockSentinel]);

  return {
    isLocked,
    isSupported,
    requestLock,
    releaseLock,
    toggleLock,
  };
}
