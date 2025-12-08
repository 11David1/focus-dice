import React, { useEffect, useState, useRef } from 'react';

interface BreathingVisualizerProps {
  isActive: boolean;
  onComplete: () => void;
  duration: number;
}

const BreathingVisualizer: React.FC<BreathingVisualizerProps> = ({ isActive, onComplete, duration }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [phase, setPhase] = useState<'Einatmen' | 'Halten' | 'Ausatmen'>('Einatmen');
  const cycleTimeRef = useRef(0);

  // Reset local timeLeft when duration prop changes (new challenge)
  useEffect(() => {
    setTimeLeft(duration);
    setPhase('Einatmen');
    cycleTimeRef.current = 0;
  }, [duration]);

  // Main Loop for Timer and Phase
  useEffect(() => {
    let interval: number;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        // 1. Handle Countdown
        setTimeLeft(prev => {
          if (prev <= 1) {
             // Will trigger onComplete in the next effect or here
             return 0;
          }
          return prev - 1;
        });

      }, 1000);
      
      // Separate fast interval for text phase sync
      const phaseInterval = window.setInterval(() => {
         // Cycle duration is 16000ms (4s In, 4s Hold, 4s Out, 4s Hold)
         // Increment by 100ms
         cycleTimeRef.current = (cycleTimeRef.current + 100) % 16000;
         const t = cycleTimeRef.current;
         
         if (t < 4000) setPhase('Einatmen');
         else if (t < 8000) setPhase('Halten');
         else if (t < 12000) setPhase('Ausatmen');
         else setPhase('Halten');
      }, 100);

      return () => {
        clearInterval(interval);
        clearInterval(phaseInterval);
      };
    } else if (!isActive) {
      // Reset cycle when paused so animation and text restart together on resume
      // This is because CSS animation resets on class removal/add
      cycleTimeRef.current = 0;
      setPhase('Einatmen');
    }
  }, [isActive, timeLeft]);

  // Handle Completion
  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      onComplete();
    }
  }, [timeLeft, isActive, onComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Visualizer Circle */}
      <div className={`relative w-48 h-48 flex items-center justify-center mb-8 transition-transform duration-700 ${isActive ? 'scale-105' : 'scale-100'}`}>
        {/* Outer Halo */}
        <div className={`absolute inset-0 bg-sky-200 dark:bg-sky-900 rounded-full blur-xl transition-all duration-1000 ${isActive ? 'animate-breathe' : 'scale-100 opacity-20'}`}></div>
        
        {/* Main Circle */}
        <div className={`w-32 h-32 bg-sky-400 dark:bg-sky-600 rounded-full shadow-lg flex items-center justify-center transition-all duration-1000 z-10 ${isActive ? 'animate-breathe' : 'scale-100'}`}>
          <span className="text-white font-bold text-sm tracking-widest uppercase animate-in fade-in">
            {isActive ? phase : 'Start'}
          </span>
        </div>
      </div>

      <div className="text-2xl font-mono font-bold text-sky-600 dark:text-sky-300 mb-2">
        {formatTime(timeLeft)}
      </div>
      
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center max-w-xs">
        {isActive ? 'Folge dem Rhythmus des Kreises.' : 'Drücke Start zum Beginnen.'}
      </p>
    </div>
  );
};

export default BreathingVisualizer;