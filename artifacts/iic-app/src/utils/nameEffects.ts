import React from 'react';

export const NAME_EFFECTS_LIST = [
  { id: 'auto',    emoji: '⚡', name: 'Auto',       desc: 'Level ke saath upgrade',    minLevel: 1  },
  { id: 'plain',   emoji: '✏️', name: 'Plain',      desc: 'Saaf seedha white text',    minLevel: 1  },
  { id: 'glow',    emoji: '✨', name: 'Soft Glow',  desc: 'Level color ka soft glow',  minLevel: 4  },
  { id: 'shimmer', emoji: '💫', name: 'Shimmer',    desc: 'Purple shimmer wave',        minLevel: 6  },
  { id: 'pulse',   emoji: '🔮', name: 'Pulse',      desc: 'Pulsating glow animation',  minLevel: 7  },
  { id: 'fire',    emoji: '🔥', name: 'Fire',       desc: 'Orange-gold fire gradient', minLevel: 10 },
  { id: 'neon',    emoji: '💡', name: 'Neon',       desc: 'Cyan electric neon glow',   minLevel: 10 },
  { id: 'ice',     emoji: '❄️', name: 'Ice',        desc: 'Icy blue-white shimmer',    minLevel: 12 },
  { id: 'gold',    emoji: '🏆', name: 'Gold',       desc: 'Premium gold shimmer',      minLevel: 12 },
  { id: 'galaxy',  emoji: '🌌', name: 'Galaxy',     desc: 'Purple-pink cosmos',        minLevel: 13 },
  { id: 'rainbow', emoji: '🌈', name: 'Rainbow',    desc: 'Legendary rainbow aura',    minLevel: 15 },
] as const;

export type NameEffectId = typeof NAME_EFFECTS_LIST[number]['id'];

export function getNameEffectStyle(effectId: string, col: string, glow: string, isLight: boolean): React.CSSProperties {
  if (isLight) return { color: '#1e293b' };
  switch (effectId) {
    case 'plain':
      return { color: '#ffffff' };
    case 'glow':
      return { color: col, textShadow: `0 0 16px ${glow}, 0 0 30px ${glow}55` };
    case 'shimmer':
      return {
        background: 'linear-gradient(135deg,#c084fc,#a855f7,#7c3aed,#c084fc)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'name-fx-shimmer 4s linear infinite',
      } as React.CSSProperties;
    case 'pulse':
      return {
        color: col,
        textShadow: `0 0 14px ${glow}`,
        animation: 'name-fx-rainbow 7s ease infinite',
      } as React.CSSProperties;
    case 'fire':
      return {
        background: 'linear-gradient(135deg,#fb923c,#f59e0b,#fbbf24,#fb923c)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'name-fx-shimmer 3s linear infinite',
      } as React.CSSProperties;
    case 'neon':
      return {
        color: '#a5f3fc',
        textShadow: '0 0 8px rgba(165,243,252,1), 0 0 20px rgba(165,243,252,0.7), 0 0 40px rgba(165,243,252,0.4)',
      };
    case 'ice':
      return {
        background: 'linear-gradient(135deg,#bae6fd,#e0f2fe,#a5f3fc,#bae6fd)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'name-fx-shimmer 3.5s linear infinite',
      } as React.CSSProperties;
    case 'gold':
      return {
        background: 'linear-gradient(135deg,#fde68a,#f59e0b,#fbbf24,#fde68a)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'name-fx-shimmer 2.5s linear infinite',
      } as React.CSSProperties;
    case 'galaxy':
      return {
        background: 'linear-gradient(135deg,#a78bfa,#c084fc,#f472b6,#a78bfa)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'name-fx-shimmer 2.5s linear infinite, name-fx-rainbow 5s ease infinite',
      } as React.CSSProperties;
    case 'rainbow':
      return {
        background: 'linear-gradient(135deg,#ffffff,#a5f3fc,#c4b5fd,#f9a8d4,#ffffff)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'name-fx-shimmer 1.8s linear infinite, name-fx-absolute 4s ease infinite',
      } as React.CSSProperties;
    default:
      return { color: '#ffffff' };
  }
}
