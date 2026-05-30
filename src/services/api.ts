import type {
  RankingResponse,
  RankingFirstResponse,
  Top1LeaderboardResponse,
  HotStatsResponse,
  ChartDetailResponse,
  UserResponse,
} from "@/types";

const RANKING_API_BASE = "https://phira-hot-ranking-list-api.07210700.xyz";
const PHIRA_API_BASE = "https://phira.5wyxi.com";

export async function fetchRanking(): Promise<RankingResponse> {
  const resp = await fetch(`${RANKING_API_BASE}/api/ranking`);
  if (!resp.ok) throw new Error("Failed to fetch ranking");
  return resp.json();
}

export async function fetchRankingFirst(): Promise<RankingFirstResponse> {
  const resp = await fetch(`${RANKING_API_BASE}/api/ranking/first`);
  if (!resp.ok) throw new Error("Failed to fetch ranking first");
  return resp.json();
}

export async function fetchTop1Leaderboard(): Promise<Top1LeaderboardResponse> {
  const resp = await fetch(`${RANKING_API_BASE}/api/stats/top1-leaderboard`);
  if (!resp.ok) throw new Error("Failed to fetch top1 leaderboard");
  return resp.json();
}

export async function fetchChartHotStats(
  id: number
): Promise<HotStatsResponse> {
  const resp = await fetch(`${RANKING_API_BASE}/api/chart/${id}/hot-stats`);
  if (!resp.ok) throw new Error("Failed to fetch chart hot stats");
  return resp.json();
}

export async function fetchChartDetail(id: number): Promise<ChartDetailResponse> {
  const resp = await fetch(`${PHIRA_API_BASE}/chart/${id}`);
  if (!resp.ok) throw new Error("Failed to fetch chart detail");
  return resp.json();
}

export async function fetchUser(id: number): Promise<UserResponse> {
  const resp = await fetch(`${PHIRA_API_BASE}/user/${id}`);
  if (!resp.ok) throw new Error("Failed to fetch user");
  return resp.json();
}

export function getPhiraChartUrl(id: number): string {
  return `https://phira.moe/chart/${id}`;
}

export function getPhiraUserUrl(id: number): string {
  return `https://phira.moe/user/${id}`;
}

export async function refreshRanking(token: string): Promise<{ success: boolean; message?: string }> {
  const resp = await fetch(`${RANKING_API_BASE}/api/ranking/refresh`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    throw new Error(data.message || `刷新失败 (${resp.status})`);
  }
  return resp.json();
}
