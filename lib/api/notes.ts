import type { components } from "@/types/api.generated";
import { backendClient } from "@/lib/api/backend-client";

export type NoteCreate = components["schemas"]["NoteCreate"];
export type NoteUpdate = components["schemas"]["NoteUpdate"];
export type NoteResponse = components["schemas"]["NoteResponse"];
export type FolderCreate = components["schemas"]["FolderCreate"];
export type FolderResponse = components["schemas"]["FolderResponse"];
export type FolderDetailResponse =
  components["schemas"]["FolderDetailResponse"];

// Notes endpoints
export async function getNotes(token: string, folderId?: string | null) {
  const query = folderId ? { folder_id: folderId } : undefined;
  const { data, error, response } = await backendClient.GET("/api/v1/notes/", {
    ...(query && { query }),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (error || !data) {
    throw new Error(
      `Failed to fetch notes with status ${response?.status ?? "unknown"}`,
    );
  }

  return data;
}

export async function createNote(token: string, payload: NoteCreate) {
  const { data, error, response } = await backendClient.POST("/api/v1/notes/", {
    body: payload,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (error || !data) {
    throw new Error(
      `Failed to create note with status ${response?.status ?? "unknown"}`,
    );
  }

  return data;
}

export async function getNote(token: string, noteId: string) {
  const { data, error, response } = await backendClient.GET(
    "/api/v1/notes/{note_id}",
    {
      params: { path: { note_id: noteId } },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (error || !data) {
    throw new Error(
      `Failed to fetch note with status ${response?.status ?? "unknown"}`,
    );
  }

  return data;
}

export async function updateNote(
  token: string,
  noteId: string,
  payload: NoteUpdate,
) {
  const { data, error, response } = await backendClient.PUT(
    "/api/v1/notes/{note_id}",
    {
      params: { path: { note_id: noteId } },
      body: payload,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (error || !data) {
    throw new Error(
      `Failed to update note with status ${response?.status ?? "unknown"}`,
    );
  }

  return data;
}

export async function deleteNote(token: string, noteId: string) {
  const { error, response } = await backendClient.DELETE(
    "/api/v1/notes/{note_id}",
    {
      params: { path: { note_id: noteId } },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (error) {
    throw new Error(
      `Failed to delete note with status ${response?.status ?? "unknown"}`,
    );
  }

  return { success: true };
}

// Folder endpoints
export async function getRootFolders(token: string) {
  const { data, error, response } = await backendClient.GET(
    "/api/v1/notes/folders",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const status = response?.status ?? "unknown";

  if (error || !data) {
    throw new Error(`Failed to fetch root folders with status ${status}`);
  }

  return data;
}

export async function createFolder(token: string, payload: FolderCreate) {
  const { data, error, response } = await backendClient.POST(
    "/api/v1/notes/folders",
    {
      body: payload,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (error || !data) {
    throw new Error(
      `Failed to create folder with status ${response?.status ?? "unknown"}`,
    );
  }

  return data;
}

export async function getFolderDetails(token: string, folderId: string) {
  const { data, error, response } = await backendClient.GET(
    "/api/v1/notes/folders/{folder_id}",
    {
      params: { path: { folder_id: folderId } },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (error || !data) {
    throw new Error(
      `Failed to fetch folder details with status ${response?.status ?? "unknown"}`,
    );
  }

  return data;
}

export async function deleteFolder(token: string, folderId: string) {
  const { error, response } = await backendClient.DELETE(
    "/api/v1/notes/folders/{folder_id}",
    {
      params: { path: { folder_id: folderId } },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (error) {
    throw new Error(
      `Failed to delete folder with status ${response?.status ?? "unknown"}`,
    );
  }

  return { success: true };
}

// Knowledge Graph endpoint
export async function getKnowledgeGraph(token: string) {
  const { data, error, response } = await backendClient.GET(
    "/api/v1/notes/graph-visualizer",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (error || !data) {
    throw new Error(
      `Failed to fetch knowledge graph with status ${response?.status ?? "unknown"}`,
    );
  }

  return data;
}

// Upload markdown note
export async function uploadMarkdownNote(
  token: string,
  file: File,
  folderId?: string | null,
) {
  const formData = new FormData();
  formData.append("file", file);

  const query = folderId ? { folder_id: folderId } : undefined;

  const { data, error, response } = await backendClient.POST(
    "/api/v1/notes/upload",
    {
      body: formData,
      ...(query && { query }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    } as any,
  );

  if (error || !data) {
    throw new Error(
      `Failed to upload note with status ${response?.status ?? "unknown"}`,
    );
  }

  return data;
}
