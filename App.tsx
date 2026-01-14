import React, { useState, useEffect, useRef } from 'react';
import { MainCategory, SubCategory, SessionRecord, Segment } from './types';
import TimerDisplay from './components/TimerDisplay';
import CategoryButton from './components/CategoryButton';
import SessionHistory from './components/SessionHistory';

// Iconos actualizados para reflejar la nueva jerarquía
const Icons = {
  Play: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  Stop: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>,
  Study: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  Banqueo: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Video: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  Apuntes: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Lectura: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
};

export default function App() {
  // --- ESTADO ---
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // Tiempo total de la sesión madre
  const [startTime, setStartTime] = useState<number | null>(null);
  const [history, setHistory] = useState<SessionRecord[]>([]);
  
  // Estado de la jerarquía activa
  const [activeMainCategory, setActiveMainCategory] = useState<MainCategory | null>(null);
  const [activeSegments, setActiveSegments] = useState<Segment[]>([]);
  const [currentSubCategory, setCurrentSubCategory] = useState<SubCategory>(SubCategory.GENERAL);

  const timerRef = useRef<number | null>(null);

  // --- PERSISTENCIA ---
  useEffect(() => {
    const savedHistory = localStorage.getItem('tiempooro_history_v2');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('tiempooro_history_v2', JSON.stringify(history));
  }, [history]);

  // --- LÓGICA DEL CRONÓMETRO ---
  useEffect(() => {
    if (isActive && startTime) {
      timerRef.current = window.setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, startTime]);

  // --- ACCIONES ---

  // Iniciar una Sesión Madre (ej. Estudio)
  const handleStartSession = (category: MainCategory) => {
    const now = Date.now();
    setStartTime(now);
    setActiveMainCategory(category);
    setIsActive(true);
    setElapsedTime(0);
    
    // Iniciar el primer segmento automáticamente
    const firstSegment: Segment = {
      id: crypto.randomUUID(),
      subCategory: SubCategory.GENERAL,
      startTime: now,
      endTime: null
    };
    setActiveSegments([firstSegment]);
    setCurrentSubCategory(SubCategory.GENERAL);
  };

  // Cambiar de Subcategoría (Cierra la anterior, abre la nueva)
  const handleSubCategoryChange = (newSub: SubCategory) => {
    if (newSub === currentSubCategory) return;
    
    const now = Date.now();
    
    setActiveSegments(prev => {
      // 1. Finalizar el segmento actual
      const updatedSegments = prev.map(seg => 
        seg.endTime === null ? { ...seg, endTime: now } : seg
      );
      
      // 2. Añadir el nuevo segmento
      const nextSegment: Segment = {
        id: crypto.randomUUID(),
        subCategory: newSub,
        startTime: now,
        endTime: null
      };
      
      return [...updatedSegments, nextSegment];
    });
    
    setCurrentSubCategory(newSub);
  };

  // Finalizar Sesión Madre y Guardar Todo
  const handleStopSession = () => {
    if (!startTime || !activeMainCategory) return;
    
    const now = Date.now();
    
    // Cerrar el último segmento activo
    const finalSegments = activeSegments.map(seg => 
      seg.endTime === null ? { ...seg, endTime: now } : seg
    );

    const newRecord: SessionRecord = {
      id: crypto.randomUUID(),
      mainCategory: activeMainCategory,
      startTime: startTime,
      endTime: now,
      duration: elapsedTime,
      segments: finalSegments,
      date: new Date().toISOString()
    };

    setHistory(prev => [newRecord, ...prev]);
    setIsActive(false);
    setStartTime(null);
    setActiveMainCategory(null);
    setActiveSegments([]);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      
      {/* Header Estilo One UI */}
      <header className="p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
            Tiempo de Oro
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Registro Clínico</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-800'}`}></div>
      </header>

      <main className="max-w-md mx-auto px-6 pb-24">
        
        {!isActive ? (
          /* PANTALLA DE INICIO: Selección de Modo */
          <div className="py-12 flex flex-col items-center">
            <h2 className="text-gray-400 mb-8 font-medium">¿Qué vas a hacer ahora?</h2>
            
            <button 
              onClick={() => handleStartSession(MainCategory.ESTUDIO)}
              className="w-full bg-gray-900 border border-gray-800 p-8 rounded-[2.5rem] flex flex-col items-center group active:scale-95 transition-all shadow-xl"
            >
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-gray-950 mb-4 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                {Icons.Study}
              </div>
              <span className="text-xl font-bold">Modo Estudio</span>
              <span className="text-xs text-gray-500 mt-1">Activa Rutina Samsung</span>
            </button>

            <div className="grid grid-cols-2 gap-4 mt-4 w-full">
               <button onClick={() => handleStartSession(MainCategory.EJERCICIO)} className="bg-gray-900/50 p-6 rounded-[2rem] border border-gray-800 text-sm font-bold opacity-60">Ejercicio</button>
               <button onClick={() => handleStartSession(MainCategory.OCIO)} className="bg-gray-900/50 p-6 rounded-[2rem] border border-gray-800 text-sm font-bold opacity-60">Ocio</button>
            </div>
          </div>
        ) : (
          /* PANTALLA ACTIVA: Sesión y Subcategorías */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="bg-gray-900/80 backdrop-blur-2xl border border-gray-800 p-8 rounded-[3rem] shadow-2xl mb-8">
               <div className="text-center mb-2">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/60">Sesión de {activeMainCategory}</span>
               </div>
               
               <TimerDisplay seconds={elapsedTime} />

               {/* Botones de Subcategoría (Solo si es Estudio) */}
               {activeMainCategory === MainCategory.ESTUDIO && (
                 <div className="grid grid-cols-2 gap-3 mt-4">
                   <button 
                    onClick={() => handleSubCategoryChange(SubCategory.BANQUEO)}
                    className={`flex items-center gap-2 p-4 rounded-2xl border transition-all ${currentSubCategory === SubCategory.BANQUEO ? 'bg-amber-500 text-black border-amber-400' : 'bg-gray-800/40 border-gray-700 text-gray-400'}`}
                   >
                     {Icons.Banqueo} <span className="text-xs font-bold">Banqueo</span>
                   </button>
                   <button 
                    onClick={() => handleSubCategoryChange(SubCategory.VIDEOS)}
                    className={`flex items-center gap-2 p-4 rounded-2xl border transition-all ${currentSubCategory === SubCategory.VIDEOS ? 'bg-amber-500 text-black border-amber-400' : 'bg-gray-800/40 border-gray-700 text-gray-400'}`}
                   >
                     {Icons.Video} <span className="text-xs font-bold">Videoclase</span>
                   </button>
                   <button 
                    onClick={() => handleSubCategoryChange(SubCategory.APUNTES)}
                    className={`flex items-center gap-2 p-4 rounded-2xl border transition-all ${currentSubCategory === SubCategory.APUNTES ? 'bg-amber-500 text-black border-amber-400' : 'bg-gray-800/40 border-gray-700 text-gray-400'}`}
                   >
                     {Icons.Apuntes} <span className="text-xs font-bold">Apuntes</span>
                   </button>
                   <button 
                    onClick={() => handleSubCategoryChange(SubCategory.LECTURA)}
                    className={`flex items-center gap-2 p-4 rounded-2xl border transition-all ${currentSubCategory === SubCategory.LECTURA ? 'bg-amber-500 text-black border-amber-400' : 'bg-gray-800/40 border-gray-700 text-gray-400'}`}
                   >
                     {Icons.Lectura} <span className="text-xs font-bold">Lectura</span>
                   </button>
                 </div>
               )}
            </div>

            <button
              onClick={handleStopSession}
              className="w-full py-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-500 font-black text-lg hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3"
            >
              Finalizar {activeMainCategory}
            </button>
          </div>
        )}

        {/* Historial (Solo visible si no hay sesión activa) */}
        {!isActive && (
          <SessionHistory 
            sessions={history} 
            onClear={() => confirm("¿Limpiar historial?") && setHistory([])} 
          />
        )}
      </main>
    </div>
  );
}