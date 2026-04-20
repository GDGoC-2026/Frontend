"use client";

import { useChatDrawerState } from "@/app/_components/chat-drawer-context";

export function ResponsiveLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { open, width } = useChatDrawerState();

  return (
    <main
      className="h-full overflow-auto transition-all duration-200"
      style={{
        width: open ? `calc(100% - ${width}px)` : "100%",
      }}
    >
      {children}
    </main>
  );
}
