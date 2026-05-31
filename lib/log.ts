type Lvl = "debug" | "info" | "warn" | "error";

const dev = process.env.NODE_ENV !== "production";
const forced =
  typeof localStorage !== "undefined" && localStorage.getItem("sbd-log") === "1";

const on = (lvl: Lvl) =>
  lvl === "error" || lvl === "warn" || dev || forced || lvl === "info";

export const log = (ns: string) => {
  const p = (lvl: Lvl, ...a: unknown[]) =>
    on(lvl) && console[lvl === "debug" ? "debug" : lvl](`[sbd:${ns}]`, ...a);
  return {
    debug: (...a: unknown[]) => p("debug", ...a),
    info: (...a: unknown[]) => p("info", ...a),
    warn: (...a: unknown[]) => p("warn", ...a),
    error: (...a: unknown[]) => p("error", ...a),
  };
};
