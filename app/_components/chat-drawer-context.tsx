"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ChatDrawerContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  width: number;
  setWidth: (width: number) => void;
}

const ChatDrawerContext = createContext<ChatDrawerContextType | undefined>(
  undefined,
);

export function ChatDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const [width, setWidth] = useState(460);

  return (
    <ChatDrawerContext.Provider value={{ open, setOpen, width, setWidth }}>
      {children}
    </ChatDrawerContext.Provider>
  );
}

export function useChatDrawerState() {
  const context = useContext(ChatDrawerContext);
  if (!context) {
    throw new Error(
      "useChatDrawerState must be used within ChatDrawerProvider",
    );
  }
  return context;
}
