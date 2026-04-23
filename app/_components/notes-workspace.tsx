"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { KnowledgeGraphVisualizer } from "@/app/_components/knowledge-graph-visualizer";
import { NotesMarkdownEditor } from "@/app/_components/notes-markdown-editor";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { WorkspaceShell } from "@/app/_components/learning-workspace";
import { cn, type CyberTheme } from "@/app/_components/ui-kit/shared";
import {
  useBackendCreateFolderMutation,
  useBackendCreateNoteMutation,
  useBackendDeleteKnowledgeGraphMutation,
  useBackendDeleteNoteMutation,
  useBackendFolderDetailsQuery,
  useBackendKnowledgeGraphDataQuery,
  useBackendKnowledgeIngestMutation,
  useBackendKnowledgeIngestStatusQuery,
  useBackendKnowledgeQueryMutation,
  useBackendRootFoldersQuery,
  useBackendUpdateNoteMutation,
} from "@/hooks/use-backend-api";
import type { FolderResponse, NoteResponse } from "@/lib/api/frontend";

type NotesWorkspacePageProps = {
  theme: CyberTheme;
};

type FolderTreeNodeProps = {
  dark: boolean;
  depth: number;
  expandedFolderIds: Set<string>;
  folder: FolderResponse;
  onMoveNote: (targetFolderId: string) => Promise<void>;
  onSelectNote: (note: NoteResponse) => void;
  onSelectFolder: (folderId: string) => void;
  onToggleFolder: (folderId: string) => void;
  selectedFolderId: string | null;
  selectedNoteFolderId: string | null;
  selectedNoteId: string | null;
};

