import React from 'react';
import { SessionRecord } from '../types';

interface SessionHistoryProps {
  sessions: SessionRecord[];
  onClear: () => void;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ sessions, onClear }) => {
  if (sessions.length === 0) return null;

  const formatDuration = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
  };

  const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  // Group by date
  const groupedSessions = sessions.reduce<Record<string, SessionRecord[]>>((acc, session) => {
      const date = formatDate(session.date);
      if (!acc[date]) acc[date] = [];
      acc[date].push(session);
      return acc;
  }, {});

  return (
    <div className="w-full max-w-md mt-8 px-4 pb-20">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-xl font-bold text-gray-200">Historial</h3>
        <button onClick={onClear} className="text-xs text-red-400 hover:text-red-300">Borrar Todo</button>
      </div>
      
      <div className="space-y-6">
        {Object.entries(groupedSessions).map(([date, dateSessions]) => (
            <div key={date}>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-2">{date}</h4>
                <div className="space-y-3">
                    {(dateSessions as SessionRecord[]).map((session) => (
                    <div key={session.id} className="bg-gray-800/40 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center border border-gray-700/30">
                        <div>
                        <div className="text-amber-400 font-bold text-sm">{session.category}</div>
                        <div className="text-gray-500 text-xs mt-1">
                            {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                            {new Date(session.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        </div>
                        <div className="text-xl font-mono text-gray-200">
                        {formatDuration(session.duration)}
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default SessionHistory;