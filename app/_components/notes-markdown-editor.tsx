"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/app/_components/ui-kit/shared";

type EditorMode = "edit" | "preview" | "split";

type SlashCommand = {
  description: string;
  id: string;
  label: string;
  template: string;
};

type NotesMarkdownEditorProps = {
  dark: boolean;
  onChange: (value: string) => void;
  value: string;
};

const slashCommands: SlashCommand[] = [
  {
    id: "h1",
    label: "Heading 1",
    description: "Large section heading",
    template: "# ",
  },
  {
    id: "h2",
    label: "Heading 2",
    description: "Medium section heading",
    template: "## ",
  },
  {
    id: "h3",
    label: "Heading 3",
    description: "Small section heading",
    template: "### ",
  },
  {
    id: "todo",
    label: "Todo",
    description: "Task list item",
    template: "- [ ] ",
  },
  {
    id: "bullet",
    label: "Bullet list",
    description: "Simple bullet item",
    template: "- ",
  },
  {
    id: "numbered",
    label: "Numbered list",
    description: "Ordered list item",
    template: "1. ",
  },
  {
    id: "quote",
    label: "Quote",
    description: "Quote block",
    template: "> ",
  },
  {
    id: "code",
    label: "Code block",
    description: "Triple-backtick block",
    template: "```ts\n\n```",
  },
  {
    id: "divider",
    label: "Divider",
    description: "Horizontal rule",
    template: "---",
  },
];

type PendingSelection = {
  end: number;
  start: number;
};

type SlashState = {
  lineEnd: number;
  lineStart: number;
  query: string;
};

function getSlashState(value: string, cursor: number): SlashState | null {
  const lineStart = value.lastIndexOf("\n", Math.max(0, cursor - 1)) + 1;
  const lineEndIndex = value.indexOf("\n", cursor);
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
  const lineToCursor = value.slice(lineStart, cursor);
  const slashMatch = lineToCursor.match(/^\/([a-z0-9-]*)$/i);

  if (!slashMatch) {
    return null;
  }

  return {
    lineEnd,
    lineStart,
    query: slashMatch[1] ?? "",
  };
}

function replaceSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  replacement: string,
) {
  const nextValue =
    value.slice(0, selectionStart) + replacement + value.slice(selectionEnd);
  const nextCursor = selectionStart + replacement.length;

  return {
    nextValue,
    selection: {
      start: nextCursor,
      end: nextCursor,
    } satisfies PendingSelection,
  };
}

