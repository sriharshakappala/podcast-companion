"use client";

import { UserButton } from "@clerk/nextjs";
import { BottomNav } from "./bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-surface-0/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-on-primary tracking-tight">
          Podcast Companion
        </h1>
        <UserButton
          appearance={{
            elements: { avatarBox: "w-9 h-9" },
          }}
        />
      </header>
      <main className="max-w-2xl mx-auto px-5 py-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
