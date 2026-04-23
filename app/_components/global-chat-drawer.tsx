"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/app/_components/theme-provider";
import { useChatDrawerState } from "@/app/_components/chat-drawer-context";
import { cn } from "@/app/_components/ui-kit/shared";
import { useBackendAskChatbotMutation } from "@/hooks/use-backend-api";

type ChatRole = "assistant" | "user";

type ChatMessage = {
  id: string;
  mode?: string;
  role: ChatRole;
  text: string;
};

const INITIAL_MESSAGE: ChatMessage = {
  id: "assistant-welcome",
  role: "assistant",
  text: "Hi, I am Mixi Bot. Ask anything about your lessons or practice tasks.",
};

function makeMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function GlobalChatDrawer() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const { open, setOpen, width, setWidth } = useChatDrawerState();
  const askMutation = useBackendAskChatbotMutation();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const resizeRef = useRef<HTMLDivElement | null>(null);

  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [isResizing, setIsResizing] = useState(false);

  // Keyboard shortcut for toggle
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setOpen(!open);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Resize logic
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - window.innerWidth;
      const newWidth = Math.max(300, Math.min(800, -delta));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    if (!scrollContainerRef.current) {
      return;
    }

    scrollContainerRef.current.scrollTop =
      scrollContainerRef.current.scrollHeight;
  }, [messages, askMutation.isPending]);

  async function handleSendMessage() {
    const trimmedMessage = draft.trim();

    if (!trimmedMessage || askMutation.isPending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: makeMessageId(),
      role: "user",
      text: trimmedMessage,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");

    try {
      const response = await askMutation.mutateAsync({
        message: trimmedMessage,
      });

      setMessages((current) => [
        ...current,
        {
          id: makeMessageId(),
          mode: response.mode,
          role: "assistant",
          text: response.reply,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: makeMessageId(),
          role: "assistant",
          text:
            error instanceof Error
              ? error.message
              : "Unable to connect to Mixi Bot right now.",
        },
      ]);
    }
  }

  function handleResetConversation() {
    setMessages([INITIAL_MESSAGE]);
    setDraft("");
  }

  return (
    <>
      {open ? (
        <section
          className={cn(
            "fixed right-0 top-0 z-[55] flex h-screen flex-col border-l shadow-2xl transition-all",
            dark
              ? "border-[#262626] bg-[#0e0e0e]"
              : "border-[#c6d2c4] bg-[#eef4ec]",
          )}
          style={{ width: `${width}px` }}
        >
          {/* Resize handle - left edge */}
          <div
            ref={resizeRef}
            className={cn(
              "absolute left-0 top-0 w-1 h-full cursor-col-resize transition-colors",
              dark
                ? "bg-[#262626] hover:bg-[#69daff]"
                : "bg-[#c6d2c4] hover:bg-[#8cb6c6]",
              isResizing && (dark ? "bg-[#69daff]" : "bg-[#8cb6c6]"),
            )}
            onMouseDown={() => setIsResizing(true)}
          />

          <header
            className={cn(
              "flex items-center justify-between border-b px-4 py-3",
              dark ? "border-[#262626]" : "border-[#c6d2c4]",
            )}
          >
            <div>
              <div
                className={cn(
                  "font-display text-sm font-bold uppercase tracking-[0.12em]",
                  dark ? "text-[#69daff]" : "text-[#4f8798]",
                )}
              >
                Mixi Bot
              </div>
              <div
                className={cn(
                  "font-pixel text-[9px] uppercase",
                  dark ? "text-[#767575]" : "text-[#6f7c74]",
                )}
              >
                Ctrl/Cmd + Shift + K
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={cn(
                  "border px-2 py-1 font-pixel text-[9px] uppercase",
                  dark
                    ? "border-[#262626] text-[#9cff93] hover:bg-[#1f1f1f]"
                    : "border-[#c6d2c4] text-[#5f8c61] hover:bg-[#e4efe1]",
                )}
                onClick={handleResetConversation}
                type="button"
              >
                New Chat
              </button>
              <button
                aria-label="Close Mixi Bot"
                className={cn(
                  "border px-2 py-1 font-pixel text-[10px] uppercase",
                  dark
                    ? "border-[#262626] text-[#adaaaa] hover:bg-[#1f1f1f]"
                    : "border-[#c6d2c4] text-[#5f7066] hover:bg-[#e8eeea]",
                )}
                onClick={() => setOpen(false)}
                type="button"
              >
                ✕
              </button>
            </div>
          </header>

          <div
            className="cyber-scrollbar flex-1 space-y-3 overflow-y-auto p-4"
            ref={scrollContainerRef}
          >
            {messages.map((message) => {
              const userMessage = message.role === "user";
              return (
                <div
                  className={cn(
                    "max-w-[85%] border px-3 py-2 text-sm",
                    userMessage ? "ml-auto" : "mr-auto",
                    userMessage
                      ? dark
                        ? "border-[#1e3a2a] bg-[#132217]"
                        : "border-[#b6d0b9] bg-[#edf5eb]"
                      : dark
                        ? "border-[#262626] bg-[#131313]"
                        : "border-[#d1dbcf] bg-[#f8fbf5]",
                  )}
                  key={message.id}
                >
                  <div
                    className={cn(
                      "mb-1 flex items-center justify-between gap-2 font-pixel text-[9px] uppercase",
                      userMessage
                        ? dark
                          ? "text-[#9cff93]"
                          : "text-[#5f8c61]"
                        : dark
                          ? "text-[#69daff]"
                          : "text-[#4f8798]",
                    )}
                  >
                    <span>{userMessage ? "You" : "Mixi Bot"}</span>
                    {message.mode ? <span>mode: {message.mode}</span> : null}
                  </div>
                  <div
                    className={cn(
                      "whitespace-pre-wrap break-words",
                      dark ? "text-[#d4d4d4]" : "text-[#243127]",
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              );
            })}

            {askMutation.isPending ? (
              <div
                className={cn(
                  "mr-auto max-w-[85%] border px-3 py-2 text-sm",
                  dark
                    ? "border-[#262626] bg-[#131313]"
                    : "border-[#d1dbcf] bg-[#f8fbf5]",
                )}
              >
                <div
                  className={cn(
                    "font-pixel text-[9px] uppercase",
                    dark ? "text-[#69daff]" : "text-[#4f8798]",
                  )}
                >
                  Mixi Bot is thinking...
                </div>
              </div>
            ) : null}
          </div>

          <footer
            className={cn(
              "border-t p-3",
              dark
                ? "border-[#262626] bg-[#101010]"
                : "border-[#c6d2c4] bg-[#f6faf3]",
            )}
          >
            <div className="flex gap-2">
              <textarea
                className={cn(
                  "min-h-[52px] flex-1 resize-none border px-3 py-2 text-sm outline-none",
                  dark
                    ? "border-[#262626] bg-[#131313] text-white placeholder:text-[#767575]"
                    : "border-[#c6d2c4] bg-[#fbfdf8] text-[#243127] placeholder:text-[#7a887f]",
                )}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSendMessage();
                  }
                }}
                placeholder="Ask about lessons, practice, or review..."
                rows={2}
                value={draft}
              />
              <button
                className={cn(
                  "border px-3 py-2 font-pixel text-[10px] uppercase",
                  dark
                    ? "border-[#262626] text-[#69daff] hover:bg-[#11232b]"
                    : "border-[#c6d2c4] text-[#4f8798] hover:bg-[#edf5f7]",
                )}
                disabled={askMutation.isPending || !draft.trim()}
                onClick={() => void handleSendMessage()}
                type="button"
              >
                Send
              </button>
            </div>
          </footer>
        </section>
      ) : null}

      {/* Toggle button - floating at top right when chat is closed */}
      {!open ? (
        <button
          aria-label="Open Mixi Bot"
          className={cn(
            "fixed top-6 right-6 z-50 rounded-none border px-3 py-2 font-pixel text-[10px] uppercase tracking-[0.12em] transition-colors",
            dark
              ? "border-[#262626] bg-[#131313] text-[#69daff] hover:bg-[#1f1f1f]"
              : "border-[#c6d2c4] bg-[#edf4ec] text-[#4f8798] hover:bg-[#e2ece6]",
          )}
          onClick={() => setOpen(true)}
          type="button"
        >
          ≡
        </button>
      ) : null}
    </>
  );
}
