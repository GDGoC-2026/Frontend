import type { components } from "@/types/api.generated";
import { backendClient } from "@/lib/api/backend-client";

export type FlashcardCreateUpdate =
  components["schemas"]["FlashcardCreateUpdate"];
export type FlashcardResponse = components["schemas"]["FlashcardResponse"];
export type ReviewSubmit = components["schemas"]["ReviewSubmit"];

// Get all flashcards
export async function getFlashcards(
  token: string,
  limit: number = 50,
  offset: number = 0,
) {
  const { data, error, response } = await backendClient.GET(
    "/api/v1/learning",
    {
      query: { limit, offset },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (error || !data) {
    throw new Error(
      `Failed to fetch flashcards with status ${response?.status ?? "unknown"}`,
    );
  }

  return data;
}

// Get due flashcards
export async function getDueFlashcards(
  token: string,
  limit: number = 50,
  offset: number = 0,
) {
  const { data, error, response } = await backendClient.GET(
    "/api/v1/learning/due",
    {
      query: { limit, offset },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (error || !data) {
    throw new Error(
      `Failed to fetch due flashcards with status ${response?.status ?? "unknown"}`,
    );
  }

  return data;
}

// Create flashcard
export async function createFlashcard(
  token: string,
  payload: FlashcardCreateUpdate,
) {
  const { data, error, response } = await backendClient.POST(
    "/api/v1/learning",
    {
      body: payload,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (error || !data) {
    throw new Error(
      `Failed to create flashcard with status ${response?.status ?? "unknown"}`,
    );
  }

  return data;
}

// Update flashcard
export async function updateFlashcard(
  token: string,
  cardId: string,
  payload: FlashcardCreateUpdate,
) {
  const { data, error, response } = await backendClient.PUT(
    "/api/v1/learning/{card_id}",
    {
      params: { path: { card_id: cardId } },
      body: payload,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (error || !data) {
    throw new Error(
      `Failed to update flashcard with status ${response?.status ?? "unknown"}`,
    );
  }

  return data;
}

// Delete flashcard
export async function deleteFlashcard(token: string, cardId: string) {
  const { error, response } = await backendClient.DELETE(
    "/api/v1/learning/{card_id}",
    {
      params: { path: { card_id: cardId } },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (error) {
    throw new Error(
      `Failed to delete flashcard with status ${response?.status ?? "unknown"}`,
    );
  }

  return { success: true };
}

// Submit review
export async function submitReview(
  token: string,
  cardId: string,
  payload: ReviewSubmit,
) {
  const { data, error, response } = await backendClient.POST(
    "/api/v1/learning/{card_id}/review",
    {
      params: { path: { card_id: cardId } },
      body: payload,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (error || !data) {
    throw new Error(
      `Failed to submit review with status ${response?.status ?? "unknown"}`,
    );
  }

  return data;
}