function replaceCurrentLineWithPrefix(
  value: string,
  selectionStart: number,
  prefix: string,
) {
  const lineStart = value.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
  const lineEndIndex = value.indexOf("\n", selectionStart);
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
  const line = value.slice(lineStart, lineEnd).replace(/^\s*(?:[-*+] |\d+\. |> |#{1,6}\s)/, "");
  const replacement = `${prefix}${line}`;
  const nextValue = value.slice(0, lineStart) + replacement + value.slice(lineEnd);
  const cursor = lineStart + replacement.length;

  return {
    nextValue,
    selection: {
      start: cursor,
      end: cursor,
    } satisfies PendingSelection,
  };
}

function wrapSelectionWith(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  wrapToken: string,
) {
  const selectedText = value.slice(selectionStart, selectionEnd);

  if (!selectedText) {
    const insertion = `${wrapToken}${wrapToken}`;
    const nextValue =
      value.slice(0, selectionStart) + insertion + value.slice(selectionEnd);
    const cursor = selectionStart + wrapToken.length;
    return {
      nextValue,
      selection: {
        start: cursor,
        end: cursor,
      } satisfies PendingSelection,
    };
  }

  const alreadyWrapped =
    selectedText.startsWith(wrapToken) && selectedText.endsWith(wrapToken);

  if (alreadyWrapped && selectedText.length >= wrapToken.length * 2) {
    const unwrapped = selectedText.slice(
      wrapToken.length,
      selectedText.length - wrapToken.length,
    );
    const nextValue =
      value.slice(0, selectionStart) + unwrapped + value.slice(selectionEnd);
    const nextEnd = selectionStart + unwrapped.length;

    return {
      nextValue,
      selection: {
        start: selectionStart,
        end: nextEnd,
      } satisfies PendingSelection,
    };
  }

  const wrapped = `${wrapToken}${selectedText}${wrapToken}`;
  const nextValue = value.slice(0, selectionStart) + wrapped + value.slice(selectionEnd);
  const nextEnd = selectionStart + wrapped.length;

  return {
    nextValue,
    selection: {
      start: selectionStart,
      end: nextEnd,
    } satisfies PendingSelection,
  };
}

export function NotesMarkdownEditor({
  dark,
  onChange,
  value,
}: NotesMarkdownEditorProps) {
  const [mode, setMode] = useState<EditorMode>("split");
  const [slashState, setSlashState] = useState<SlashState | null>(null);
  const [activeSlashIndex, setActiveSlashIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pendingSelectionRef = useRef<PendingSelection | null>(null);

  const filteredSlashCommands = useMemo(() => {
    if (!slashState) {
      return [];
    }

    const query = slashState.query.trim().toLowerCase();
    const items =
      query.length === 0
        ? slashCommands
        : slashCommands.filter(
            (command) =>
              command.label.toLowerCase().includes(query) ||
              command.id.includes(query),
          );

    return items;
  }, [slashState]);

  useEffect(() => {
    const pendingSelection = pendingSelectionRef.current;

    if (!pendingSelection || !textareaRef.current) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(
        pendingSelection.start,
        pendingSelection.end,
      );
      pendingSelectionRef.current = null;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  const safeActiveSlashIndex =
    filteredSlashCommands.length === 0
      ? 0
      : activeSlashIndex % filteredSlashCommands.length;

  function commitChange(
    nextValue: string,
    selection?: PendingSelection,
    options?: { shouldCloseSlash?: boolean },
  ) {
    onChange(nextValue);
    if (selection) {
      pendingSelectionRef.current = selection;
    }
    if (options?.shouldCloseSlash) {
      setSlashState(null);
      setActiveSlashIndex(0);
    }
  }

  function applySlashCommand(command: SlashCommand) {
    if (!slashState) {
      return;
    }

    const nextValue =
      value.slice(0, slashState.lineStart) + command.template + value.slice(slashState.lineEnd);
    const cursor = slashState.lineStart + command.template.length;

    commitChange(
      nextValue,
      {
        start: cursor,
        end: cursor,
      },
      { shouldCloseSlash: true },
    );
  }

  function updateSlashFromCursor(nextValue: string, cursor: number) {
    const state = getSlashState(nextValue, cursor);
    setSlashState(state);
    setActiveSlashIndex(0);
  }

  function handleTextareaChange(nextValue: string, cursor: number) {
    onChange(nextValue);
    updateSlashFromCursor(nextValue, cursor);
  }

  function handleWrapAction(token: string) {
    const editor = textareaRef.current;
    if (!editor) {
      return;
    }

    const next = wrapSelectionWith(
      value,
      editor.selectionStart,
      editor.selectionEnd,
      token,
    );

    commitChange(next.nextValue, next.selection);
  }

  function handleLinePrefix(prefix: string) {
    const editor = textareaRef.current;
    if (!editor) {
      return;
    }

    const next = replaceCurrentLineWithPrefix(value, editor.selectionStart, prefix);
    commitChange(next.nextValue, next.selection);
  }

  function handleCodeBlock() {
    const editor = textareaRef.current;
    if (!editor) {
      return;
    }

    const selectedText = value.slice(editor.selectionStart, editor.selectionEnd);
    const template = selectedText ? `\`\`\`ts\n${selectedText}\n\`\`\`` : "```ts\n\n```";
    const next = replaceSelection(value, editor.selectionStart, editor.selectionEnd, template);
    const cursor = selectedText
      ? next.selection.end
      : editor.selectionStart + "```ts\n".length;

    commitChange(next.nextValue, {
      start: cursor,
      end: cursor,
    });
  }

  function handleDivider() {
    const editor = textareaRef.current;
    if (!editor) {
      return;
    }

    const insertion = "\n---\n";
    const next = replaceSelection(
      value,
      editor.selectionStart,
      editor.selectionEnd,
      insertion,
    );
    commitChange(next.nextValue, next.selection);
  }

  function handleEditorKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    const editor = textareaRef.current;
    if (!editor) {
      return;
    }

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
      event.preventDefault();
      handleWrapAction("**");
      return;
    }

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "i") {
      event.preventDefault();
      handleWrapAction("*");
      return;
    }

    if (!slashState || filteredSlashCommands.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSlashIndex((current) => (current + 1) % filteredSlashCommands.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSlashIndex(
        (current) =>
          (current - 1 + filteredSlashCommands.length) % filteredSlashCommands.length,
      );
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setSlashState(null);
      setActiveSlashIndex(0);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const command = filteredSlashCommands[safeActiveSlashIndex];
      if (command) {
        applySlashCommand(command);
      }
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 border p-2",
          dark ? "border-[#262626] bg-[#101010]" : "border-[#b5c0ca] bg-[#eef2f6]",
        )}
      >
        <button
          className={cn(
            "border px-2 py-1 font-pixel text-[9px] uppercase",
            dark
              ? "border-[#262626] text-[#9cff93] hover:bg-[#1f1f1f]"
              : "border-[#9aa7b3] text-[#006e17] hover:bg-[#d9e0e6]",
          )}
          onClick={() => handleLinePrefix("# ")}
          type="button"
        >
          H1
        </button>
        <button
          className={cn(
            "border px-2 py-1 font-pixel text-[9px] uppercase",
            dark
              ? "border-[#262626] text-[#9cff93] hover:bg-[#1f1f1f]"
              : "border-[#9aa7b3] text-[#006e17] hover:bg-[#d9e0e6]",
          )}
          onClick={() => handleLinePrefix("## ")}
          type="button"
        >
          H2
        </button>
        <button
          className={cn(
            "border px-2 py-1 font-pixel text-[9px] uppercase",
            dark
              ? "border-[#262626] text-[#9cff93] hover:bg-[#1f1f1f]"
              : "border-[#9aa7b3] text-[#006e17] hover:bg-[#d9e0e6]",
          )}
          onClick={() => handleWrapAction("**")}
          type="button"
        >
          Bold
        </button>
        <button
          className={cn(
            "border px-2 py-1 font-pixel text-[9px] uppercase",
            dark
              ? "border-[#262626] text-[#9cff93] hover:bg-[#1f1f1f]"
              : "border-[#9aa7b3] text-[#006e17] hover:bg-[#d9e0e6]",
          )}
          onClick={() => handleWrapAction("*")}
          type="button"
        >
          Italic
        </button>
        <button
          className={cn(
            "border px-2 py-1 font-pixel text-[9px] uppercase",
            dark
              ? "border-[#262626] text-[#9cff93] hover:bg-[#1f1f1f]"
              : "border-[#9aa7b3] text-[#006e17] hover:bg-[#d9e0e6]",
          )}
          onClick={() => handleLinePrefix("- [ ] ")}
          type="button"
        >
          Todo
        </button>
        <button
          className={cn(
            "border px-2 py-1 font-pixel text-[9px] uppercase",
            dark
              ? "border-[#262626] text-[#9cff93] hover:bg-[#1f1f1f]"
              : "border-[#9aa7b3] text-[#006e17] hover:bg-[#d9e0e6]",
          )}
          onClick={handleCodeBlock}
          type="button"
        >
          Code
        </button>
        <button
          className={cn(
            "border px-2 py-1 font-pixel text-[9px] uppercase",
            dark
              ? "border-[#262626] text-[#9cff93] hover:bg-[#1f1f1f]"
              : "border-[#9aa7b3] text-[#006e17] hover:bg-[#d9e0e6]",
          )}
          onClick={handleDivider}
          type="button"
        >
          Divider
        </button>

        <div className="ml-auto flex items-center gap-1">
          {(["edit", "split", "preview"] as const).map((nextMode) => (
            <button
              className={cn(
                "border px-2 py-1 font-pixel text-[9px] uppercase",
                mode === nextMode
                  ? dark
                    ? "border-[#69daff] bg-[#11232b] text-[#69daff]"
                    : "border-[#00677d] bg-[#dff4fa] text-[#00677d]"
                  : dark
                    ? "border-[#262626] text-[#adaaaa] hover:bg-[#1f1f1f]"
                    : "border-[#9aa7b3] text-[#475569] hover:bg-[#d9e0e6]",
              )}
              key={nextMode}
              onClick={() => setMode(nextMode)}
              type="button"
            >
              {nextMode}
            </button>
          ))}
        </div>
      </div>

      {slashState && filteredSlashCommands.length > 0 ? (
        <div
          className={cn(
            "border p-2",
            dark ? "border-[#262626] bg-[#101010]" : "border-[#b5c0ca] bg-white",
          )}
        >
          <div
            className={cn(
              "mb-2 font-pixel text-[9px] uppercase",
              dark ? "text-[#69daff]" : "text-[#00677d]",
            )}
          >
            Slash Commands
          </div>
          <div className="max-h-48 space-y-1 overflow-auto">
            {filteredSlashCommands.map((command, index) => {
              const active = index === safeActiveSlashIndex;
              return (
                <button
                  className={cn(
                    "w-full border px-2 py-2 text-left",
                    active
                      ? dark
                        ? "border-[#69daff] bg-[#11232b] text-[#69daff]"
                        : "border-[#00677d] bg-[#dff4fa] text-[#00677d]"
                      : dark
                        ? "border-[#262626] text-[#d4d4d4] hover:bg-[#1f1f1f]"
                        : "border-[#d3dbe3] text-[#1f2937] hover:bg-[#eef2f6]",
                  )}
                  key={command.id}
                  onClick={() => applySlashCommand(command)}
                  type="button"
                >
                  <div className="text-sm font-semibold">{command.label}</div>
                  <div className="text-xs opacity-75">{command.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          mode === "split" ? "grid gap-3 xl:grid-cols-2" : "grid",
          "min-h-[560px] lg:min-h-[680px]",
        )}
      >
        {mode !== "preview" ? (
          <div className="relative">
            <textarea
              className={cn(
                "min-h-[560px] lg:min-h-[680px] w-full border px-3 py-3 text-sm leading-6 outline-none",
                dark
                  ? "border-[#262626] bg-[#131313] text-white placeholder:text-[#767575]"
                  : "border-[#9aa7b3] bg-white text-[#0f172a] placeholder:text-[#64748b]",
              )}
              onChange={(event) =>
                handleTextareaChange(event.target.value, event.target.selectionStart ?? 0)
              }
              onClick={(event) =>
                updateSlashFromCursor(
                  event.currentTarget.value,
                  event.currentTarget.selectionStart ?? 0,
                )
              }
              onKeyDown={handleEditorKeyDown}
              onKeyUp={(event) =>
                updateSlashFromCursor(
                  event.currentTarget.value,
                  event.currentTarget.selectionStart ?? 0,
                )
              }
              placeholder="Type markdown... Use / for Notion-style commands."
              ref={textareaRef}
              spellCheck={false}
              value={value}
            />
          </div>
        ) : null}

        {mode !== "edit" ? (
          <article
            className={cn(
              "min-h-[560px] lg:min-h-[680px] overflow-auto border px-5 py-4 text-sm leading-7",
              dark
                ? "border-[#262626] bg-[#101010] text-[#e7e7e7]"
                : "border-[#9aa7b3] bg-white text-[#0f172a]",
              "[&_blockquote]:border-l-4 [&_blockquote]:pl-3 [&_blockquote]:italic",
              "[&_code]:rounded [&_code]:px-1 [&_code]:py-0.5",
              "[&_h1]:mb-2 [&_h1]:mt-5 [&_h1]:text-2xl [&_h1]:font-bold",
              "[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-bold",
              "[&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold",
              "[&_hr]:my-4 [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:p-3 [&_ul]:list-disc [&_ul]:pl-6",
            )}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {value.trim().length > 0 ? value : "_Empty note_"}
            </ReactMarkdown>
          </article>
        ) : null}
      </div>
    </div>
  );
}
