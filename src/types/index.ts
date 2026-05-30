export interface Chart {
  id: number;
  name: string;
  level: string;
  difficulty: number;
  charter: string;
  composer: string;
  illustrator: string | null;
  description: string;
  ranked: boolean;
  reviewed: boolean;
  stable: boolean;
  illustration: string;
  preview: string;
  file: string;
  uploader: number;
  tags: string[];
  rating: number;
  ratingCount: number;
  created: string;
  updated: string;
  chartUpdated: string;
  top1_total_seconds?: number;
  top1_total_formatted?: string;
  top1_duration_seconds?: number;
  top1_duration_formatted?: string;
  top1_since_iso?: string;
  top1_count?: number;
}

export interface RankingResponse {
  count: number;
  results: Chart[];
  success: boolean;
  timestamp_iso: string;
  current_top1_duration_seconds: number;
  current_top1_duration_formatted: string;
  current_top1_since_iso: string;
  stats_started: string;
}

export interface RankingFirstResponse {
  success: boolean;
  result: Chart;
  timestamp_iso: string;
  stats_started: string;
  top1_duration_seconds: number;
  top1_duration_formatted: string;
  top1_since_iso: string;
}

export interface Top1LeaderboardItem {
  chart_id: number;
  chart_name: string;
  total_top1_seconds: number;
  total_top1_formatted: string;
  top1_count: number;
}

export interface Top1LeaderboardResponse {
  success: boolean;
  data: {
    total_charts_tracked: number;
    charts: Top1LeaderboardItem[];
  };
}

export interface HotStatsHistoryItem {
  from: number;
  from_iso: string;
  to: number | null;
  to_iso: string | null;
  duration_seconds: number;
  duration_formatted: string;
  ongoing: boolean;
}

export interface HotStatsResponse {
  success: boolean;
  data: {
    chart_id: number;
    chart_name: string;
    ever_top1: boolean;
    total_top1_seconds: number;
    total_top1_formatted: string;
    top1_count: number;
    first_top1_at: number;
    first_top1_iso: string;
    last_top1_at: number;
    last_top1_iso: string;
    history: HotStatsHistoryItem[];
  };
}

export interface ChartDetailResponse {
  id: number;
  name: string;
  level: string;
  difficulty: number;
  charter: string;
  composer: string;
  illustration: string;
  uploader: number;
  tags: string[];
  rating: number;
  ratingCount: number;
  description: string;
  created: string;
  updated: string;
}

export interface UserResponse {
  id: number;
  name: string;
  avatar: string | null;
}
