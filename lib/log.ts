type Lvl = "debug" | "info" | "warn" | "error";

export const log = (ns: string) => {
  const p = (lvl: Lvl, ...a: unknown[]) =>
    console[lvl === "debug" ? "debug" : lvl](`[sbd:${ns}]`, ...a);
  return {
    debug: (...a: unknown[]) => p("debug", ...a),
    info: (...a: unknown[]) => p("info", ...a),
    warn: (...a: unknown[]) => p("warn", ...a),
    error: (...a: unknown[]) => p("error", ...a),
  };
};