function FolderTreeNode({
  dark,
  depth,
  expandedFolderIds,
  folder,
  onMoveNote,
  onSelectNote,
  onSelectFolder,
  onToggleFolder,
  selectedFolderId,
  selectedNoteFolderId,
  selectedNoteId,
}: FolderTreeNodeProps) {
  const isExpanded = expandedFolderIds.has(folder.id);
  const shouldLoadChildren =
    isExpanded || selectedFolderId === folder.id || selectedNoteFolderId === folder.id;
  const folderQuery = useBackendFolderDetailsQuery(folder.id, {
    enabled: shouldLoadChildren,
  });
  const children = folderQuery.data?.subfolders ?? [];
  const notes = folderQuery.data?.notes ?? [];
  const canMoveHere = Boolean(selectedNoteId) && selectedNoteFolderId !== folder.id;
  const isSelected = selectedFolderId === folder.id;

  return (
    <div>
      <div
        className={cn(
          "mb-1.5 flex items-center gap-2 border px-2 py-2",
          isSelected
            ? dark
              ? "border-[#9cff93] bg-[#182317] text-[#9cff93]"
              : "border-[#0f9f62] bg-[#e4f8eb] text-[#0f7a4c]"
            : dark
              ? "border-[#262626] bg-[#131313] text-[#d4d4d4]"
              : "border-[#aab8b0] bg-[#fbfffc] text-[#1f2937]",
        )}
        style={{ marginLeft: `${depth * 14}px` }}
      >
        <button
          aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
          className={cn(
            "inline-flex h-7 w-7 shrink-0 items-center justify-center border text-xs",
            dark
              ? "border-[#303740] bg-[#0c1014] text-[#69daff] hover:bg-[#13202b]"
              : "border-[#aab8b0] bg-[#f6fbf7] text-[#0b7285] hover:bg-[#e6f2ee]",
          )}
          onClick={() => onToggleFolder(folder.id)}
          type="button"
        >
          {isExpanded ? "−" : "+"}
        </button>

        <button
          className="min-w-0 flex-1 truncate text-left text-sm font-semibold"
          onClick={() => {
            onSelectFolder(folder.id);
            if (!isExpanded) {
              onToggleFolder(folder.id);
            }
          }}
          title={folder.name}
          type="button"
        >
          {folder.name}
        </button>

        {canMoveHere ? (
          <button
            className={cn(
              "shrink-0 border px-2 py-1 font-pixel text-[9px] uppercase",
              dark
                ? "border-[#303740] bg-[#0c1014] text-[#69daff] hover:bg-[#13202b]"
                : "border-[#aab8b0] bg-[#f6fbf7] text-[#0b7285] hover:bg-[#e6f2ee]",
            )}
            onClick={() => void onMoveNote(folder.id)}
            type="button"
          >
            Move
          </button>
        ) : null}
      </div>

      {isExpanded ? (
        <div>
          {folderQuery.isPending ? (
            <div className={cn("mb-2 ml-8 text-xs", dark ? "text-[#767575]" : "text-[#64748b]")}>
              Loading...
            </div>
          ) : null}

          {notes.map((note) => {
            const noteSelected = selectedNoteId === note.id;
            return (
              <button
                className={cn(
                  "mb-1 flex w-full items-center gap-2 border px-2 py-2 text-left",
                  noteSelected
                    ? dark
                      ? "border-[#69daff] bg-[#11232b] text-[#69daff]"
                      : "border-[#0b7285] bg-[#e3f8fb] text-[#0b7285]"
                    : dark
                      ? "border-[#22272f] bg-[#0f1318] text-[#c7d2da] hover:bg-[#161c24]"
                      : "border-[#c7d6ce] bg-[#f8fcf9] text-[#334155] hover:bg-[#edf6f1]",
                )}
                key={note.id}
                onClick={() => onSelectNote(note)}
                style={{ marginLeft: `${(depth + 1) * 14}px` }}
                type="button"
              >
                <span
                  className={cn(
                    "font-pixel text-[8px] uppercase tracking-[0.14em]",
                    noteSelected
                      ? dark
                        ? "text-[#9fdfff]"
                        : "text-[#0b7285]"
                      : dark
                        ? "text-[#7f8a96]"
                        : "text-[#64748b]",
                  )}
                >
                  FILE
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {note.title || "Untitled"}
                </span>
              </button>
            );
          })}

          {children.map((childFolder) => (
            <FolderTreeNode
              dark={dark}
              depth={depth + 1}
              expandedFolderIds={expandedFolderIds}
              folder={childFolder}
              key={childFolder.id}
              onMoveNote={onMoveNote}
              onSelectNote={onSelectNote}
              onSelectFolder={onSelectFolder}
              onToggleFolder={onToggleFolder}
              selectedFolderId={selectedFolderId}
              selectedNoteFolderId={selectedNoteFolderId}
              selectedNoteId={selectedNoteId}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function NotesWorkspacePage({ theme }: NotesWorkspacePageProps) {
  const dark = theme === "dark";
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNoteFolderId, setSelectedNoteFolderId] = useState<string | null>(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());
  const [folderName, setFolderName] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [mainTab, setMainTab] = useState<"editor" | "knowledge">("editor");
  const [knowledgeMode, setKnowledgeMode] = useState("hybrid");
  const [knowledgeQuestion, setKnowledgeQuestion] = useState("");
  const [knowledgeAnswer, setKnowledgeAnswer] = useState<string | null>(null);
  const [knowledgeIngestSummary, setKnowledgeIngestSummary] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const didAutoSelectRef = useRef(false);
  const autosaveSignatureRef = useRef<string | null>(null);

  const foldersQuery = useBackendRootFoldersQuery();
  const rootFolders = useMemo(() => foldersQuery.data ?? [], [foldersQuery.data]);
  const selectedFolderQuery = useBackendFolderDetailsQuery(selectedFolderId);

  const createFolderMutation = useBackendCreateFolderMutation();
  const createNoteMutation = useBackendCreateNoteMutation();
  const updateNoteMutation = useBackendUpdateNoteMutation();
  const deleteNoteMutation = useBackendDeleteNoteMutation();
  const knowledgeGraphQuery = useBackendKnowledgeGraphDataQuery();
  const knowledgeIngestStatusQuery = useBackendKnowledgeIngestStatusQuery({
    enabled: mainTab === "knowledge",
  });
  const knowledgeIngestMutation = useBackendKnowledgeIngestMutation();
  const knowledgeQueryMutation = useBackendKnowledgeQueryMutation();
  const deleteKnowledgeGraphMutation = useBackendDeleteKnowledgeGraphMutation();

  const noteList = useMemo(() => selectedFolderQuery.data?.notes ?? [], [selectedFolderQuery.data]);
  const selectedNote = useMemo(
    () => noteList.find((note) => note.id === selectedNoteId) ?? null,
    [noteList, selectedNoteId],
  );
  const selectedFolderName = useMemo(
    () => rootFolders.find((folder) => folder.id === selectedFolderId)?.name ?? selectedFolderQuery.data?.name ?? null,
    [rootFolders, selectedFolderId, selectedFolderQuery.data?.name],
  );

  useEffect(() => {
    if (didAutoSelectRef.current || selectedFolderId || rootFolders.length === 0) {
      return;
    }

    const firstFolderId = rootFolders[0]?.id;
    if (!firstFolderId) {
      return;
    }

    didAutoSelectRef.current = true;
    const frame = window.requestAnimationFrame(() => {
      setSelectedFolderId(firstFolderId);
      setExpandedFolderIds(new Set([firstFolderId]));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [rootFolders, selectedFolderId]);

  useEffect(() => {
    if (!selectedNoteId) {
      autosaveSignatureRef.current = null;
      return;
    }

    const normalizedTitle = noteTitle.trim() || "Untitled";
    const signature = `${selectedNoteId}::${selectedNoteFolderId ?? ""}::${normalizedTitle}::${noteContent}`;

    if (autosaveSignatureRef.current === signature || updateNoteMutation.isPending) {
      return;
    }

    const timer = window.setTimeout(() => {
      void updateNoteMutation
        .mutateAsync({
          noteId: selectedNoteId,
          payload: {
            content: noteContent,
            folder_id: selectedNoteFolderId,
            title: normalizedTitle,
          },
          previousFolderId: selectedNoteFolderId,
        })
        .then(() => {
          autosaveSignatureRef.current = signature;
          setStatusMessage(`Auto-saved ${new Date().toLocaleTimeString()}`);
        })
        .catch((error) => {
          setStatusMessage(error instanceof Error ? error.message : "Auto-save failed.");
        });
    }, 900);

    return () => window.clearTimeout(timer);
  }, [
    noteContent,
    noteTitle,
    selectedNoteFolderId,
    selectedNoteId,
    updateNoteMutation,
    updateNoteMutation.isPending,
  ]);

  useEffect(() => {
    if (mainTab !== "knowledge") {
      return;
    }

    const processingDocs = knowledgeIngestStatusQuery.data?.processing_docs ?? 0;
    if (processingDocs <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      void knowledgeGraphQuery.refetch();
    }, 3000);

    return () => window.clearInterval(timer);
  }, [
    knowledgeGraphQuery,
    knowledgeIngestStatusQuery.data?.processing_docs,
    mainTab,
  ]);

  useEffect(() => {
    if (!selectedNoteId) {
      return;
    }

    const stillExists = noteList.some((note) => note.id === selectedNoteId);
    if (!stillExists) {
      const frame = window.requestAnimationFrame(() => {
        setSelectedNoteId(null);
        setSelectedNoteFolderId(null);
        setNoteTitle("");
        setNoteContent("");
        autosaveSignatureRef.current = null;
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, [noteList, selectedNoteId]);

  function handleSelectFolder(folderId: string) {
    setSelectedFolderId(folderId);
    setExpandedFolderIds((current) => {
      const next = new Set(current);
      next.add(folderId);
      return next;
    });
  }

  function handleToggleFolder(folderId: string) {
    setExpandedFolderIds((current) => {
      const next = new Set(current);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }

  function clearSelectedFolder() {
    setSelectedFolderId(null);
    setSelectedNoteId(null);
    setSelectedNoteFolderId(null);
    setNoteTitle("");
    setNoteContent("");
    setStatusMessage("Explorer set to root.");
  }

  function handleSelectNote(note: NoteResponse) {
    const nextFolderId = note.folder_id ?? selectedFolderId ?? null;
    setSelectedFolderId(nextFolderId);
    setSelectedNoteId(note.id);
    setSelectedNoteFolderId(nextFolderId);
    setNoteTitle(note.title ?? "");
    setNoteContent(note.content ?? "");
    const normalizedTitle = (note.title ?? "").trim() || "Untitled";
    autosaveSignatureRef.current = `${note.id}::${note.folder_id ?? ""}::${normalizedTitle}::${note.content ?? ""}`;
    setKnowledgeIngestSummary(null);
    setKnowledgeAnswer(null);
    setMainTab("editor");
    if (nextFolderId) {
      setExpandedFolderIds((current) => {
        const next = new Set(current);
        next.add(nextFolderId);
        return next;
      });
    }
  }

  async function handleMoveNote(targetFolderId: string) {
    if (!selectedNoteId) {
      return;
    }

    try {
      await updateNoteMutation.mutateAsync({
        noteId: selectedNoteId,
        payload: {
          content: noteContent,
          folder_id: targetFolderId,
          title: noteTitle.trim() || "Untitled",
        },
        previousFolderId: selectedNoteFolderId,
      });

      setSelectedFolderId(targetFolderId);
      setSelectedNoteFolderId(targetFolderId);
      autosaveSignatureRef.current = `${selectedNoteId}::${targetFolderId}::${noteTitle.trim() || "Untitled"}::${noteContent}`;
      setStatusMessage("Note moved.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to move note.");
    }
  }

  async function handleCreateFolder() {
    const trimmed = folderName.trim();

    if (!trimmed) {
      setStatusMessage("Folder name is required.");
      return;
    }

    try {
      const folder = await createFolderMutation.mutateAsync({
        name: trimmed,
        parent_id: selectedFolderId,
      });

      setFolderName("");
      setSelectedFolderId(folder.id);
      setExpandedFolderIds((current) => {
        const next = new Set(current);
        if (selectedFolderId) {
          next.add(selectedFolderId);
        }
        next.add(folder.id);
        return next;
      });
      setStatusMessage("Folder created.");
      await foldersQuery.refetch();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to create folder.");
    }
  }

  async function handleCreateNote() {
    if (!selectedFolderId) {
      setStatusMessage("Select a folder first.");
      return;
    }

    try {
      const now = new Date();
      const note = await createNoteMutation.mutateAsync({
        content: "",
        folder_id: selectedFolderId,
        title: `Untitled ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
      });

      handleSelectNote(note);
      setStatusMessage("Note created.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to create note.");
    }
  }

  async function handleSaveNote() {
    if (!selectedNoteId) {
      setStatusMessage("Select or create a note first.");
      return;
    }

    const normalizedTitle = noteTitle.trim() || "Untitled";

    try {
      await updateNoteMutation.mutateAsync({
        noteId: selectedNoteId,
        payload: {
          content: noteContent,
          folder_id: selectedNoteFolderId,
          title: normalizedTitle,
        },
        previousFolderId: selectedNoteFolderId,
      });

      autosaveSignatureRef.current = `${selectedNoteId}::${selectedNoteFolderId ?? ""}::${normalizedTitle}::${noteContent}`;
      setStatusMessage("Saved.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to save note.");
    }
  }

  async function handleDeleteNote() {
    if (!selectedNoteId) {
      return;
    }

    const confirmed = window.confirm("Delete this note?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteNoteMutation.mutateAsync(selectedNoteId);
      setSelectedNoteId(null);
      setSelectedNoteFolderId(null);
      setNoteTitle("");
      setNoteContent("");
      autosaveSignatureRef.current = null;
      setKnowledgeIngestSummary(null);
      setKnowledgeAnswer(null);
      setStatusMessage("Note deleted.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to delete note.");
    }
  }

  async function handleIngestNoteToKnowledge() {
    if (!selectedNoteId) {
      setStatusMessage("Select a note first.");
      return;
    }

    if (!noteContent.trim()) {
      setStatusMessage("Note content is empty.");
      return;
    }

    try {
      const response = await knowledgeIngestMutation.mutateAsync({
        content: noteContent,
        title: noteTitle.trim() || null,
      });
      setKnowledgeIngestSummary(response.message || "Ingested successfully.");
      setStatusMessage("Knowledge ingest completed.");
      await knowledgeGraphQuery.refetch();
      await knowledgeIngestStatusQuery.refetch();
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to ingest note into knowledge graph.",
      );
    }
  }

  async function handleDeleteKnowledgeGraph() {
    const confirmed = window.confirm("Reset knowledge graph? This action is irreversible.");
    if (!confirmed) {
      return;
    }

    try {
      await deleteKnowledgeGraphMutation.mutateAsync();
      setKnowledgeIngestSummary("Knowledge graph reset.");
      setKnowledgeAnswer(null);
      setStatusMessage("Knowledge graph deleted.");
      await knowledgeGraphQuery.refetch();
      await knowledgeIngestStatusQuery.refetch();
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to delete knowledge graph.",
      );
    }
  }

  async function handleAskKnowledge() {
    if (!knowledgeQuestion.trim()) {
      setStatusMessage("Enter a question for knowledge query.");
      return;
    }

    try {
      const response = await knowledgeQueryMutation.mutateAsync({
        mode: knowledgeMode,
        question: knowledgeQuestion.trim(),
      });
      setKnowledgeAnswer(response.answer);
      setStatusMessage("Knowledge query completed.");
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to query knowledge graph.",
      );
    }
  }

  return (
    <WorkspaceShell
      active="notes"
      headerActions={
        <div className="flex flex-wrap items-center gap-3">
          {statusMessage ? (
            <div
              className={cn(
                "border px-3 py-2 font-pixel text-[9px] uppercase tracking-[0.16em]",
                dark
                  ? "border-[#27303d] bg-[#0d1419] text-[#69daff]"
                  : "border-[#9eb2aa] bg-[#eef9f2] text-[#0b7285]",
              )}
            >
              {statusMessage}
            </div>
          ) : null}
          <ThemeToggle />
        </div>
      }
      subtitle="Notes Dashboard"
      theme={theme}
      title="Pixel Markdown Vault"
    >
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside
          className={cn(
            "min-h-0 border p-4",
            dark
              ? "border-[#262626] bg-[#0c0f12]"
              : "border-[#9eb2aa] bg-[linear-gradient(180deg,#f9fffb_0%,#eef7f1_100%)]",
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b pb-4">
            <div>
              <div
                className={cn(
                  "font-pixel text-[10px] uppercase tracking-[0.18em]",
                  dark ? "text-[#69daff]" : "text-[#0b7285]",
                )}
              >
                Explorer
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold uppercase tracking-[0.05em]">
                VS code style explorer
              </h2>
              <p className={cn("mt-2 text-sm leading-6", dark ? "text-[#9aa0a6]" : "text-[#516172]")}>
                Mo folder de thay note ben trong ngay trong cay ben trai, giong file explorer.
              </p>
            </div>
            <div
              className={cn(
                "border px-3 py-2 font-pixel text-[9px] uppercase tracking-[0.14em]",
                dark
                  ? "border-[#27303d] bg-[#11181e] text-[#9cff93]"
                  : "border-[#9eb2aa] bg-[#f4fff8] text-[#0f9f62]",
              )}
            >
              {rootFolders.length} folders
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="grid gap-2">
              <label
                className={cn(
                  "font-pixel text-[9px] uppercase tracking-[0.16em]",
                  dark ? "text-[#7b8794]" : "text-[#5f7280]",
                )}
              >
                New folder
              </label>
              <div className="flex gap-2">
                <input
                  className={cn(
                    "w-full border px-3 py-2 text-sm outline-none",
                    dark
                      ? "border-[#262626] bg-[#131313] text-white placeholder:text-[#767575]"
                      : "border-[#9eb2aa] bg-[#fcfffd] text-[#0f172a] placeholder:text-[#7a8794]",
                  )}
                  onChange={(event) => setFolderName(event.target.value)}
                  placeholder={selectedFolderId ? "Create folder inside selected folder" : "Create root folder"}
                  value={folderName}
                />
                <button
                  className={cn(
                    "shrink-0 border px-3 py-2 font-pixel text-[10px] uppercase",
                    dark
                      ? "border-[#27303d] bg-[#11181e] text-[#adaaaa] hover:bg-[#1a2229]"
                      : "border-[#9eb2aa] bg-[#f6fbf7] text-[#425466] hover:bg-[#e7f0eb]",
                  )}
                  onClick={clearSelectedFolder}
                  type="button"
                >
                  Root
                </button>
                <button
                  className={cn(
                    "shrink-0 border px-3 py-2 font-pixel text-[10px] uppercase",
                    dark
                      ? "border-[#27303d] bg-[#11181e] text-[#9cff93] hover:bg-[#182317]"
                      : "border-[#9eb2aa] bg-[#f4fff8] text-[#0f9f62] hover:bg-[#e4f8eb]",
                  )}
                  disabled={createFolderMutation.isPending}
                  onClick={handleCreateFolder}
                  type="button"
                >
                  Add
                </button>
              </div>
            </div>

            <div
              className={cn(
                "border p-3",
                dark ? "border-[#262626] bg-[#101214]" : "border-[#aab8b0] bg-[#fbfffc]",
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div
                  className={cn(
                    "font-pixel text-[9px] uppercase tracking-[0.16em]",
                    dark ? "text-[#69daff]" : "text-[#0b7285]",
                  )}
                >
                  Explorer tree
                </div>
                <button
                  className={cn(
                    "border px-3 py-2 font-pixel text-[10px] uppercase",
                    dark
                      ? "border-[#27303d] bg-[#11181e] text-[#9cff93] hover:bg-[#182317]"
                      : "border-[#9eb2aa] bg-[#f4fff8] text-[#0f9f62] hover:bg-[#e4f8eb]",
                  )}
                  disabled={!selectedFolderId || createNoteMutation.isPending}
                  onClick={handleCreateNote}
                  type="button"
                >
                  New note
                </button>
              </div>

              <div className="max-h-[640px] overflow-y-auto pr-1">
                {rootFolders.length === 0 ? (
                  <p className={cn("text-sm", dark ? "text-[#767575]" : "text-[#64748b]")}>
                    No folder yet. Create one to start writing notes.
                  </p>
                ) : (
                  rootFolders.map((folder) => (
                    <FolderTreeNode
                      dark={dark}
                      depth={0}
                      expandedFolderIds={expandedFolderIds}
                      folder={folder}
                      key={folder.id}
                      onMoveNote={handleMoveNote}
                      onSelectNote={handleSelectNote}
                      onSelectFolder={handleSelectFolder}
                      onToggleFolder={handleToggleFolder}
                      selectedFolderId={selectedFolderId}
                      selectedNoteFolderId={selectedNoteFolderId}
                      selectedNoteId={selectedNoteId}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>

        <section
          className={cn(
            "min-h-0 border p-4 lg:p-5",
            dark
              ? "border-[#262626] bg-[#0c0f12]"
              : "border-[#9eb2aa] bg-[linear-gradient(180deg,#fdfefd_0%,#f2f8f4_100%)]",
          )}
        >
          <div className="flex flex-wrap items-center gap-2 border-b pb-4">
            {(["editor", "knowledge"] as const).map((tab) => (
              <button
                className={cn(
                  "border px-3 py-2 font-pixel text-[10px] uppercase",
                  mainTab === tab
                    ? tab === "knowledge"
                      ? dark
                        ? "border-[#69daff] bg-[#11232b] text-[#69daff]"
                        : "border-[#0b7285] bg-[#e3f8fb] text-[#0b7285]"
                      : dark
                        ? "border-[#9cff93] bg-[#182317] text-[#9cff93]"
                        : "border-[#0f9f62] bg-[#e4f8eb] text-[#0f7a4c]"
                    : dark
                      ? "border-[#27303d] bg-[#11181e] text-[#adaaaa] hover:bg-[#1a2229]"
                      : "border-[#aab8b0] bg-[#f6fbf7] text-[#475569] hover:bg-[#e7f0eb]",
                )}
                key={tab}
                onClick={() => setMainTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
            <button
              className={cn(
                "border px-3 py-2 font-pixel text-[10px] uppercase",
                dark
                  ? "border-[#27303d] bg-[#11181e] text-[#9cff93] hover:bg-[#182317]"
                  : "border-[#aab8b0] bg-[#f4fff8] text-[#0f9f62] hover:bg-[#e4f8eb]",
              )}
              disabled={!selectedNoteId || updateNoteMutation.isPending}
              onClick={handleSaveNote}
              type="button"
            >
              Save now
            </button>
            <button
              className={cn(
                "border px-3 py-2 font-pixel text-[10px] uppercase",
                dark
                  ? "border-[#5b2020] bg-[#1c0b0b] text-[#ff9c9c] hover:bg-[#2a1111]"
                  : "border-[#d9a3a3] bg-[#fff3f3] text-[#b42318] hover:bg-[#ffe5e5]",
              )}
              disabled={!selectedNoteId || deleteNoteMutation.isPending}
              onClick={handleDeleteNote}
              type="button"
            >
              Delete
            </button>
            {selectedNoteId && selectedNoteFolderId ? (
              <div
                className={cn(
                  "border px-2 py-1 text-[10px] uppercase",
                  dark
                    ? "border-[#27303d] text-[#9aa0a6]"
                    : "border-[#aab8b0] text-[#5f7280]",
                )}
              >
                Move note by pressing `Move` on any folder
              </div>
            ) : null}
          </div>

          {mainTab === "editor" ? (
            selectedNote ? (
              <div className="mt-4 space-y-3">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                  <input
                    className={cn(
                      "w-full border px-4 py-3 text-lg font-semibold outline-none",
                      dark
                        ? "border-[#262626] bg-[#131313] text-white placeholder:text-[#767575]"
                        : "border-[#9eb2aa] bg-[#fcfffd] text-[#0f172a] placeholder:text-[#7a8794]",
                    )}
                    onChange={(event) => setNoteTitle(event.target.value)}
                    placeholder="Note title"
                    value={noteTitle}
                  />
                  <div
                    className={cn(
                      "flex items-center justify-between border px-4 py-3 text-sm",
                      dark
                        ? "border-[#262626] bg-[#111315] text-[#d4d4d4]"
                        : "border-[#9eb2aa] bg-[#f6fbf7] text-[#334155]",
                    )}
                  >
                    <span>Current folder</span>
                    <span className="font-semibold">{selectedFolderName ?? "Unassigned"}</span>
                  </div>
                </div>

                <NotesMarkdownEditor dark={dark} onChange={setNoteContent} value={noteContent} />
              </div>
            ) : (
              <div
                className={cn(
                  "mt-4 flex min-h-[560px] items-center justify-center border text-sm",
                  dark
                    ? "border-[#262626] bg-[#101010] text-[#767575]"
                    : "border-[#aab8b0] bg-[#fcfffd] text-[#64748b]",
                )}
              >
                Select a folder and note to start editing.
              </div>
            )
          ) : (
            <div className="mt-4 space-y-3">
              <div
                className={cn(
                  "grid gap-2 border p-3 lg:grid-cols-[auto_auto_auto_1fr_auto]",
                  dark ? "border-[#262626] bg-[#101010]" : "border-[#aab8b0] bg-[#fcfffd]",
                )}
              >
                <button
                  className={cn(
                    "border px-3 py-2 font-pixel text-[10px] uppercase",
                    dark
                      ? "border-[#27303d] bg-[#11181e] text-[#9cff93] hover:bg-[#182317]"
                      : "border-[#aab8b0] bg-[#f4fff8] text-[#0f9f62] hover:bg-[#e4f8eb]",
                  )}
                  disabled={!selectedNoteId || knowledgeIngestMutation.isPending}
                  onClick={handleIngestNoteToKnowledge}
                  type="button"
                >
                  {knowledgeIngestMutation.isPending ? "Ingesting..." : "Ingest note"}
                </button>
                <button
                  className={cn(
                    "border px-3 py-2 font-pixel text-[10px] uppercase",
                    dark
                      ? "border-[#27303d] bg-[#11181e] text-[#69daff] hover:bg-[#13202b]"
                      : "border-[#aab8b0] bg-[#f6fbf7] text-[#0b7285] hover:bg-[#e6f2ee]",
                  )}
                  disabled={knowledgeGraphQuery.isFetching}
                  onClick={() => {
                    void knowledgeGraphQuery.refetch();
                    void knowledgeIngestStatusQuery.refetch();
                  }}
                  type="button"
                >
                  Refresh graph
                </button>
                <button
                  className={cn(
                    "border px-3 py-2 font-pixel text-[10px] uppercase",
                    dark
                      ? "border-[#5b2020] bg-[#1c0b0b] text-[#ff9c9c] hover:bg-[#2a1111]"
                      : "border-[#d9a3a3] bg-[#fff3f3] text-[#b42318] hover:bg-[#ffe5e5]",
                  )}
                  disabled={deleteKnowledgeGraphMutation.isPending}
                  onClick={handleDeleteKnowledgeGraph}
                  type="button"
                >
                  Reset graph
                </button>
                <input
                  className={cn(
                    "w-full border px-3 py-2 text-sm outline-none",
                    dark
                      ? "border-[#262626] bg-[#131313] text-white placeholder:text-[#767575]"
                      : "border-[#aab8b0] bg-[#fcfffd] text-[#0f172a] placeholder:text-[#7a8794]",
                  )}
                  onChange={(event) => setKnowledgeQuestion(event.target.value)}
                  placeholder="Ask knowledge graph..."
                  value={knowledgeQuestion}
                />
                <div className="flex gap-2">
                  <select
                    className={cn(
                      "border px-3 py-2 text-sm outline-none",
                      dark
                        ? "border-[#262626] bg-[#131313] text-white"
                        : "border-[#aab8b0] bg-[#fcfffd] text-[#0f172a]",
                    )}
                    onChange={(event) => setKnowledgeMode(event.target.value)}
                    value={knowledgeMode}
                  >
                    <option value="hybrid">hybrid</option>
                    <option value="global">global</option>
                    <option value="local">local</option>
                  </select>
                  <button
                    className={cn(
                      "border px-3 py-2 font-pixel text-[10px] uppercase",
                      dark
                        ? "border-[#27303d] bg-[#11181e] text-[#69daff] hover:bg-[#13202b]"
                        : "border-[#aab8b0] bg-[#f6fbf7] text-[#0b7285] hover:bg-[#e6f2ee]",
                    )}
                    disabled={knowledgeQueryMutation.isPending}
                    onClick={handleAskKnowledge}
                    type="button"
                  >
                    Ask
                  </button>
                </div>
              </div>

              {knowledgeIngestSummary ? (
                <div
                  className={cn(
                    "border p-3 text-sm",
                    dark
                      ? "border-[#27303d] bg-[#10161b] text-[#9cff93]"
                      : "border-[#9eb2aa] bg-[#f0fff3] text-[#166534]",
                  )}
                >
                  {knowledgeIngestSummary}
                </div>
              ) : null}

              {knowledgeIngestStatusQuery.data ? (
                <div
                  className={cn(
                    "border p-3 text-sm",
                    dark
                      ? "border-[#262626] bg-[#101010] text-[#d4d4d4]"
                      : "border-[#aab8b0] bg-[#fcfffd] text-[#334155]",
                  )}
                >
                  Docs: {knowledgeIngestStatusQuery.data.total_docs} | processed:{" "}
                  {knowledgeIngestStatusQuery.data.processed_docs} | processing:{" "}
                  {knowledgeIngestStatusQuery.data.processing_docs} | failed:{" "}
                  {knowledgeIngestStatusQuery.data.failed_docs} | graph:{" "}
                  {knowledgeIngestStatusQuery.data.graph_nodes} nodes,{" "}
                  {knowledgeIngestStatusQuery.data.graph_edges} edges
                  {knowledgeIngestStatusQuery.data.documents.length ? (
                    <div className={cn("mt-2 space-y-1 text-xs", dark ? "text-[#9aa0a6]" : "text-[#475569]")}>
                      {knowledgeIngestStatusQuery.data.documents.slice(0, 3).map((documentStatus) => (
                        <div className="truncate" key={documentStatus.doc_id}>
                          [{documentStatus.status}]{" "}
                          {(documentStatus.content_summary ?? documentStatus.doc_id)
                            .replace(/\s+/g, " ")
                            .trim()}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {knowledgeAnswer ? (
                <div
                  className={cn(
                    "border p-3 text-sm whitespace-pre-wrap",
                    dark
                      ? "border-[#262626] bg-[#101010] text-[#d4d4d4]"
                      : "border-[#aab8b0] bg-[#fcfffd] text-[#334155]",
                  )}
                >
                  {knowledgeAnswer}
                </div>
              ) : null}

              <KnowledgeGraphVisualizer dark={dark} graph={knowledgeGraphQuery.data} />
            </div>
          )}
        </section>
      </div>
    </WorkspaceShell>
  );
}
