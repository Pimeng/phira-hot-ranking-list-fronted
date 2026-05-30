import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRanking, fetchRankingFirst } from "@/services/api";
import type { Chart, RankingResponse, RankingFirstResponse } from "@/types";
import RankingCard from "@/components/RankingCard";
import NeonWave from "@/components/NeonWave";

const PhiraDiscRing = lazy(() => import("@/components/PhiraDiscRing"));

export default function Home() {
  const navigate = useNavigate();
  const [ranking, setRanking] = useState<RankingResponse | null>(null);
  const [first, setFirst] = useState<RankingFirstResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [rankingData, firstData] = await Promise.all([
          fetchRanking(),
          fetchRankingFirst(),
        ]);
        setRanking(rankingData);
        setFirst(firstData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Fade hero on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrollY = window.scrollY;
      const heroHeight = heroRef.current.offsetHeight;
      setHeroVisible(scrollY < heroHeight * 0.6);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleChartSelect = (chart: Chart) => {
    navigate(`/chart/${chart.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 shimmer-skeleton" />
          <p className="text-white/40 text-sm animate-pulse">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  const topChart = first?.result;
  const chartList = ranking?.results || [];

  return (
    <div className="relative">
      {/* Hero Section with 3D Ring */}
      <section
        ref={heroRef}
        className="relative h-screen w-full overflow-hidden"
      >
        {/* 3D Ring Background */}
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full shimmer-skeleton" />
            </div>
          }
        >
          <PhiraDiscRing
            charts={chartList.slice(0, 20)}
            onSelectChart={handleChartSelect}
          />
        </Suspense>

        {/* Top Chart Info - Bottom Area */}
        <div
          className={`absolute bottom-0 left-0 right-0 transition-opacity duration-700 ${
            heroVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 pb-16 flex items-end justify-between gap-8">
            {/* Left: Title */}
            <div className="flex-1">
              <p className="text-white/40 text-sm font-medium tracking-widest mb-2 uppercase">
                Phira Hot Ranking
              </p>
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-none">
                今日
                <span className="neon-gradient-text">律动</span>
              </h1>
              <p className="text-white/30 mt-4 text-sm max-w-md">
                实时追踪 Phira 社区热门谱面排名，见证每一首传奇的诞生。
              </p>
            </div>

            {/* Right: Current Top1 Card */}
            {topChart && (
              <div
                className="liquid-glass rounded-3xl p-5 max-w-xs w-full cursor-pointer hover:bg-white/[0.06] transition-all duration-300"
                onClick={() => navigate(`/chart/${topChart.id}`)}
                style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
                  <span className="text-white/40 text-xs tracking-wider uppercase">
                    当前榜首
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <img
                    src={topChart.illustration}
                    alt={topChart.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">
                      {topChart.name}
                    </h3>
                    <p className="text-white/40 text-xs mt-0.5">
                      {topChart.composer}
                    </p>
                    <p className="font-mono-data text-xs mt-1.5 neon-gradient-text">
                      {first?.top1_duration_formatted}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-opacity duration-500 ${
            heroVisible ? "opacity-40" : "opacity-0"
          }`}
        >
          <span className="text-white/40 text-xs">向下滚动</span>
          <div className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white/60 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Neon Wave Divider */}
      <NeonWave height="200px" className="-mt-20 relative z-10" />

      {/* Ranking List Section */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-32">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">
            热门谱面 <span className="text-white/30 font-normal">Top {chartList.length}</span>
          </h2>
          {ranking && (
            <p className="text-white/30 text-xs">
              更新于 {new Date(ranking.timestamp_iso).toLocaleTimeString("zh-CN")}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {chartList.map((chart, i) => (
            <RankingCard
              key={chart.id}
              chart={chart}
              index={i}
              delay={Math.min(i * 50, 500)}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-white/20 text-xs mb-4">
            数据来源: Phira Hot Ranking API · Phira 社区
          </p>
          <a
            href="https://phira.moe"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 text-xs hover:text-[#00f0ff] transition-colors"
          >
            phira.moe
          </a>
          <p className="text-white/10 text-xs mt-6">
            Made for the rhythm.
          </p>
        </div>
      </footer>
    </div>
  );
}
