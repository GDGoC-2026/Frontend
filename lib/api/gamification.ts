import { backendClient } from "@/lib/api/backend-client";

// Get user gamification stats
export async function getMyStats(token: string) {
  const { data, error, response } = await backendClient.GET(
    "/api/v1/gamification/my-stats",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const status = response?.status ?? "unknown";

  if (error || !data) {
    throw new Error(`Failed to fetch gamification stats with status ${status}`);
  }

  return data;
}

// Get leaderboard
export async function getLeaderboard() {
  const { data, error, response } = await backendClient.GET(
    "/api/v1/gamification/leaderboard",
  );
  const status = response?.status ?? "unknown";

  if (error || !data) {
    throw new Error(`Failed to fetch leaderboard with status ${status}`);
  }

  return data;
}
