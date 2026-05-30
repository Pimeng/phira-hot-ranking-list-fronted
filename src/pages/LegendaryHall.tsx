import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTop1Leaderboard, fetchChartDetail } from "@/services/api";
import type { Top1LeaderboardItem, ChartDetailResponse } from "@/types";

interface ChartWithDetail extends Top1LeaderboardItem {
  detail?: ChartDetailResponse;
}

export default function LegendaryHall() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ChartWithDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const leaderboard = await fetchTop1Leaderboard();
        const charts = leaderboard.data.charts;

        // Fetch details for each chart
        const withDetails = await Promise.all(
          charts.map(async (item) => {
            try {
              const detail = await fetchChartDetail(item.chart_id);
              return { ...item, detail };
            } catch {
              return item;
            }
          })
        );
        setItems(withDetails);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Distribute items into 3 columns with offset
  const columns: ChartWithDetail[][] = [[], [], []];
  items.forEach((item, i) => {
    columns[i % 3].push(item);
  });

  const speedFactors = [0.8, 1.0, 1.2];
  const offsets = [0, 80, 40];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 shimmer-skeleton" />
          <p className="text-white/40 text-sm animate-pulse">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-full liquid-glass text-white text-sm hover:bg-white/10 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-32" ref={sectionRef}>
      {/* Hero Title */}
      <div className="text-center mb-20 px-6">
        <p className="text-white/30 text-sm tracking-widest uppercase mb-4">
          Hall of Fame
        </p>
        <h1 className="text-5xl md:text-7xl font-bold">
          <span className="text-white">传奇</span>
          <span className="neon-gradient-text">殿堂</span>
        </h1>
        <p className="text-white/30 mt-4 text-sm max-w-md mx-auto">
          这些谱面曾在热门榜首留下自己的印记，累计霸占时长排行榜见证它们的辉煌时刻。
        </p>
      </div>

      {/* Parallax Gallery */}
      <div className="max-w-6xl mx-auto px-6">
        {items.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-white/30 text-sm">暂无历史数据</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {columns.map((col, colIdx) => (
              <div
                key={colIdx}
                className="flex flex-col gap-5"
                style={{
                  transform: `translateY(${-scrollY * (speedFactors[colIdx] - 1) * 0.3 + offsets[colIdx]}px)`,
                  willChange: "transform",
                }}
              >
                {col.map((item, itemIdx) => (
                  <LegendaryCard
                    key={item.chart_id}
                    item={item}
                    delay={itemIdx * 100}
                    onClick={() => navigate(`/chart/${item.chart_id}`)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface LegendaryCardProps {
  item: ChartWithDetail;
  delay: number;
  onClick: () => void;
}

function LegendaryCard({ item, delay, onClick }: LegendaryCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [delay]);

  const illustration = item.detail?.illustration || "";

  return (
    <div
      ref={cardRef}
      className={`cursor-pointer group transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        transitionDelay: `${delay}ms`,
        transform: isVisible
          ? "scaleY(1) skewY(0deg)"
          : "scaleY(1.05) skewY(1deg)",
      }}
      onClick={onClick}
    >
      <div className="relative rounded-3xl overflow-hidden liquid-glass">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          {!imgLoaded && illustration && (
            <div className="absolute inset-0 shimmer-skeleton" />
          )}
          {illustration ? (
            <img
              src={illustration}
              alt={item.chart_name}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImgLoaded(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <span className="text-white/20 text-4xl font-bold">
                {item.chart_name.charAt(0)}
              </span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Info panel */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-white font-semibold text-lg mb-1 truncate">
            {item.chart_name}
          </h3>
          <div className="flex items-center gap-3">
            <span className="font-mono-data text-xs neon-gradient-text">
              {item.total_top1_formatted}
            </span>
            <span className="text-white/30 text-xs">
              {item.top1_count} 次登顶
            </span>
          </div>
        </div>

        {/* Top badge */}
        <div className="absolute top-4 right-4 liquid-glass-strong rounded-full px-3 py-1">
          <span className="text-xs text-white/80 font-medium">
            累计 #{item.top1_count}
          </span>
        </div>
      </div>
    </div>
  );
}
