import React, { useRef, useState } from 'react';

export default function SpotlightCard({ children, className = '', glowColor = 'rgba(124, 58, 237, 0.22)' }) {
  const cardRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-3xl border border-slate-200/70 dark:border-white/[0.07] bg-white/88 dark:bg-[#0C1224]/90 backdrop-blur-2xl transition-all duration-300 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/10 dark:hover:shadow-violet-500/20 ${className}`}
    >
      {/* Spotlight radial glow that follows cursor */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-10"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 45%)`,
        }}
      />
      {/* Subtle noise texture for depth */}
      <div
        className="pointer-events-none absolute inset-0 z-[5] opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-20">{children}</div>
    </div>
  );
}
