import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  fetchChartDetail,
  fetchChartHotStats,
  fetchUser,
  getPhiraChartUrl,
} from "@/services/api";
import type {
  ChartDetailResponse,
  HotStatsResponse,
  UserResponse,
  HotStatsHistoryItem,
} from "@/types";
import NeonWave from "@/components/NeonWave";
import { ArrowLeft, ExternalLink, Clock, Trophy, Calendar } from "lucide-react";

export default function ChartDetail() {
  const { id } = useParams<{ id: string }>();
  const chartId = Number(id);

  const [chart, setChart] = useState<ChartDetailResponse | null>(null);
  const [stats, setStats] = useState<HotStatsResponse | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const chartData = await fetchChartDetail(chartId);
        setChart(chartData);

        // Load stats and user in parallel
        const [statsData, userData] = await Promise.allSettled([
          fetchChartHotStats(chartId),
          fetchUser(chartData.uploader),
        ]);

        if (statsData.status === "fulfilled") setStats(statsData.value);
        if (userData.status === "fulfilled") setUser(userData.value);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [chartId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 shimmer-skeleton" />
          <p className="text-white/40 text-sm animate-pulse">加载谱面数据...</p>
        </div>
      </div>
    );
  }

  if (error || !chart) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "谱面不存在"}</p>
          <Link
            to="/"
            className="px-6 py-2 rounded-full liquid-glass text-white text-sm hover:bg-white/10 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-32">
      {/* Hero with large cover */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        {/* Background cover blur */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-110"
          style={{ backgroundImage: `url(${chart.illustration})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050507]/50 to-[#050507]" />

        {/* Content */}
        <div className="relative z-10 h-full max-w-6xl mx-auto px-6 flex items-end pb-12">
          <div className="flex items-end gap-8">
            {/* Cover */}
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden shadow-2xl shrink-0 liquid-glass p-1.5">
              <img
                src={chart.illustration}
                alt={chart.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/50 border border-white/5">
                  {chart.level}
                </span>
                <span className="text-xs text-white/30">
                  ID: {chart.id}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 truncate">
                {chart.name}
              </h1>
              <p className="text-white/50 text-lg mb-4">
                {chart.composer}
              </p>
              <div className="flex items-center gap-4 text-sm text-white/40">
                <span>谱师: {chart.charter}</span>
                {user && (
                  <span>
                    上传者:{" "}
                    <a
                      href={`https://phira.moe/user/${chart.uploader}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00f0ff] hover:underline"
                    >
                      {user.name}
                    </a>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Neon Wave */}
      <NeonWave height="150px" className="-mt-10 relative z-10" />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 -mt-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Stats & Actions */}
          <div className="lg:col-span-1 space-y-5">
            {/* Rating Card */}
            <div className="liquid-glass rounded-3xl p-6">
              <h3 className="text-white/40 text-xs tracking-wider uppercase mb-4">
                评分
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="font-mono-data text-4xl font-bold neon-gradient-text">
                  {(chart.rating * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-white/30 text-sm mt-2">
                {chart.ratingCount} 人评价
              </p>
              {/* Rating bar */}
              <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${chart.rating * 100}%`,
                    background:
                      "linear-gradient(90deg, #00f0ff, #7000ff, #ff0055)",
                  }}
                />
              </div>
            </div>

            {/* Tags */}
            {chart.tags && chart.tags.length > 0 && (
              <div className="liquid-glass rounded-3xl p-6">
                <h3 className="text-white/40 text-xs tracking-wider uppercase mb-4">
                  标签
                </h3>
                <div className="flex flex-wrap gap-2">
                  {chart.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-white/50 border border-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="liquid-glass rounded-3xl p-6 space-y-3">
              <a
                href={getPhiraChartUrl(chart.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-medium transition-all duration-300"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,240,255,0.15), rgba(112,0,255,0.15))",
                  border: "1px solid rgba(0,240,255,0.2)",
                  color: "#00f0ff",
                }}
              >
                <ExternalLink size={14} />
                在 Phira 中查看
              </a>
              <Link
                to="/"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                <ArrowLeft size={14} />
                返回排行榜
              </Link>
            </div>

            {/* Description */}
            {chart.description && (
              <div className="liquid-glass rounded-3xl p-6">
                <h3 className="text-white/40 text-xs tracking-wider uppercase mb-3">
                  简介
                </h3>
                <p className="text-white/50 text-sm whitespace-pre-line leading-relaxed">
                  {chart.description}
                </p>
              </div>
            )}
          </div>

          {/* Right: Hot Stats */}
          <div className="lg:col-span-2 space-y-5">
            {stats?.data ? (
              <>
                {/* Top1 Stats Summary */}
                <div className="liquid-glass rounded-3xl p-6">
                  <h3 className="text-white/40 text-xs tracking-wider uppercase mb-6">
                    榜首统计
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatItem
                      icon={<Trophy size={16} />}
                      label="累计时长"
                      value={stats.data.total_top1_formatted}
                      highlight
                    />
                    <StatItem
                      icon={<Clock size={16} />}
                      label="登顶次数"
                      value={`${stats.data.top1_count} 次`}
                    />
                    <StatItem
                      icon={<Calendar size={16} />}
                      label="首次登顶"
                      value={new Date(stats.data.first_top1_iso).toLocaleDateString(
                        "zh-CN"
                      )}
                    />
                    <StatItem
                      icon={<Calendar size={16} />}
                      label="最近登顶"
                      value={new Date(stats.data.last_top1_iso).toLocaleDateString(
                        "zh-CN"
                      )}
                    />
                  </div>
                </div>

                {/* History Timeline */}
                {stats.data.history.length > 0 && (
                  <div className="liquid-glass rounded-3xl p-6">
                    <h3 className="text-white/40 text-xs tracking-wider uppercase mb-6">
                      在位记录
                    </h3>
                    <div className="space-y-4">
                      {stats.data.history.map(
                        (h: HotStatsHistoryItem, i: number) => (
                          <TimelineItem
                            key={i}
                            history={h}
                            index={i}
                            isLast={i === stats.data.history.length - 1}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="liquid-glass rounded-3xl p-12 text-center">
                <p className="text-white/30 text-sm">
                  该谱面暂无榜首记录
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

function StatItem({ icon, label, value, highlight }: StatItemProps) {
  return (
    <div className="text-center p-4 rounded-2xl bg-white/[0.02]">
      <div className="flex items-center justify-center gap-1.5 text-white/30 mb-2">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p
        className={`font-mono-data text-lg font-semibold ${
          highlight ? "neon-gradient-text" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

interface TimelineItemProps {
  history: HotStatsHistoryItem;
  index: number;
  isLast: boolean;
}

function TimelineItem({ history, index, isLast }: TimelineItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 80);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={`flex gap-4 transition-all duration-500 ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
      }`}
    >
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div
          className={`w-3 h-3 rounded-full ${
            history.ongoing
              ? "bg-[#00f0ff]"
              : "bg-white/20"
          }`}
          style={
            history.ongoing
              ? { boxShadow: "0 0 10px rgba(0,240,255,0.5)" }
              : {}
          }
        />
        {!isLast && (
          <div className="w-px flex-1 bg-white/10 min-h-[20px]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono-data text-sm text-white">
            {history.duration_formatted}
          </span>
          {history.ongoing && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20">
              进行中
            </span>
          )}
        </div>
        <p className="text-white/30 text-xs">
          {new Date(history.from_iso).toLocaleString("zh-CN")}
          {history.to_iso
            ? ` → ${new Date(history.to_iso).toLocaleString("zh-CN")}`
            : " → 至今"}
        </p>
      </div>
    </div>
  );
}
