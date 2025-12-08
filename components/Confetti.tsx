import React, { useEffect, useState } from 'react';

const COLORS = ['bg-mint-400', 'bg-emerald-300', 'bg-teal-300', 'bg-amber-300', 'bg-sky-300'];

const Confetti: React.FC = () => {
  const [pieces, setPieces] = useState<number[]>([]);

  useEffect(() => {
    // Generate 50 pieces of confetti
    setPieces(Array.from({ length: 50 }, (_, i) => i));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {pieces.map((i) => {
        const left = Math.random() * 100;
        // Reduced delay range (was 0-2s, now 0-0.5s) for instant gratification
        const animDelay = Math.random() * 0.5; 
        // Reduced duration range (was 3-5s, now 1.5-3s) for faster fall
        const animDuration = 1.5 + Math.random() * 1.5; 
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const size = 6 + Math.random() * 6; // 6px to 12px

        return (
          <div
            key={i}
            className={`absolute rounded-sm ${color} animate-confetti`}
            style={{
              left: `${left}%`,
              top: `-20px`,
              width: `${size}px`,
              height: `${size * 0.6}px`, // slightly rectangular
              animationDelay: `${animDelay}s`,
              animationDuration: `${animDuration}s`,
              opacity: 0.8,
            }}
          />
        );
      })}
    </div>
  );
};

export default Confetti;