import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRanking, fetchRankingFirst, refreshRanking } from "@/services/api";
import type { Chart, RankingResponse, RankingFirstResponse } from "@/types";
import RankingCard from "@/components/RankingCard";
import NeonWave from "@/components/NeonWave";
import { RefreshCw, Lock, X } from "lucide-react";

const PhiraDiscRing = lazy(() => import("@/components/PhiraDiscRing"));

export default function Home() {
  const navigate = useNavigate();
  const [ranking, setRanking] = useState<RankingResponse | null>(null);
  const [first, setFirst] = useState<RankingFirstResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(true);

  // Refresh dialog state
  const [showRefreshDlg, setShowRefreshDlg] = useState(false);
  const [refreshToken, setRefreshToken] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState("");

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

  const handleRefresh = async () => {
    if (!refreshToken.trim()) return;
    setRefreshing(true);
    setRefreshMsg("");
    try {
      await refreshRanking(refreshToken.trim());
      setRefreshMsg("刷新成功！正在更新数据...");
      // Reload data
      const [rankingData, firstData] = await Promise.all([
        fetchRanking(),
        fetchRankingFirst(),
      ]);
      setRanking(rankingData);
      setFirst(firstData);
      setShowRefreshDlg(false);
      setRefreshToken("");
    } catch (err) {
      setRefreshMsg(err instanceof Error ? err.message : "刷新失败");
    } finally {
      setRefreshing(false);
    }
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
          <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12 md:pb-16 flex flex-col md:flex-row md:items-end justify-between gap-5 md:gap-8">
            {/* Left: Title */}
            <div className="flex-1 min-w-0">
              <p className="text-white/40 text-xs md:text-sm font-medium tracking-widest mb-2 uppercase">
                Phira Hot Ranking
              </p>
              <h1 className="text-4xl md:text-7xl font-bold text-white leading-none">
                今日
                <span className="neon-gradient-text">律动</span>
              </h1>
              <p className="text-white/30 mt-3 md:mt-4 text-xs md:text-sm max-w-md">
                实时追踪 Phira 社区热门谱面排名，见证每一首传奇的诞生。
              </p>
            </div>

            {/* Right: Current Top1 Card */}
            {topChart && (
              <div
                className="liquid-glass rounded-3xl p-4 md:p-5 w-full md:max-w-xs md:w-full cursor-pointer hover:bg-white/[0.06] transition-all duration-300 shrink-0"
                onClick={() => navigate(`/chart/${topChart.id}`)}
                style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
              >
                <div className="flex items-center gap-3 mb-2.5 md:mb-3">
                  <div className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" />
                  <span className="text-white/40 text-xs tracking-wider uppercase">
                    当前榜首
                  </span>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <img
                    src={topChart.illustration}
                    alt={topChart.name}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">
                      {topChart.name}
                    </h3>
                    <p className="text-white/40 text-xs mt-0.5">
                      {topChart.composer}
                    </p>
                    <p className="font-mono-data text-xs mt-1 neon-gradient-text">
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
      <div className="relative z-10 pt-8 md:pt-12">
        <NeonWave height="120px" className="relative" />
      </div>

      {/* Ranking List Section */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 pb-32 pt-4">
        <div className="flex items-center justify-between mb-6 md:mb-8 gap-4">
          <h2 className="text-lg md:text-2xl font-bold text-white">
            热门谱面 <span className="text-white/30 font-normal text-sm md:text-base">Top {chartList.length}</span>
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            {ranking && (
              <p className="text-white/30 text-xs hidden sm:block">
                {new Date(ranking.timestamp_iso).toLocaleTimeString("zh-CN")}
              </p>
            )}
            <button
              onClick={() => {
                setShowRefreshDlg(true);
                setRefreshMsg("");
              }}
              className="p-2 rounded-full liquid-glass text-white/40 hover:text-[#00f0ff] hover:border-[#00f0ff]/20 transition-all duration-300"
              title="手动刷新排名"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {chartList.map((chart, i) => (
            <RankingCard
              key={chart.id}
              chart={chart}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Refresh Dialog */}
      {showRefreshDlg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRefreshDlg(false)}
          />
          <div className="relative liquid-glass-strong rounded-3xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-[#00f0ff]" />
                <h3 className="text-white font-semibold text-sm">手动刷新排名</h3>
              </div>
              <button
                onClick={() => setShowRefreshDlg(false)}
                className="p-1 rounded-full text-white/30 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-white/40 text-xs mb-4">
              需要管理员 Token 才能刷新排名数据。
            </p>
            <input
              type="password"
              value={refreshToken}
              onChange={(e) => setRefreshToken(e.target.value)}
              placeholder="输入 Bearer Token"
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#00f0ff]/40 transition-colors mb-3"
              onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
            />
            {refreshMsg && (
              <p
                className={`text-xs mb-3 ${
                  refreshMsg.includes("成功")
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {refreshMsg}
              </p>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing || !refreshToken.trim()}
              className="w-full py-3 rounded-2xl text-sm font-medium transition-all duration-300 disabled:opacity-40"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,240,255,0.2), rgba(112,0,255,0.2))",
                border: "1px solid rgba(0,240,255,0.25)",
                color: "#00f0ff",
              }}
            >
              {refreshing ? "刷新中..." : "确认刷新"}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-white/20 text-xs mb-4">
            数据来源: 
            <a
              href="https://phira.moe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 text-xs hover:text-[#00f0ff] transition-colors"
            >
            Phira
            </a>
            ·
            友情链接：
            <a
              href="https://phira.dmocken.top/"
              target="_blank"
              className="text-white/30 text-xs hover:text-[#00f0ff] transition-colors"
            >
            Phira下载
            </a>
          </p>
          
          <p className="text-white/10 text-xs mt-6">
            Made for the rhythm.
          </p>
        </div>
      </footer>
    </div>
  );
}
