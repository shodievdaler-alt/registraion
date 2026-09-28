import React, { useState } from 'react';
import { SkinType, SkinDefinition } from '../types';

// Distinct artwork assets
import classicImg from '../assets/images/skin_classic_knight_1789731410309.jpg';
import leafImg from '../assets/images/skin_leaf_nature_1789731511595.jpg';
import iceImg from '../assets/images/skin_ice_frost_1789731425242.jpg';
import savageImg from '../assets/images/skin_savage_warrior_1789731526714.jpg';
import lavaImg from '../assets/images/skin_lava_demon_1789731438033.jpg';
import transformerImg from '../assets/images/skin_cybertron_mech_1789731468319.jpg';

export const SKIN_IMAGE_MAP: Record<SkinType, string | null> = {
  classic: classicImg,
  leaf: leafImg,
  ice: iceImg,
  savage: savageImg,
  lava: lavaImg,
  transformer: transformerImg,
  avenger: null, // Custom vector-rendered high-tech Quantum Avenger artwork
};

interface SkinImageProps {
  skin: SkinDefinition;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showUniverseBadge?: boolean;
  className?: string;
  animateAura?: boolean;
}

export const SkinImage: React.FC<SkinImageProps> = ({
  skin,
  size = 'md',
  showUniverseBadge = false,
  className = '',
  animateAura = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const imgUrl = SKIN_IMAGE_MAP[skin.id];
  const isMultiverse = skin.universe === 'multiverse' || skin.id === 'transformer' || skin.id === 'avenger';

  const sizeClasses = {
    sm: 'w-12 h-12 rounded-lg text-lg',
    md: 'w-20 h-20 rounded-xl text-2xl',
    lg: 'w-32 h-32 rounded-2xl text-4xl',
    xl: 'w-full aspect-square max-w-[280px] rounded-2xl text-6xl',
  }[size];

  // Render Quantum Avenger custom artwork (Stark Arc Reactor + Thor Lightning + Cap Shield)
  if (skin.id === 'avenger' || (hasError && isMultiverse)) {
    return (
      <div
        className={`relative overflow-hidden flex items-center justify-center border-2 transition-all ${sizeClasses} ${className}`}
        style={{
          borderColor: skin.color || '#e11d48',
          boxShadow: `0 0 25px ${skin.glowColor}40`,
          background: 'radial-gradient(circle at center, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
        }}
      >
        {/* Cosmic starfield / quantum vortex lines */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:12px_12px]" />
        
        {/* Animated Lightning & Quantum Rings */}
        <div 
          className="absolute inset-2 rounded-full border border-cyan-400/40 animate-spin"
          style={{ animationDuration: '8s' }}
        />
        <div 
          className="absolute inset-4 rounded-full border border-dashed border-rose-500/50 animate-spin"
          style={{ animationDuration: '12s', animationDirection: 'reverse' }}
        />

        {/* Quantum Avenger Emblem: Nano Helmet + Arc Reactor + Lightning */}
        <div className="relative z-10 flex flex-col items-center justify-center select-none">
          <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]">
            {/* Thor Lightning Bolts */}
            <path
              d="M 20 15 L 35 45 L 28 48 L 48 85 L 38 52 L 46 50 Z"
              fill="#38bdf8"
              className="animate-pulse"
              opacity="0.85"
            />
            <path
              d="M 80 15 L 65 45 L 72 48 L 52 85 L 62 52 L 54 50 Z"
              fill="#38bdf8"
              className="animate-pulse"
              opacity="0.85"
            />

            {/* Vibranium / Stark Armor Shield */}
            <circle cx="50" cy="50" r="36" fill="#991b1b" stroke="#f59e0b" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="28" fill="#1e3a8a" stroke="#e2e8f0" strokeWidth="2" />
            <circle cx="50" cy="50" r="20" fill="#991b1b" stroke="#f59e0b" strokeWidth="1.5" />

            {/* Central Stark Arc Reactor (Glowing Cyan Core) */}
            <circle cx="50" cy="50" r="12" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="50" cy="50" r="7" fill="#e0f2fe" className="animate-ping" style={{ animationDuration: '2s' }} />
            <polygon points="50,42 53,47 58,47 54,51 56,56 50,53 44,56 46,51 42,47 47,47" fill="#ffffff" />
          </svg>
        </div>

        {/* Ambient Corner Sparkles */}
        <div className="absolute top-1 right-1 text-[10px] text-amber-300 font-mono font-black bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/40">
          MCU/AVZ
        </div>

        {showUniverseBadge && (
          <div className="absolute bottom-1 inset-x-1 text-center bg-cyan-950/90 border border-cyan-500/40 text-[9px] font-bold text-cyan-300 py-0.5 rounded shadow">
            🌀 Мультивселенная
          </div>
        )}
      </div>
    );
  }

  // If image URL is available and no load error
  if (imgUrl && !hasError) {
    return (
      <div
        className={`relative overflow-hidden border-2 transition-all group ${sizeClasses} ${className}`}
        style={{
          borderColor: skin.color || '#e2e8f0',
          boxShadow: animateAura ? `0 0 20px ${skin.glowColor}40` : undefined,
        }}
      >
        {/* Render Image with referrerPolicy */}
        <img
          src={imgUrl}
          alt={skin.nameRu}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        {/* Thematic Ambient Gradient Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-10 transition-opacity"
          style={{
            background: `linear-gradient(to top, ${skin.secondaryColor}ee, transparent 60%)`,
          }}
        />

        {/* Elemental corner icon badge */}
        <div 
          className="absolute top-1 right-1 w-5 h-5 rounded-md flex items-center justify-center text-xs shadow-md border"
          style={{
            backgroundColor: `${skin.primaryColor}cc`,
            borderColor: skin.glowColor,
          }}
        >
          {skin.icon}
        </div>

        {/* Universe tag badge */}
        {showUniverseBadge && (
          <div 
            className="absolute bottom-1 inset-x-1 text-center text-[9px] font-black py-0.5 rounded shadow backdrop-blur-sm border"
            style={{
              backgroundColor: isMultiverse ? 'rgba(8, 47, 73, 0.9)' : 'rgba(30, 41, 59, 0.9)',
              borderColor: isMultiverse ? '#0284c7' : '#eab308',
              color: isMultiverse ? '#38bdf8' : '#fde047',
            }}
          >
            {isMultiverse ? '🌀 Мультивселенная' : '🏰 Инаморта'}
          </div>
        )}
      </div>
    );
  }

  // Fallback if image fails or loading
  return (
    <div
      className={`relative overflow-hidden flex flex-col items-center justify-center border-2 ${sizeClasses} ${className}`}
      style={{
        backgroundColor: `${skin.primaryColor}22`,
        borderColor: skin.color || '#64748b',
        boxShadow: `0 0 15px ${skin.glowColor}30`,
      }}
    >
      <span className="drop-shadow-lg">{skin.icon}</span>
      <span className="text-[10px] font-bold text-slate-300 mt-1">
        {skin.nameRu.split(' ')[0]}
      </span>
      {showUniverseBadge && (
        <span className="text-[8px] text-amber-400 font-bold">
          {isMultiverse ? 'Мультивселенная' : 'Инаморта'}
        </span>
      )}
    </div>
  );
};
