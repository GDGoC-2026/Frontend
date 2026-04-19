"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/app/_components/ui-kit/shared";

type EditorMode = "edit" | "lock";
type BlockType = "paragraph" | "h1" | "h2" | "h3" | "todo" | "bullet" | "numbered" | "quote" | "code" | "divider";

type EditorBlock = {
  checked?: boolean;
  id: string;
  text: string;
  type: BlockType;
};

type SlashCommand = {
  description: string;
  id: string;
  keyword: string;
  label: string;
  type: BlockType;
};

type NotesMarkdownEditorProps = {
  dark: boolean;
  onChange: (value: string) => void;
  value: string;
};

const slashCommands: SlashCommand[] = [
  { id: "h1", keyword: "h1", label: "Heading 1", description: "Large heading", type: "h1" },
  { id: "h2", keyword: "h2", label: "Heading 2", description: "Section heading", type: "h2" },
  { id: "h3", keyword: "h3", label: "Heading 3", description: "Sub heading", type: "h3" },
  { id: "todo", keyword: "todo", label: "Todo", description: "Checklist item", type: "todo" },
  { id: "bullet", keyword: "bullet", label: "Bullet", description: "Bullet list item", type: "bullet" },
  { id: "numbered", keyword: "number", label: "Numbered", description: "Ordered list item", type: "numbered" },
  { id: "quote", keyword: "quote", label: "Quote", description: "Quote block", type: "quote" },
  { id: "code", keyword: "code", label: "Code", description: "Code block", type: "code" },
  { id: "divider", keyword: "divider", label: "Divider", description: "Horizontal rule", type: "divider" },
];

function createBlock(type: BlockType = "paragraph", text = "", checked = false): EditorBlock {
  return {
    checked,
    id: crypto.randomUUID(),
    text,
    type,
  };
}

function parseMarkdownToBlocks(markdown: string): EditorBlock[] {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [createBlock("paragraph", "")];
  }

  const lines = normalized.split("\n");
  const blocks: EditorBlock[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const rawLine = lines[i];
    const line = rawLine.trimEnd();

    if (line.trim().length === 0) {
      continue;
    }

    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      blocks.push(createBlock("code", codeLines.join("\n")));
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      blocks.push(createBlock("divider", ""));
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push(createBlock("h1", line.slice(2).trim()));
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(createBlock("h2", line.slice(3).trim()));
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(createBlock("h3", line.slice(4).trim()));
      continue;
    }

    const todoMatch = line.match(/^- \[( |x|X)\]\s+(.*)$/);
    if (todoMatch) {
      blocks.push(createBlock("todo", todoMatch[2] ?? "", (todoMatch[1] ?? " ") !== " "));
      continue;
    }

    const bulletMatch = line.match(/^[-*+]\s+(.*)$/);
    if (bulletMatch) {
      blocks.push(createBlock("bullet", bulletMatch[1] ?? ""));
      continue;
    }

    const numberMatch = line.match(/^\d+\.\s+(.*)$/);
    if (numberMatch) {
      blocks.push(createBlock("numbered", numberMatch[1] ?? ""));
      continue;
    }

    const quoteMatch = line.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      blocks.push(createBlock("quote", quoteMatch[1] ?? ""));
      continue;
    }

    blocks.push(createBlock("paragraph", line));
  }

  return blocks.length > 0 ? blocks : [createBlock("paragraph", "")];
}

function serializeBlocksToMarkdown(blocks: EditorBlock[]) {
  const parts: string[] = [];

  for (const block of blocks) {
    const text = block.text ?? "";
    if (block.type !== "divider" && text.trim().length === 0) {
      continue;
    }

    if (block.type === "h1") {
      parts.push(`# ${text.trim()}`);
      continue;
    }
    if (block.type === "h2") {
      parts.push(`## ${text.trim()}`);
      continue;
    }
    if (block.type === "h3") {
      parts.push(`### ${text.trim()}`);
      continue;
    }
    if (block.type === "todo") {
      parts.push(`- [${block.checked ? "x" : " "}] ${text.trim()}`);
      continue;
    }
    if (block.type === "bullet") {
      parts.push(`- ${text.trim()}`);
      continue;
    }
    if (block.type === "numbered") {
      parts.push(`1. ${text.trim()}`);
      continue;
    }
    if (block.type === "quote") {
      parts.push(`> ${text.trim()}`);
      continue;
    }
    if (block.type === "code") {
      parts.push(`\`\`\`\n${text}\n\`\`\``);
      continue;
    }
    if (block.type === "divider") {
      parts.push("---");
      continue;
    }
    parts.push(text);
  }

  return parts.join("\n\n");
}

