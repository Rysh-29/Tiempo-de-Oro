import React from 'react';

interface TimerDisplayProps {
  seconds: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds }) => {
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="text-8xl font-thin tracking-tighter text-white tabular-nums select-none drop-shadow-2xl">
        {formatTime(seconds)}
      </div>
      <p className="text-gray-400 text-sm font-medium tracking-widest uppercase mt-2 opacity-60">Tiempo Transcurrido</p>
    </div>
  );
};

export default TimerDisplay;