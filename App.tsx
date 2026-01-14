import React, { useState, useEffect, useRef } from 'react';
import { Category, SessionRecord } from './types';
import TimerDisplay from './components/TimerDisplay';
import CategoryButton from './components/CategoryButton';
import SessionHistory from './components/SessionHistory';

// SVG Icons
const Icons = {
  Play: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  Stop: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>,
  Book: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Video: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  Edit: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
};

export default function App() {
  // State
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentCategory, setCurrentCategory] = useState<Category>(Category.GENERAL);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [history, setHistory] = useState<SessionRecord[]>([]);
  
  const timerRef = useRef<number | null>(null);

  // Load persistence
  useEffect(() => {
    const savedHistory = localStorage.getItem('tiempooro_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    const savedState = localStorage.getItem('tiempooro_current_session');
    if (savedState) {
      const { start, category } = JSON.parse(savedState);
      if (start) {
        // Resume session calculation
        const now = Date.now();
        const diff = Math.floor((now - start) / 1000);
        setStartTime(start);
        setCurrentCategory(category);
        setElapsedTime(diff);
        setIsActive(true);
      }
    }
  }, []);

  // Timer Logic
  useEffect(() => {
    if (isActive && startTime) {
      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, startTime]);

  // Save active session state for crash recovery
  useEffect(() => {
    if (isActive && startTime) {
      localStorage.setItem('tiempooro_current_session', JSON.stringify({
        start: startTime,
        category: currentCategory
      }));
    } else {
      localStorage.removeItem('tiempooro_current_session');
    }
  }, [isActive, startTime, currentCategory]);

  // Save history
  useEffect(() => {
    localStorage.setItem('tiempooro_history', JSON.stringify(history));
  }, [history]);

  const handleStart = () => {
    setStartTime(Date.now());
    setIsActive(true);
    setCurrentCategory(Category.GENERAL);
  };

  const handleStop = () => {
    if (!startTime) return;
    
    const endTime = Date.now();
    const newRecord: SessionRecord = {
      id: crypto.randomUUID(),
      startTime,
      endTime,
      duration: elapsedTime,
      category: currentCategory,
      date: new Date().toISOString()
    };

    setHistory(prev => [newRecord, ...prev]);
    setIsActive(false);
    setElapsedTime(0);
    setStartTime(null);
  };

  const handleCategoryChange = (category: Category) => {
    setCurrentCategory(category);
  };

  const clearHistory = () => {
    if(confirm("¿Borrar todo el historial?")) {
        setHistory([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-950 text-gray-100 font-sans selection:bg-amber-500/30">
      
      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            Tiempo de Oro
          </h1>
          <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Tu recurso más valioso</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center shadow-inner">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center relative px-6">
        
        {isActive ? (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-500">
            
            {/* Active Session View */}
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 p-8 rounded-[2.5rem] shadow-2xl w-full mb-8 relative overflow-hidden">
               {/* Glow effect */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
               
               <div className="text-center mb-6">
                 <span className="px-3 py-1 rounded-full bg-gray-800 text-amber-500 text-xs font-bold uppercase tracking-wider border border-gray-700/50">
                   En Progreso
                 </span>
               </div>

               <TimerDisplay seconds={elapsedTime} />
               
               <div className="grid grid-cols-3 gap-3 mt-8">
                 <CategoryButton 
                    category={Category.BANQUEO} 
                    isActive={currentCategory === Category.BANQUEO} 
                    onClick={handleCategoryChange} 
                    icon={Icons.Book}
                 />
                 <CategoryButton 
                    category={Category.VIDEOS} 
                    isActive={currentCategory === Category.VIDEOS} 
                    onClick={handleCategoryChange} 
                    icon={Icons.Video}
                 />
                 <CategoryButton 
                    category={Category.APUNTES} 
                    isActive={currentCategory === Category.APUNTES} 
                    onClick={handleCategoryChange} 
                    icon={Icons.Edit}
                 />
               </div>
            </div>

            <button
              onClick={handleStop}
              className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-lg shadow-lg hover:shadow-red-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <span className="bg-white/20 p-1 rounded-full">{Icons.Stop}</span>
              Finalizar Sesión
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 py-12">
            {/* Idle View - Big Start Button */}
            <button
              onClick={handleStart}
              className="group relative w-64 h-64 rounded-full flex flex-col items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95 touch-manipulation"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-[20px_20px_60px_#02040a,-20px_-20px_60px_#141b2e]"></div>
              <div className="absolute inset-[3px] rounded-full bg-gray-950 flex items-center justify-center">
                 <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              {/* Inner Circle Content */}
              <div className="z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-amber-500 text-gray-950 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(245,158,11,0.4)] group-hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] transition-all duration-500">
                   {Icons.Play}
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">Iniciar</span>
                <span className="text-sm text-gray-500 mt-1">Sesión</span>
              </div>
              
              {/* Rings */}
              <div className="absolute inset-0 rounded-full border border-gray-800/50 scale-110 opacity-30"></div>
              <div className="absolute inset-0 rounded-full border border-dashed border-gray-700/30 scale-125 opacity-20 animate-spin-slow" style={{animationDuration: '60s'}}></div>
            </button>
            
            <p className="mt-12 text-gray-500 text-center max-w-xs text-sm leading-relaxed">
              "El tiempo es el único capital de aquellos que tienen la fortuna solo como meta."
            </p>
          </div>
        )}

      </main>

      {/* History Section - Always visible but pushed down when active */}
      {!isActive && <SessionHistory sessions={history} onClear={clearHistory} />}
      
    </div>
  );
}