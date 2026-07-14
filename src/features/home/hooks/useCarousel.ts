import { useState, useCallback, useEffect, useRef } from "react";
import type { Project } from "@shared/types";

type Direction = "left" | "right";

export function useCarousel(items: Project[], autoplayMs: number) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<Direction>("right");
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useCallback(
    (newIndex: number, dir: Direction) => {
      if (animating) return;
      setDirection(dir);
      setAnimating(true);
      setTimeout(() => {
        setIndex(newIndex);
        setAnimating(false);
      }, 150);
    },
    [animating],
  );

  const prev = useCallback(() => {
    navigate((index - 1 + items.length) % items.length, "left");
  }, [index, items.length, navigate]);

  const next = useCallback(() => {
    navigate((index + 1) % items.length, "right");
  }, [index, items.length, navigate]);

  const goTo = useCallback(
    (i: number) => {
      navigate(i, i > index ? "right" : "left");
    },
    [index, navigate],
  );

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection("right");
      setAnimating(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setAnimating(false);
      }, 150);
    }, autoplayMs);
  }, [items.length, autoplayMs]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const prevWithReset = useCallback(() => {
    prev();
    resetTimer();
  }, [prev, resetTimer]);
  const nextWithReset = useCallback(() => {
    next();
    resetTimer();
  }, [next, resetTimer]);
  const goToWithReset = useCallback(
    (i: number) => {
      goTo(i);
      resetTimer();
    },
    [goTo, resetTimer],
  );

  return {
    current: items[index],
    index,
    direction,
    animating,
    prev: prevWithReset,
    next: nextWithReset,
    goTo: goToWithReset,
    total: items.length,
  };
}
