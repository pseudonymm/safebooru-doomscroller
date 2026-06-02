"use client";

import { useEffect } from "react";
import { tickSession } from "@/lib/store/stats";

/** Session tracker — only ticks while tab is visible. */
export const useSession = () => {
  useEffect(() => {
    let last = Date.now();
    const tick = () => {
      if (document.hidden) return;
      const now = Date.now();
      tickSession(now - last);
      last = now;
    };
    const onVis = () => {
      if (!document.hidden) last = Date.now();
    };
    const id = setInterval(tick, 30_000);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
};
