"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { KnowledgeGraphVisualizer } from "@/app/_components/knowledge-graph-visualizer";
import { useTheme } from "@/app/_components/theme-provider";
import { NotesMarkdownEditor } from "@/app/_components/notes-markdown-editor";
import { cn } from "@/app/_components/ui-kit/shared";
import {
  useBackendCreateFolderMutation,
  useBackendDeleteKnowledgeGraphMutation,
  useBackendCreateNoteMutation,
  useBackendDeleteNoteMutation,
  useBackendFolderDetailsQuery,
  useBackendKnowledgeGraphDataQuery,
  useBackendKnowledgeIngestStatusQuery,
  useBackendKnowledgeIngestMutation,
  useBackendKnowledgeQueryMutation,
  useBackendRootFoldersQuery,
  useBackendUpdateNoteMutation,
} from "@/hooks/use-backend-api";
import type { FolderResponse, NoteResponse } from "@/lib/api/frontend";

type FolderTreeNodeProps = {
  dark: boolean;
  depth: number;
  expandedFolderIds: Set<string>;
  folder: FolderResponse;
  onMoveNote: (targetFolderId: string) => Promise<void>;
  onSelectFolder: (folderId: string) => void;
  onToggleFolder: (folderId: string) => void;
  selectedFolderId: string | null;
  selectedNoteId: string | null;
  selectedNoteFolderId: string | null;
};

