"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { formatClock } from "@/lib/format";
import { restEndingIn, useNow } from "@/lib/use-now";

const ease = [0.22, 1, 0.36, 1] as const;

export type RestState = { endsAt: number; total: number } | null;

function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    osc.onended = () => void ctx.close();
  } catch {
    // Audio can be blocked until the user interacts with the page.
  }
  navigator.vibrate?.([120, 80, 120]);
}

export function RestTimer({
  rest,
  onChange,
}: {
  rest: RestState;
  onChange: (rest: RestState) => void;
}) {
  const now = useNow();
  const remaining = !rest ? 0 : now === 0 ? rest.total : Math.ceil((rest.endsAt - now) / 1000);

  useEffect(() => {
    if (rest && remaining <= 0) {
      beep();
      onChange(null);
    }
  }, [rest, remaining, onChange]);

  const adjust = (delta: number) => {
    if (!rest) return;
    const floor = restEndingIn(1).endsAt;
    onChange({
      endsAt: Math.max(floor, rest.endsAt + delta * 1000),
      total: Math.max(rest.total + delta, 1),
    });
  };

  const progress = rest ? Math.min(1, Math.max(0, remaining / rest.total)) : 0;

  return (
    <AnimatePresence>
      {rest ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.225, ease }}
          className="fixed inset-x-0 bottom-0 z-40 px-5 pb-5 sm:px-8"
        >
          <div className="mx-auto flex max-w-page flex-col gap-3 rounded-xl border bg-card p-3 shadow-lg/5 squircle">
            <div className="h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-[width] duration-300 ease-linear"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-[13px] text-muted-foreground">Descanso</span>
                <span className="font-mono text-lg tabular-nums">
                  {formatClock(Math.max(0, remaining))}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" className="squircle" onClick={() => adjust(-15)}>
                  −15
                </Button>
                <Button variant="outline" size="sm" className="squircle" onClick={() => adjust(15)}>
                  +15
                </Button>
                <Button size="sm" className="squircle" onClick={() => onChange(null)}>
                  Pular
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
