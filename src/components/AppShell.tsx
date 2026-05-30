import type { ComponentChildren } from "preact";
import { Sidebar } from "./Sidebar";
import type { AppView } from "./Sidebar";

export type { AppView };

type Props = {
  view: AppView;
  onView: (v: AppView) => void;
  children: ComponentChildren;
};

export function AppShell({ view, onView, children }: Props) {
  return (
    <div class="app-shell flex h-screen w-full overflow-hidden bg-black">
      <Sidebar view={view} onView={onView} />
      <main class="main-pane min-h-0 min-w-0 flex-1">{children}</main>
    </div>
  );
}