function FolderTreeNode({
  dark,
  depth,
  expandedFolderIds,
  folder,
  onMoveNote,
  onSelectFolder,
  onToggleFolder,
  selectedFolderId,
  selectedNoteId,
  selectedNoteFolderId,
}: FolderTreeNodeProps) {
  const isExpanded = expandedFolderIds.has(folder.id);
  const shouldLoadChildren = isExpanded || selectedFolderId === folder.id;
  const folderQuery = useBackendFolderDetailsQuery(folder.id, {
    enabled: shouldLoadChildren,
  });
  const children = folderQuery.data?.subfolders ?? [];
  const canMoveHere = Boolean(selectedNoteId) && selectedNoteFolderId !== folder.id;
  const isSelected = selectedFolderId === folder.id;

  return (
    <div>
      <div
        className={cn(
          "mb-1 flex items-center gap-1 border px-2 py-1.5",
          isSelected
            ? dark
              ? "border-[#9cff93] bg-[#1d2a1b] text-[#9cff93]"
              : "border-[#006e17] bg-[#dff5e2] text-[#006e17]"
            : dark
              ? "border-[#262626] bg-[#131313] text-[#d4d4d4]"
              : "border-[#b5c0ca] bg-white text-[#1f2937]",
        )}
        style={{ marginLeft: `${depth * 12}px` }}
      >
        <button
          aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
          className={cn(
            "inline-flex h-6 w-6 shrink-0 items-center justify-center border text-xs",
            dark
              ? "border-[#262626] text-[#69daff] hover:bg-[#1f1f1f]"
              : "border-[#9aa7b3] text-[#00677d] hover:bg-[#d9e0e6]",
          )}
          onClick={() => onToggleFolder(folder.id)}
          type="button"
        >
          {isExpanded ? "−" : "+"}
        </button>

        <button
          className="min-w-0 flex-1 truncate text-left text-sm"
          onClick={() => onSelectFolder(folder.id)}
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
                ? "border-[#262626] text-[#69daff] hover:bg-[#11232b]"
                : "border-[#9aa7b3] text-[#00677d] hover:bg-[#dff4fa]",
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
            <div
              className={cn(
                "mb-2 ml-8 text-xs",
                dark ? "text-[#767575]" : "text-[#64748b]",
              )}
            >
              Loading...
            </div>
          ) : null}

          {children.map((childFolder) => (
            <FolderTreeNode
              dark={dark}
              depth={depth + 1}
              expandedFolderIds={expandedFolderIds}
              folder={childFolder}
              key={childFolder.id}
              onMoveNote={onMoveNote}
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

export function GlobalNotesDrawer() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [open, setOpen] = useState(false);
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

  const foldersQuery = useBackendRootFoldersQuery();
  const rootFolders = useMemo(() => foldersQuery.data ?? [], [foldersQuery.data]);
  const effectiveFolderId = selectedFolderId ?? rootFolders[0]?.id ?? null;
  const selectedFolderQuery = useBackendFolderDetailsQuery(effectiveFolderId);

  const createFolderMutation = useBackendCreateFolderMutation();
  const createNoteMutation = useBackendCreateNoteMutation();
  const updateNoteMutation = useBackendUpdateNoteMutation();
  const deleteNoteMutation = useBackendDeleteNoteMutation();
  const knowledgeGraphQuery = useBackendKnowledgeGraphDataQuery();
  const knowledgeIngestStatusQuery = useBackendKnowledgeIngestStatusQuery({
    enabled: open && mainTab === "knowledge",
  });
  const knowledgeIngestMutation = useBackendKnowledgeIngestMutation();
  const knowledgeQueryMutation = useBackendKnowledgeQueryMutation();
  const deleteKnowledgeGraphMutation = useBackendDeleteKnowledgeGraphMutation();

  const noteList = useMemo(() => selectedFolderQuery.data?.notes ?? [], [selectedFolderQuery.data]);
  const selectedNote = useMemo(
    () => noteList.find((note) => note.id === selectedNoteId) ?? null,
    [noteList, selectedNoteId],
  );
  const autosaveSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "n") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onOpenNotes = () => setOpen(true);

    window.addEventListener("versera:notes:open", onOpenNotes as EventListener);
    return () =>
      window.removeEventListener("versera:notes:open", onOpenNotes as EventListener);
  }, []);

  useEffect(() => {
    if (!selectedNoteId) {
      autosaveSignatureRef.current = null;
      return;
    }

    const normalizedTitle = noteTitle.trim() || "Untitled";
    const signature = `${selectedNoteId}::${selectedNoteFolderId ?? ""}::${normalizedTitle}::${noteContent}`;

    if (autosaveSignatureRef.current === signature) {
      return;
    }

    if (updateNoteMutation.isPending) {
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
    if (!open || mainTab !== "knowledge") {
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
    knowledgeGraphQuery.refetch,
    knowledgeIngestStatusQuery.data?.processing_docs,
    mainTab,
    open,
  ]);

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
  }

  function handleSelectNote(note: NoteResponse) {
    setSelectedNoteId(note.id);
    setSelectedNoteFolderId(note.folder_id ?? effectiveFolderId ?? null);
    setNoteTitle(note.title ?? "");
    setNoteContent(note.content ?? "");
    const normalizedTitle = (note.title ?? "").trim() || "Untitled";
    autosaveSignatureRef.current = `${note.id}::${note.folder_id ?? ""}::${normalizedTitle}::${note.content ?? ""}`;
    setKnowledgeIngestSummary(null);
    setKnowledgeAnswer(null);
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
      await selectedFolderQuery.refetch();
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
        next.add(folder.id);
        return next;
      });
      setStatusMessage("Folder created.");
      await foldersQuery.refetch();
      await selectedFolderQuery.refetch();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to create folder.");
    }
  }

  async function handleCreateNote() {
    if (!effectiveFolderId) {
      setStatusMessage("Create/select a folder first.");
      return;
    }

    try {
      const now = new Date();
      const note = await createNoteMutation.mutateAsync({
        content: "",
        folder_id: effectiveFolderId,
        title: `Untitled ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
      });

      setSelectedNoteId(note.id);
      setSelectedNoteFolderId(note.folder_id ?? effectiveFolderId);
      setNoteTitle(note.title ?? "");
      setNoteContent(note.content ?? "");
      autosaveSignatureRef.current = `${note.id}::${note.folder_id ?? effectiveFolderId}::${note.title ?? ""}::${note.content ?? ""}`;
      setStatusMessage("Note created.");
      await selectedFolderQuery.refetch();
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
      await selectedFolderQuery.refetch();
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
      await selectedFolderQuery.refetch();
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
    <>
      {open ? (
        <div className="fixed inset-0 z-[60]">
          <button
            aria-label="Close notes"
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            type="button"
          />

          <section
            className={cn(
              "absolute right-0 top-0 h-full w-full max-w-[96vw] border-l shadow-2xl",
              dark ? "border-[#262626] bg-[#0e0e0e]" : "border-[#b5c0ca] bg-[#f3f7fb]",
            )}
          >
            <div
              className={cn(
                "flex h-14 items-center justify-between border-b px-5",
                dark ? "border-[#262626]" : "border-[#b5c0ca]",
              )}
            >
              <div
                className={cn(
                  "font-display text-lg font-bold uppercase tracking-[0.12em]",
                  dark ? "text-[#9cff93]" : "text-[#006e17]",
                )}
              >
                Notes Workspace
              </div>
              <button
                className={cn(
                  "rounded-none border px-3 py-1 font-pixel text-[10px] uppercase",
                  dark
                    ? "border-[#262626] text-[#adaaaa] hover:bg-[#1f1f1f]"
                    : "border-[#9aa7b3] text-[#334155] hover:bg-[#d9e0e6]",
                )}
                onClick={() => setOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="grid h-[calc(100%-56px)] min-h-0 grid-cols-1 lg:grid-cols-[300px_260px_minmax(0,1fr)]">
              <aside
                className={cn(
                  "cyber-scrollbar min-h-0 overflow-y-auto border-r p-4",
                  dark ? "border-[#262626]" : "border-[#b5c0ca]",
                )}
                onClick={(event) => {
                  if (event.target === event.currentTarget) {
                    clearSelectedFolder();
                  }
                }}
              >
                <div
                  className={cn(
                    "mb-2 font-pixel text-[10px] uppercase tracking-[0.1em]",
                    dark ? "text-[#69daff]" : "text-[#00677d]",
                  )}
                >
                  Folder Tree
                </div>
                <div className="mb-3 flex gap-2">
                  <input
                    className={cn(
                      "w-full border px-3 py-2 text-sm outline-none",
                      dark
                        ? "border-[#262626] bg-[#131313] text-white placeholder:text-[#767575]"
                        : "border-[#9aa7b3] bg-white text-[#0f172a] placeholder:text-[#64748b]",
                    )}
                    onChange={(event) => setFolderName(event.target.value)}
                    placeholder={
                      selectedFolderId
                        ? "Create folder inside selected folder"
                        : "Create root folder"
                    }
                    value={folderName}
                  />
                  <button
                    className={cn(
                      "shrink-0 border px-3 py-2 font-pixel text-[10px] uppercase",
                      dark
                        ? "border-[#262626] text-[#adaaaa] hover:bg-[#1f1f1f]"
                        : "border-[#9aa7b3] text-[#334155] hover:bg-[#d9e0e6]",
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
                        ? "border-[#262626] text-[#9cff93] hover:bg-[#1f1f1f]"
                        : "border-[#9aa7b3] text-[#006e17] hover:bg-[#d9e0e6]",
                    )}
                    disabled={createFolderMutation.isPending}
                    onClick={handleCreateFolder}
                    type="button"
                  >
                    Add
                  </button>
                </div>

                <div
                  className="space-y-1"
                  onClick={(event) => {
                    if (event.target === event.currentTarget) {
                      clearSelectedFolder();
                    }
                  }}
                >
                  {rootFolders.map((folder) => (
                    <FolderTreeNode
                      dark={dark}
                      depth={0}
                      expandedFolderIds={expandedFolderIds}
                      folder={folder}
                      key={folder.id}
                      onMoveNote={handleMoveNote}
                      onSelectFolder={handleSelectFolder}
                      onToggleFolder={handleToggleFolder}
                      selectedFolderId={selectedFolderId}
                      selectedNoteFolderId={selectedNoteFolderId}
                      selectedNoteId={selectedNoteId}
                    />
                  ))}
                </div>

                {rootFolders.length === 0 ? (
                  <p
                    className={cn(
                      "mt-4 text-xs",
                      dark ? "text-[#767575]" : "text-[#64748b]",
                    )}
                  >
                    No folder yet. Create one to start writing notes.
                  </p>
                ) : null}
              </aside>

              <aside
                className={cn(
                  "cyber-scrollbar min-h-0 overflow-y-auto border-r p-4",
                  dark ? "border-[#262626]" : "border-[#b5c0ca]",
                )}
              >
                <div
                  className={cn(
                    "mb-2 font-pixel text-[10px] uppercase tracking-[0.1em]",
                    dark ? "text-[#69daff]" : "text-[#00677d]",
                  )}
                >
                  Notes In Folder
                </div>
                <button
                  className={cn(
                    "mb-3 w-full border px-3 py-2 font-pixel text-[10px] uppercase",
                    dark
                      ? "border-[#262626] text-[#9cff93] hover:bg-[#1f1f1f]"
                      : "border-[#9aa7b3] text-[#006e17] hover:bg-[#d9e0e6]",
                  )}
                  disabled={!effectiveFolderId || createNoteMutation.isPending}
                  onClick={handleCreateNote}
                  type="button"
                >
                  New Note
                </button>

                <div className="space-y-2">
                  {noteList.map((note) => {
                    const active = note.id === selectedNoteId;
                    return (
                      <button
                        className={cn(
                          "w-full border px-3 py-2 text-left transition-colors",
                          active
                            ? dark
                              ? "border-[#69daff] bg-[#11232b] text-[#69daff]"
                              : "border-[#00677d] bg-[#dff4fa] text-[#00677d]"
                            : dark
                              ? "border-[#262626] bg-[#131313] text-[#d4d4d4] hover:bg-[#1f1f1f]"
                              : "border-[#b5c0ca] bg-white text-[#1f2937] hover:bg-[#e7edf1]",
                        )}
                        key={note.id}
                        onClick={() => handleSelectNote(note)}
                        type="button"
                      >
                        <div className="truncate text-sm font-semibold">
                          {note.title || "Untitled"}
                        </div>
                        <div className="truncate text-xs opacity-70">
                          {note.content || "Empty note"}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {effectiveFolderId && noteList.length === 0 ? (
                  <p
                    className={cn(
                      "mt-4 text-xs",
                      dark ? "text-[#767575]" : "text-[#64748b]",
                    )}
                  >
                    This folder has no notes yet.
                  </p>
                ) : null}
              </aside>

              <main className="cyber-scrollbar min-h-0 overflow-y-auto p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <button
                    className={cn(
                      "border px-3 py-2 font-pixel text-[10px] uppercase",
                      mainTab === "editor"
                        ? dark
                          ? "border-[#9cff93] bg-[#1d2a1b] text-[#9cff93]"
                          : "border-[#006e17] bg-[#dff5e2] text-[#006e17]"
                        : dark
                          ? "border-[#262626] text-[#adaaaa] hover:bg-[#1f1f1f]"
                          : "border-[#9aa7b3] text-[#475569] hover:bg-[#d9e0e6]",
                    )}
                    onClick={() => setMainTab("editor")}
                    type="button"
                  >
                    Editor
                  </button>
                  <button
                    className={cn(
                      "border px-3 py-2 font-pixel text-[10px] uppercase",
                      mainTab === "knowledge"
                        ? dark
                          ? "border-[#69daff] bg-[#11232b] text-[#69daff]"
                          : "border-[#00677d] bg-[#dff4fa] text-[#00677d]"
                        : dark
                          ? "border-[#262626] text-[#adaaaa] hover:bg-[#1f1f1f]"
                          : "border-[#9aa7b3] text-[#475569] hover:bg-[#d9e0e6]",
                    )}
                    onClick={() => setMainTab("knowledge")}
                    type="button"
                  >
                    Knowledge
                  </button>
                  <button
                    className={cn(
                      "border px-3 py-2 font-pixel text-[10px] uppercase",
                      dark
                        ? "border-[#262626] text-[#9cff93] hover:bg-[#1f1f1f]"
                        : "border-[#9aa7b3] text-[#006e17] hover:bg-[#d9e0e6]",
                    )}
                    disabled={!selectedNoteId || updateNoteMutation.isPending}
                    onClick={handleSaveNote}
                    type="button"
                  >
                    Save Now
                  </button>
                  <button
                    className={cn(
                      "border px-3 py-2 font-pixel text-[10px] uppercase",
                      dark
                        ? "border-[#522] text-[#ff7b7b] hover:bg-[#2a1515]"
                        : "border-[#fca5a5] text-[#b91c1c] hover:bg-[#fee2e2]",
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
                          ? "border-[#262626] text-[#adaaaa]"
                          : "border-[#cbd5e1] text-[#475569]",
                      )}
                    >
                      Move note by pressing `Move` on any folder
                    </div>
                  ) : null}
                  {statusMessage ? (
                    <p
                      className={cn(
                        "text-xs",
                        dark ? "text-[#69daff]" : "text-[#00677d]",
                      )}
                    >
                      {statusMessage}
                    </p>
                  ) : null}
                </div>

                {mainTab === "editor" ? (
                  selectedNote ? (
                    <div className="space-y-3">
                      <input
                        className={cn(
                          "w-full border px-3 py-2 text-base font-semibold outline-none",
                          dark
                            ? "border-[#262626] bg-[#131313] text-white placeholder:text-[#767575]"
                            : "border-[#9aa7b3] bg-white text-[#0f172a] placeholder:text-[#64748b]",
                        )}
                        onChange={(event) => setNoteTitle(event.target.value)}
                        placeholder="Note title"
                        value={noteTitle}
                      />
                      <NotesMarkdownEditor
                        dark={dark}
                        onChange={setNoteContent}
                        value={noteContent}
                      />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "flex h-full min-h-[320px] items-center justify-center border text-sm",
                        dark
                          ? "border-[#262626] bg-[#101010] text-[#767575]"
                          : "border-[#b5c0ca] bg-white text-[#64748b]",
                      )}
                    >
                      Select a folder and note to start editing.
                    </div>
                  )
                ) : (
                  <div className="space-y-3">
                    <div
                      className={cn(
                        "grid gap-2 border p-3 lg:grid-cols-[auto_auto_auto_1fr_auto]",
                        dark ? "border-[#262626] bg-[#101010]" : "border-[#9aa7b3] bg-white",
                      )}
                    >
                      <button
                        className={cn(
                          "border px-3 py-2 font-pixel text-[10px] uppercase",
                          dark
                            ? "border-[#262626] text-[#9cff93] hover:bg-[#1f1f1f]"
                            : "border-[#9aa7b3] text-[#006e17] hover:bg-[#d9e0e6]",
                        )}
                        disabled={!selectedNoteId || knowledgeIngestMutation.isPending}
                        onClick={handleIngestNoteToKnowledge}
                        type="button"
                      >
                        {knowledgeIngestMutation.isPending ? "Ingesting..." : "Ingest Note"}
                      </button>
                      <button
                        className={cn(
                          "border px-3 py-2 font-pixel text-[10px] uppercase",
                          dark
                            ? "border-[#262626] text-[#69daff] hover:bg-[#1f1f1f]"
                            : "border-[#9aa7b3] text-[#00677d] hover:bg-[#d9e0e6]",
                        )}
                        disabled={knowledgeGraphQuery.isFetching}
                        onClick={() => {
                          void knowledgeGraphQuery.refetch();
                          void knowledgeIngestStatusQuery.refetch();
                        }}
                        type="button"
                      >
                        Refresh Graph
                      </button>
                      <button
                        className={cn(
                          "border px-3 py-2 font-pixel text-[10px] uppercase",
                          dark
                            ? "border-[#522] text-[#ff7b7b] hover:bg-[#2a1515]"
                            : "border-[#fca5a5] text-[#b91c1c] hover:bg-[#fee2e2]",
                        )}
                        disabled={deleteKnowledgeGraphMutation.isPending}
                        onClick={handleDeleteKnowledgeGraph}
                        type="button"
                      >
                        Reset Graph
                      </button>
                      <select
                        className={cn(
                          "border px-3 py-2 text-sm outline-none",
                          dark
                            ? "border-[#262626] bg-[#131313] text-white"
                            : "border-[#9aa7b3] bg-white text-[#0f172a]",
                        )}
                        onChange={(event) => setKnowledgeMode(event.target.value)}
                        value={knowledgeMode}
                      >
                        <option value="hybrid">hybrid</option>
                        <option value="global">global</option>
                        <option value="local">local</option>
                      </select>
                      <div className="flex gap-2">
                        <input
                          className={cn(
                            "w-full border px-3 py-2 text-sm outline-none",
                            dark
                              ? "border-[#262626] bg-[#131313] text-white placeholder:text-[#767575]"
                              : "border-[#9aa7b3] bg-white text-[#0f172a] placeholder:text-[#64748b]",
                          )}
                          onChange={(event) => setKnowledgeQuestion(event.target.value)}
                          placeholder="Ask knowledge graph..."
                          value={knowledgeQuestion}
                        />
                        <button
                          className={cn(
                            "border px-3 py-2 font-pixel text-[10px] uppercase",
                            dark
                              ? "border-[#262626] text-[#69daff] hover:bg-[#11232b]"
                              : "border-[#9aa7b3] text-[#00677d] hover:bg-[#dff4fa]",
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
                            ? "border-[#262626] bg-[#101010] text-[#9cff93]"
                            : "border-[#9aa7b3] bg-[#f0fff3] text-[#166534]",
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
                            : "border-[#9aa7b3] bg-white text-[#334155]",
                        )}
                      >
                        Docs: {knowledgeIngestStatusQuery.data.total_docs} | processed:{" "}
                        {knowledgeIngestStatusQuery.data.processed_docs} | processing:{" "}
                        {knowledgeIngestStatusQuery.data.processing_docs} | failed:{" "}
                        {knowledgeIngestStatusQuery.data.failed_docs} | graph:{" "}
                        {knowledgeIngestStatusQuery.data.graph_nodes} nodes,{" "}
                        {knowledgeIngestStatusQuery.data.graph_edges} edges
                        {knowledgeIngestStatusQuery.data.documents.length ? (
                          <div
                            className={cn(
                              "mt-2 space-y-1 text-xs",
                              dark ? "text-[#9aa0a6]" : "text-[#475569]",
                            )}
                          >
                            {knowledgeIngestStatusQuery.data.documents
                              .slice(0, 3)
                              .map((documentStatus) => (
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
                            : "border-[#9aa7b3] bg-white text-[#334155]",
                        )}
                      >
                        {knowledgeAnswer}
                      </div>
                    ) : null}

                    <KnowledgeGraphVisualizer
                      dark={dark}
                      graph={knowledgeGraphQuery.data}
                    />
                  </div>
                )}
              </main>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
