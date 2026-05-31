import { useState, useRef, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import type { Chart } from "@/types";

interface RankingCardProps {
  chart: Chart;
  index: number;
}

const RankingCard = memo(function RankingCard({ chart, index }: RankingCardProps) {
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [shouldLoadImg, setShouldLoadImg] = useState(index < 15); // Preload first 15 images immediately
  const cardRef = useRef<HTMLDivElement>(null);

  // Use IntersectionObserver ONLY for lazy image loading, not for card visibility
  useEffect(() => {
    if (shouldLoadImg) return; // Already loading
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadImg(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" } // Load images 300px before they enter viewport
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldLoadImg]);

  const rank = String(index + 1).padStart(2, "0");
  const isTop1 = index === 0;

  return (
    <div
      ref={cardRef}
      className="group cursor-pointer"
      onClick={() => navigate(`/chart/${chart.id}`)}
      // Performance: let browser skip rendering off-screen cards
      style={{ contentVisibility: "auto", containIntrinsicHeight: "80px" }}
    >
      <div className="relative flex items-center gap-3 md:gap-5 px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-3xl bg-white/[0.02] hover:bg-white/[0.05] active:bg-white/[0.06] transition-colors duration-200 overflow-hidden border border-white/[0.06]">
        {/* Rank */}
        <div
          className={`font-mono-data text-2xl md:text-3xl font-bold w-8 md:w-12 text-center shrink-0 ${
            isTop1 ? "neon-gradient-text" : "text-white/30 md:text-white/40"
          }`}
        >
          {rank}
        </div>

        {/* Cover */}
        <div className="relative w-[56px] h-[56px] md:w-[72px] md:h-[72px] rounded-xl md:rounded-2xl overflow-hidden shrink-0 bg-white/5">
          {shouldLoadImg ? (
            <>
              {!imgLoaded && <div className="absolute inset-0 shimmer-skeleton" />}
              <img
                src={chart.illustration}
                alt={chart.name}
                className={`w-full h-full object-cover transition-opacity duration-200 ${
                  imgLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImgLoaded(true)}
                loading={index < 15 ? "eager" : "lazy"}
                decoding="async"
              />
            </>
          ) : (
            <div className="absolute inset-0 shimmer-skeleton" />
          )}
          {isTop1 && (
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute inset-0 rounded-xl md:rounded-2xl"
                style={{ boxShadow: "inset 0 0 16px rgba(0,240,255,0.25)" }}
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm md:text-base truncate leading-tight">
            {chart.name}
          </h3>
          <p className="text-white/35 text-xs md:text-sm mt-0.5 truncate">
            {chart.composer}
          </p>
          <div className="flex items-center gap-2 mt-1 md:mt-1.5">
            <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/45 border border-white/5">
              {chart.level}
            </span>
            <span className="text-[10px] md:text-xs text-white/25">
              {(chart.rating * 100).toFixed(1)}%
            </span>
            <span className="text-[10px] md:text-xs text-white/25 hidden sm:inline">
              {chart.ratingCount} 评价
            </span>
          </div>
        </div>

        {/* Top1 Duration - desktop only */}
        {chart.top1_duration_formatted && (
          <div className="text-right shrink-0 hidden md:block">
            <p className="text-[10px] text-white/25 mb-0.5">霸占榜首</p>
            <p
              className={`font-mono-data text-xs font-semibold ${
                isTop1 ? "neon-gradient-text" : "text-white/50"
              }`}
            >
              {chart.top1_duration_formatted}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

export default RankingCard;
