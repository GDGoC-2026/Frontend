"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

const CHAT_MIN_WIDTH = 300;
const CHAT_MAX_WIDTH = 800;
const CHAT_VIEWPORT_GUTTER = 24;
const CHAT_DOCK_BREAKPOINT = 1520;

function clampDrawerWidth(nextWidth: number, viewportWidth: number) {
  const safeViewport = Number.isFinite(viewportWidth) && viewportWidth > 0
    ? viewportWidth
    : 1280;
  const maxForViewport = Math.max(
    240,
    Math.min(CHAT_MAX_WIDTH, safeViewport - CHAT_VIEWPORT_GUTTER),
  );

  return Math.min(maxForViewport, Math.max(CHAT_MIN_WIDTH, nextWidth));
}

interface ChatDrawerContextType {
  open: boolean;
  reserveSpace: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setWidth: Dispatch<SetStateAction<number>>;
  width: number;
}

const ChatDrawerContext = createContext<ChatDrawerContextType | undefined>(
  undefined,
);

export function ChatDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const [widthState, setWidthState] = useState(460);
  const [viewportWidth, setViewportWidth] = useState(1280);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      setWidthState((current) => clampDrawerWidth(current, window.innerWidth));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const setWidth = useCallback<Dispatch<SetStateAction<number>>>(
    (next) => {
      setWidthState((current) => {
        const resolvedWidth =
          typeof next === "function" ? next(current) : next;
        return clampDrawerWidth(resolvedWidth, viewportWidth);
      });
    },
    [viewportWidth],
  );

  const width = useMemo(
    () => clampDrawerWidth(widthState, viewportWidth),
    [viewportWidth, widthState],
  );
  const reserveSpace = open && viewportWidth >= CHAT_DOCK_BREAKPOINT;
  const value = useMemo(
    () => ({ open, reserveSpace, setOpen, setWidth, width }),
    [open, reserveSpace, setWidth, width],
  );

  return (
    <ChatDrawerContext.Provider value={value}>
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
