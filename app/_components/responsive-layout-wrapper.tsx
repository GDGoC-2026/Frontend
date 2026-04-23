"use client";

import { useChatDrawerState } from "@/app/_components/chat-drawer-context";

export function ResponsiveLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { reserveSpace, width } = useChatDrawerState();

  return (
    <main
      className="h-[100dvh] min-w-0 max-w-full overflow-x-hidden overflow-y-auto transition-[width] duration-200"
      style={{
        width: reserveSpace ? `max(0px, calc(100% - ${width}px))` : "100%",
      }}
    >
      {children}
    </main>
  );
}