function nextTypeAfterEnter(type: BlockType): BlockType {
  if (type === "bullet" || type === "numbered" || type === "todo") {
    return type;
  }
  return "paragraph";
}

function getBlockShellClass(type: BlockType, dark: boolean) {
  const base = dark ? "text-white" : "text-[#0f172a]";
  if (type === "h1") {
    return `${base} text-3xl font-bold`;
  }
  if (type === "h2") {
    return `${base} text-2xl font-bold`;
  }
  if (type === "h3") {
    return `${base} text-xl font-semibold`;
  }
  if (type === "quote") {
    return `${base} border-l-4 ${dark ? "border-[#69daff]/60 text-[#dbeeff]" : "border-[#0ea5b7]/60 text-[#0f3a44]"} pl-3 italic`;
  }
  if (type === "code") {
    return `${base} rounded border ${dark ? "border-[#27303d] bg-[#0e1420]" : "border-[#cbd5e1] bg-[#f8fafc]"} px-3 py-2 font-mono text-[13px]`;
  }
  return `${base} text-[15px]`;
}

function isCaretAtBoundary(target: HTMLDivElement, boundary: "start" | "end") {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) {
    return false;
  }

  const range = selection.getRangeAt(0);
  if (!target.contains(range.startContainer) || !target.contains(range.endContainer)) {
    return false;
  }

  const probe = range.cloneRange();
  probe.selectNodeContents(target);

  if (boundary === "start") {
    probe.setEnd(range.startContainer, range.startOffset);
    return probe.toString().length === 0;
  }

  probe.setStart(range.endContainer, range.endOffset);
  return probe.toString().length === 0;
}

