import { useState, useCallback, useEffect } from "react";
import type { Step } from "../types";

export function useStepTransition(initial: Step) {
  const [step, setStepRaw] = useState<Step>(initial);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const goTo = useCallback((next: Step) => {
    setFading(true);
    setVisible(false);
    setTimeout(() => {
      setStepRaw(next);
      setFading(false);
      setTimeout(() => setVisible(true), 30);
    }, 280);
  }, []);

  return { step, visible, fading, goTo };
}
