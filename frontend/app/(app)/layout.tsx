import type { ReactNode } from "react";
import { NavBar } from "@/components/nav-bar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <NavBar />
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
