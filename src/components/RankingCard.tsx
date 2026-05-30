import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Chart } from "@/types";

interface RankingCardProps {
  chart: Chart;
  index: number;
  delay?: number;
}

export default function RankingCard({ chart, index, delay = 0 }: RankingCardProps) {
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const rank = String(index + 1).padStart(2, "0");
  const isTop1 = index === 0;

  return (
    <div
      ref={cardRef}
      className={`group cursor-pointer transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
      onClick={() => navigate(`/chart/${chart.id}`)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative flex items-center gap-5 px-6 py-4 rounded-3xl transition-all duration-300 overflow-hidden"
        style={{
          background: isHovered
            ? `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(0,240,255,0.06) 0%, rgba(112,0,255,0.03) 40%, rgba(255,255,255,0.02) 100%)`
            : "rgba(255,255,255,0.02)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.06)",
          transform: isHovered ? "scale(1.01)" : "scale(1)",
        }}
      >
        {/* Neon sweep on hover */}
        {isHovered && (
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: `linear-gradient(105deg, transparent 40%, rgba(0,240,255,0.1) 50%, rgba(112,0,255,0.1) 55%, transparent 60%)`,
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s ease-in-out",
            }}
          />
        )}

        {/* Rank */}
        <div
          className={`font-mono-data text-3xl font-bold w-12 text-center shrink-0 ${
            isTop1 ? "neon-gradient-text" : "text-white/40"
          }`}
        >
          {rank}
        </div>

        {/* Cover */}
        <div className="relative w-[72px] h-[72px] rounded-2xl overflow-hidden shrink-0 bg-white/5">
          {!imgLoaded && <div className="absolute inset-0 shimmer-skeleton" />}
          <img
            src={chart.illustration}
            alt={chart.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
          {isTop1 && (
            <div className="absolute inset-0 pointer-events-none animate-pulse">
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  boxShadow: "inset 0 0 20px rgba(0,240,255,0.3)",
                }}
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base truncate leading-tight">
            {chart.name}
          </h3>
          <p className="text-white/40 text-sm mt-1 truncate">
            {chart.composer} · {chart.charter}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/5">
              {chart.level}
            </span>
            <span className="text-xs text-white/30">
              {(chart.rating * 100).toFixed(1)}% · {chart.ratingCount} 评价
            </span>
          </div>
        </div>

        {/* Top1 Duration */}
        {chart.top1_duration_formatted && (
          <div className="text-right shrink-0 hidden sm:block">
            <p className="text-xs text-white/30 mb-0.5">霸占榜首</p>
            <p
              className={`font-mono-data text-sm font-semibold ${
                isTop1 ? "neon-gradient-text" : "text-white/60"
              }`}
            >
              {chart.top1_duration_formatted}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
