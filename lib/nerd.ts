const KEY = "sbd-nerd";

export const isNerd = () =>
  typeof localStorage !== "undefined" && localStorage.getItem(KEY) === "1";

export const setNerd = (on: boolean) => localStorage.setItem(KEY, on ? "1" : "0");