export function NotesMarkdownEditor({
  dark,
  onChange,
  value,
}: NotesMarkdownEditorProps) {
  const [mode, setMode] = useState<EditorMode>("edit");
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => parseMarkdownToBlocks(value));
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [slashIndex, setSlashIndex] = useState(0);
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const lastSyncedMarkdownRef = useRef<string>(serializeBlocksToMarkdown(parseMarkdownToBlocks(value)));
  const pendingFocusRef = useRef<string | null>(null);
  const typingBlockRef = useRef<string | null>(null);

  const activeBlock = blocks.find((block) => block.id === activeBlockId) ?? null;

  const slashCommandsFiltered = useMemo(() => {
    if (!activeBlock || !activeBlock.text.startsWith("/")) {
      return [];
    }
    const query = activeBlock.text.slice(1).trim().toLowerCase();
    if (!query) {
      return slashCommands;
    }
    return slashCommands.filter((command) =>
      command.keyword.includes(query) || command.label.toLowerCase().includes(query),
    );
  }, [activeBlock]);

  useEffect(() => {
    const markdown = serializeBlocksToMarkdown(blocks);
    if (markdown !== lastSyncedMarkdownRef.current) {
      lastSyncedMarkdownRef.current = markdown;
      onChange(markdown);
    }
  }, [blocks, onChange]);

  useEffect(() => {
    const externalValue = value ?? "";
    if (externalValue === lastSyncedMarkdownRef.current) {
      return;
    }
    const activeElement = document.activeElement as HTMLElement | null;
    const isEditingInside =
      mode === "edit" &&
      Boolean(
        activeElement &&
        Array.from(blockRefs.current.values()).some(
          (element) => element === activeElement || element.contains(activeElement),
        ),
      );
    if (isEditingInside) {
      return;
    }
    const parsed = parseMarkdownToBlocks(externalValue);
    setBlocks(parsed);
    lastSyncedMarkdownRef.current = serializeBlocksToMarkdown(parsed);
    setActiveBlockId(parsed[0]?.id ?? null);
  }, [mode, value]);

  useLayoutEffect(() => {
    if (!pendingFocusRef.current) {
      return;
    }

    const target = blockRefs.current.get(pendingFocusRef.current);
    if (!target) {
      return;
    }

    const placeCaretAtEnd = () => {
      target.focus();
      const selection = window.getSelection();
      if (!selection) {
        return;
      }
      const range = document.createRange();
      range.selectNodeContents(target);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    };

    const frame = window.requestAnimationFrame(() => {
      placeCaretAtEnd();
      window.setTimeout(() => {
        placeCaretAtEnd();
        pendingFocusRef.current = null;
      }, 0);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [blocks]);

  useLayoutEffect(() => {
    for (const block of blocks) {
      const element = blockRefs.current.get(block.id);
      if (!element) {
        continue;
      }
      if (typingBlockRef.current === block.id) {
        continue;
      }
      const domText = element.textContent ?? "";
      if (domText !== block.text) {
        element.textContent = block.text;
      }
    }
  }, [blocks]);

  function updateBlock(blockId: string, updater: (block: EditorBlock) => EditorBlock) {
    setBlocks((current) => current.map((block) => (block.id === blockId ? updater(block) : block)));
  }

  function applySlashCommand(command: SlashCommand) {
    if (!activeBlockId) {
      return;
    }

    setBlocks((current) =>
      current.map((block) => {
        if (block.id !== activeBlockId) {
          return block;
        }
        return {
          ...block,
          checked: command.type === "todo" ? false : block.checked,
          text: "",
          type: command.type,
        };
      }),
    );
    setSlashIndex(0);
    pendingFocusRef.current = activeBlockId;
  }

  function insertBlockAtIndex(index: number, nextType: BlockType = "paragraph") {
    const nextBlock = createBlock(nextType, "");
    pendingFocusRef.current = nextBlock.id;
    setActiveBlockId(nextBlock.id);
    setBlocks((current) => {
      const insertAt = Math.max(0, Math.min(index, current.length));
      const next = [...current];
      next.splice(insertAt, 0, nextBlock);
      return next;
    });
  }

  function insertBlockAfter(blockId: string, nextType?: BlockType) {
    const sourceBlock = blocks.find((block) => block.id === blockId);
    if (!sourceBlock) {
      return;
    }
    const type = nextType ?? nextTypeAfterEnter(sourceBlock.type);
    const nextBlock = createBlock(type, "");
    pendingFocusRef.current = nextBlock.id;
    setActiveBlockId(nextBlock.id);
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === blockId);
      if (index < 0) {
        return current;
      }
      const next = [...current];
      next.splice(index + 1, 0, nextBlock);
      return next;
    });
  }

  function removeBlock(blockId: string) {
    if (blocks.length <= 1) {
      const fallback = createBlock("paragraph", "");
      pendingFocusRef.current = fallback.id;
      setActiveBlockId(fallback.id);
      setBlocks([fallback]);
      return;
    }
    const index = blocks.findIndex((block) => block.id === blockId);
    if (index < 0) {
      return;
    }
    const next = blocks.filter((block) => block.id !== blockId);
    const fallback = next[Math.max(0, index - 1)] ?? next[0];
    pendingFocusRef.current = fallback.id;
    setActiveBlockId(fallback.id);
    setBlocks(next);
  }

  function focusBlockByIndex(index: number, caret: "start" | "end") {
    const targetBlock = blocks[index];
    if (!targetBlock || targetBlock.type === "divider") {
      return;
    }

    setActiveBlockId(targetBlock.id);

    const placeCaret = () => {
      const target = blockRefs.current.get(targetBlock.id);
      if (!target) {
        return;
      }
      target.focus();
      const selection = window.getSelection();
      if (!selection) {
        return;
      }
      const range = document.createRange();
      range.selectNodeContents(target);
      range.collapse(caret === "start");
      selection.removeAllRanges();
      selection.addRange(range);
    };

    window.requestAnimationFrame(placeCaret);
  }

  function findEditableSiblingIndex(fromIndex: number, direction: -1 | 1) {
    let index = fromIndex + direction;
    while (index >= 0 && index < blocks.length) {
      if (blocks[index]?.type !== "divider") {
        return index;
      }
      index += direction;
    }
    return null;
  }

  function handleBlockKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>,
    block: EditorBlock,
    blockIndex: number,
  ) {
    if (mode === "lock") {
      event.preventDefault();
      return;
    }

    if (slashCommandsFiltered.length > 0) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSlashIndex((current) => (current + 1) % slashCommandsFiltered.length);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSlashIndex((current) => (current - 1 + slashCommandsFiltered.length) % slashCommandsFiltered.length);
        return;
      }
      if (event.key === "Enter" && block.text.startsWith("/")) {
        event.preventDefault();
        const command = slashCommandsFiltered[slashIndex] ?? slashCommandsFiltered[0];
        if (command) {
          applySlashCommand(command);
        }
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        updateBlock(block.id, (current) => ({ ...current, text: "" }));
        setSlashIndex(0);
        return;
      }
    }

    if (event.key === "ArrowUp" && isCaretAtBoundary(event.currentTarget, "start")) {
      const previousIndex = findEditableSiblingIndex(blockIndex, -1);
      if (previousIndex !== null) {
        event.preventDefault();
        focusBlockByIndex(previousIndex, "end");
      }
      return;
    }

    if (event.key === "ArrowDown" && isCaretAtBoundary(event.currentTarget, "end")) {
      const nextIndex = findEditableSiblingIndex(blockIndex, 1);
      if (nextIndex !== null) {
        event.preventDefault();
        focusBlockByIndex(nextIndex, "start");
      }
      return;
    }

    if (event.key === "Enter" && !event.shiftKey && block.type !== "code") {
      event.preventDefault();
      insertBlockAfter(block.id);
      return;
    }

    if (event.key === "Backspace" && block.text.length === 0 && block.type !== "divider") {
      event.preventDefault();
      removeBlock(block.id);
    }
  }

  const markdownValue = useMemo(() => serializeBlocksToMarkdown(blocks), [blocks]);

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex items-center gap-2 border p-2",
          dark ? "border-[#262626] bg-[#101010]" : "border-[#b5c0ca] bg-[#eef2f6]",
        )}
      >
        <div className={cn("font-pixel text-[9px] uppercase tracking-[0.16em]", dark ? "text-[#69daff]" : "text-[#00677d]")}>
          Visual Note Editor
        </div>
        <div className="ml-auto flex items-center gap-1">
          {(["edit", "lock"] as const).map((nextMode) => (
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

      {mode === "edit" ? (
        <div
          className={cn(
            "min-h-[560px] border p-3 lg:min-h-[680px]",
            dark ? "border-[#262626] bg-[#101010]" : "border-[#9aa7b3] bg-white",
          )}
        >
          <div className="space-y-0">
            {blocks.map((block, index) => {
              const showSlash = activeBlockId === block.id && slashCommandsFiltered.length > 0 && block.text.startsWith("/");
              return (
                <div key={block.id}>
                  {index > 0 ? (
                    <div className="group/insert relative h-4">
                      <button
                        aria-label="Insert new line"
                        className={cn(
                          "absolute top-1/2 left-0 z-10 h-5 w-5 -translate-y-1/2 border text-[12px] leading-none opacity-0 scale-90 transition-all duration-200 group-hover/insert:opacity-100 group-hover/insert:scale-100",
                          dark
                            ? "border-[#2b313a] bg-[#0c1014] text-[#69daff] hover:bg-[#13202b]"
                            : "border-[#cbd5e1] bg-white text-[#00677d] hover:bg-[#e2ecf3]",
                        )}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          insertBlockAtIndex(index, "paragraph");
                        }}
                        type="button"
                      >
                        +
                      </button>
                      <div
                        className={cn(
                          "pointer-events-none absolute top-1/2 left-7 right-1 h-px -translate-y-1/2 origin-left scale-x-75 bg-gradient-to-r opacity-0 transition-all duration-300 group-hover/insert:scale-x-100 group-hover/insert:opacity-100",
                          dark
                            ? "from-[#69daff]/85 via-[#69daff]/45 to-transparent"
                            : "from-[#00677d]/80 via-[#27a4bf]/40 to-transparent",
                        )}
                      />
                    </div>
                  ) : null}

                  <div
                    className={cn(
                      "group relative rounded px-1 py-0.5",
                      dark ? "hover:bg-[#12161b]" : "hover:bg-[#f1f5f9]",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className={cn("pt-1 text-[10px] font-semibold uppercase", dark ? "text-[#6d7682]" : "text-[#64748b]")}>
                        {block.type === "todo" ? "[]"
                          : block.type === "bullet" ? "•"
                            : block.type === "numbered" ? "1."
                              : block.type === "quote" ? ">"
                                : block.type === "code" ? "</>"
                                  : block.type === "divider" ? "---"
                                    : " "}
                      </div>
                      {block.type === "divider" ? (
                        <hr className={cn("my-3 w-full border-0 border-t", dark ? "border-[#2b313a]" : "border-[#d3dbe3]")} />
                      ) : (
                        <div className="w-full">
                          {block.type === "todo" ? (
                            <div className="mb-1 flex items-center gap-2">
                              <input
                                checked={Boolean(block.checked)}
                                className="h-4 w-4"
                                onChange={(event) =>
                                  updateBlock(block.id, (current) => ({ ...current, checked: event.target.checked }))
                                }
                                type="checkbox"
                              />
                            </div>
                          ) : null}
                          <div
                            className={cn(
                              "w-full rounded px-1 py-1 outline-none focus:outline-none",
                              getBlockShellClass(block.type, dark),
                            )}
                            contentEditable
                            onFocus={() => setActiveBlockId(block.id)}
                            onInput={(event) => {
                              const nextText = event.currentTarget.textContent ?? "";
                              typingBlockRef.current = block.id;
                              window.requestAnimationFrame(() => {
                                if (typingBlockRef.current === block.id) {
                                  typingBlockRef.current = null;
                                }
                              });
                              updateBlock(block.id, (current) => ({ ...current, text: nextText }));
                            if (activeBlockId !== block.id) {
                              setActiveBlockId(block.id);
                            }
                            setSlashIndex(0);
                          }}
                            onKeyDown={(event) => handleBlockKeyDown(event, block, index)}
                            ref={(element) => {
                              if (element) {
                                blockRefs.current.set(block.id, element);
                                if (element.textContent !== block.text) {
                                  element.textContent = block.text;
                                }
                              } else {
                                blockRefs.current.delete(block.id);
                              }
                            }}
                            suppressContentEditableWarning
                          />
                        </div>
                      )}
                    </div>

                    {showSlash ? (
                      <div
                        className={cn(
                          "mt-1 ml-6 max-h-52 overflow-auto border p-1",
                          dark ? "border-[#2b313a] bg-[#0d1218]" : "border-[#d3dbe3] bg-white",
                        )}
                      >
                        {slashCommandsFiltered.map((command, commandIndex) => (
                          <button
                            className={cn(
                              "w-full border px-2 py-1.5 text-left",
                              commandIndex === (slashIndex % slashCommandsFiltered.length)
                                ? dark
                                  ? "border-[#69daff] bg-[#11232b] text-[#69daff]"
                                  : "border-[#00677d] bg-[#dff4fa] text-[#00677d]"
                                : dark
                                  ? "border-[#262626] text-[#d4d4d4] hover:bg-[#1f1f1f]"
                                  : "border-[#d3dbe3] text-[#1f2937] hover:bg-[#eef2f6]",
                            )}
                            key={command.id}
                            onMouseDown={(event) => {
                              event.preventDefault();
                              applySlashCommand(command);
                            }}
                            type="button"
                          >
                            <div className="text-sm font-semibold">{command.label}</div>
                            <div className="text-xs opacity-75">{command.description}</div>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
            <div className="group/insert relative h-4">
              <button
                aria-label="Insert new line"
                className={cn(
                  "absolute top-1/2 left-0 z-10 h-5 w-5 -translate-y-1/2 border text-[12px] leading-none opacity-0 scale-90 transition-all duration-200 group-hover/insert:opacity-100 group-hover/insert:scale-100",
                  dark
                    ? "border-[#2b313a] bg-[#0c1014] text-[#69daff] hover:bg-[#13202b]"
                    : "border-[#cbd5e1] bg-white text-[#00677d] hover:bg-[#e2ecf3]",
                )}
                onMouseDown={(event) => {
                  event.preventDefault();
                  insertBlockAtIndex(blocks.length, "paragraph");
                }}
                type="button"
              >
                +
              </button>
              <div
                className={cn(
                  "pointer-events-none absolute top-1/2 left-7 right-1 h-px -translate-y-1/2 origin-left scale-x-75 bg-gradient-to-r opacity-0 transition-all duration-300 group-hover/insert:scale-x-100 group-hover/insert:opacity-100",
                  dark
                    ? "from-[#69daff]/85 via-[#69daff]/45 to-transparent"
                    : "from-[#00677d]/80 via-[#27a4bf]/40 to-transparent",
                )}
              />
            </div>
          </div>

          <div className={cn("mt-4 border-t pt-3 text-[11px]", dark ? "border-[#2b313a] text-[#6d7682]" : "border-[#e2e8f0] text-[#64748b]")}>
            Type <code>/</code> on a new line to insert heading, list, quote, code block, divider...
          </div>
        </div>
      ) : (
        <article
          className={cn(
            "min-h-[560px] overflow-auto border px-5 py-4 text-sm leading-7 lg:min-h-[680px]",
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
            {markdownValue.trim().length > 0 ? markdownValue : "_Empty note_"}
          </ReactMarkdown>
        </article>
      )}
    </div>
  );
}
