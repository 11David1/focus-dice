import React, { useEffect, useState } from 'react';

interface TimerProps {
  duration: number;
  timeLeft: number;
  isActive: boolean;
  onTick: (newTime: number) => void;
  onComplete: () => void;
  onToggle: () => void;
  onReset: () => void;
}

const Timer: React.FC<TimerProps> = ({ duration, timeLeft, isActive, onTick, onComplete, onToggle, onReset }) => {
  const [justStarted, setJustStarted] = useState(false);

  // Timer Interval Logic
  useEffect(() => {
    let interval: number | undefined;
    
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        onTick(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      onComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTick, onComplete]);

  // Visual Feedback Trigger when starting
  useEffect(() => {
    if (isActive) {
      setJustStarted(true);
      const t = setTimeout(() => setJustStarted(false), 500); // 500ms pulse
      return () => clearTimeout(t);
    }
  }, [isActive]);

  // Calculate circle progress
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / duration;
  const dashoffset = circumference * (1 - progress);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-4">
      <div className={`relative w-40 h-40 flex items-center justify-center transition-transform duration-500 ease-out ${justStarted ? 'scale-110' : 'scale-100'}`}>
        {/* Background Circle */}
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-mint-100 dark:text-mint-900/50"
          />
          {/* Progress Circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            className={`text-mint-500 dark:text-mint-400 transition-all duration-1000 ease-linear ${justStarted ? 'stroke-mint-400 dark:stroke-mint-200' : ''}`}
          />
        </svg>
        <div className="text-3xl font-bold text-mint-800 dark:text-mint-200 font-mono z-10 transition-colors duration-300">
          {formatTime(timeLeft)}
        </div>
        
        {/* Subtle Start Ripple (behind) */}
        {justStarted && (
           <div className="absolute inset-0 bg-mint-200 dark:bg-mint-800 rounded-full animate-ping opacity-20"></div>
        )}
      </div>

      <div className="flex space-x-4">
        <button 
          onClick={onToggle}
          className="px-6 py-2 rounded-full bg-mint-100 dark:bg-mint-900 text-mint-700 dark:text-mint-300 font-medium hover:bg-mint-200 dark:hover:bg-mint-800 transition-all active:scale-95"
        >
          {isActive ? 'Pause' : timeLeft === 0 ? 'Fertig' : 'Start'}
        </button>
        {timeLeft !== duration && (
          <button 
             onClick={onReset}
             className="px-4 py-2 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 font-medium transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default Timer;