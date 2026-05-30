import { useEffect } from "preact/hooks";
import { tickSession } from "../lib/store/stats";

export const useSession = () => {
  useEffect(() => {
    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      tickSession(now - last);
      last = now;
    }, 30_000);
    return () => clearInterval(id);
  }, []);
};
