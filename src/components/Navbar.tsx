import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!navRef.current) return;
      const rect = navRef.current.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };
    const nav = navRef.current;
    nav?.addEventListener("mousemove", handleMouseMove);
    return () => nav?.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      ref={navRef}
      className="fixed top-3 md:top-6 left-1/2 -translate-x-1/2 z-50 liquid-glass-strong rounded-full px-1.5 md:px-2 py-1.5 md:py-2 flex items-center gap-0.5 md:gap-1 shadow-2xl"
      style={{
        background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 50%)`,
      }}
    >
      <Link
        to="/"
        className={`px-2.5 md:px-5 py-1.5 md:py-2 rounded-full text-[11px] md:text-sm font-medium whitespace-nowrap transition-all duration-300 ${
          isActive("/")
            ? "text-white bg-white/10"
            : "text-white/60 hover:text-white hover:bg-white/5"
        }`}
      >
        今日律动
      </Link>
      <Link
        to="/legendary"
        className={`px-2.5 md:px-5 py-1.5 md:py-2 rounded-full text-[11px] md:text-sm font-medium whitespace-nowrap transition-all duration-300 ${
          isActive("/legendary")
            ? "text-white bg-white/10"
            : "text-white/60 hover:text-white hover:bg-white/5"
        }`}
      >
        传奇殿堂
      </Link>
      <div className="w-px h-3.5 bg-white/10 mx-0.5 md:mx-1 shrink-0" />
      <a
        href="https://phira.moe"
        target="_blank"
        rel="noopener noreferrer"
        className="px-2.5 md:px-5 py-1.5 md:py-2 rounded-full text-[11px] md:text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300 whitespace-nowrap"
      >
        Phira
      </a>
    </nav>
  );
}
