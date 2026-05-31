import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import type { AppView } from "./Sidebar";

export type { AppView };

type Props = {
  view: AppView;
  onView: (v: AppView) => void;
  children: ReactNode;
};

export function AppShell({ view, onView, children }: Props) {
  return (
    <div className="app-shell flex h-screen w-full overflow-hidden bg-black">
      <Sidebar view={view} onView={onView} />
      <main className="main-pane min-h-0 min-w-0 flex-1">{children}</main>
    </div>
  );
}
