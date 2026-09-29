'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface AutoScrollOptions {
  bpm?: number;
  initialSpeed?: number; // 1 (rất chậm) đến 10 (nhanh)
}

export function useAutoScroll({ bpm = 90, initialSpeed = 3 }: AutoScrollOptions = {}) {
  const [isScrolling, setIsScrolling] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const scrollStep = useCallback(
    (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastTimeRef.current;

      if (elapsed > 16) {
        // Tốc độ di chuyển tính theo pixels
        // speed 1 = ~12 px/sec, speed 5 = ~35 px/sec, speed 10 = ~90 px/sec
        const pixelsPerMs = (speed * 0.0075);
        const delta = pixelsPerMs * elapsed;

        window.scrollBy({ top: delta, behavior: 'auto' });
        lastTimeRef.current = timestamp;
      }

      // Kiểm tra nếu đã chạm đáy trang thì dừng
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5;

      if (!isAtBottom) {
        animationFrameRef.current = requestAnimationFrame(scrollStep);
      } else {
        setIsScrolling(false);
        lastTimeRef.current = null;
      }
    },
    [speed]
  );

  useEffect(() => {
    if (isScrolling) {
      lastTimeRef.current = null;
      animationFrameRef.current = requestAnimationFrame(scrollStep);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimeRef.current = null;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScrolling, scrollStep]);

  const toggleScroll = useCallback(() => {
    setIsScrolling((prev) => !prev);
  }, []);

  const startScroll = useCallback(() => {
    setIsScrolling(true);
  }, []);

  const stopScroll = useCallback(() => {
    setIsScrolling(false);
  }, []);

  return {
    isScrolling,
    speed,
    setSpeed,
    toggleScroll,
    startScroll,
    stopScroll,
  };
}
