"use client"
import React from 'react';

const WeeklyEvolution = ({ chunks = [0, 0, 0, 0, 0, 0, 0], xp = [0, 0, 0, 0, 0, 0, 0], total = 0 }) => {
  const days = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  
  // Find maxes to scale charts, ensure some visual padding
  const maxChunks = Math.max(...chunks, 5);

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950/50 dark:bg-zinc-950/50 p-8 shadow-2xl border border-zinc-800/60 transition-all hover:scale-[1.01] hover:shadow-primary/5 group">
      {/* Background glow for dark theme */}
      <div className="absolute top-0 right-0 h-48 w-48 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      
      <div className="relative z-20 flex items-center justify-between mb-8">
        <h3 className="text-lg font-black text-white tracking-tight">Evolução Semanal</h3>
        <div className="flex gap-6">
          <div className="flex flex-col items-end">
            <span className="text-3xl font-black text-amber-500 leading-none">{xp.reduce((a, b) => a + b, 0)}</span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">XP Ganho</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-3xl font-black text-primary leading-none">{total}</span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Chunks</span>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 flex h-48 items-end justify-between gap-2 md:gap-4 mt-12 pr-2">
        {/* Bars and Tooltips */}
        {chunks.map((count, i) => {
          // Height percentage for chunks (0% for empty)
          const hPercent = count === 0 ? 0 : Math.round((count / maxChunks) * 100);
          
          return (
            <div key={i} className="group/bar relative flex flex-1 flex-col items-center h-full justify-end">
              {/* Tooltip on hover */}
              <div className="absolute -top-12 z-30 opacity-0 group-hover/bar:opacity-100 transition-opacity text-xs font-black text-white bg-zinc-800 px-3 py-1.5 rounded-lg pointer-events-none flex whitespace-nowrap gap-2 items-center shadow-xl border border-zinc-700">
                <span className="text-primary">{count} C</span>
                <span className="text-zinc-500">|</span>
                <span className="text-amber-500">{xp[i]} XP</span>
              </div>
              
              {/* Bar Container */}
              <div className="w-full h-full flex items-end justify-center relative">
                {/* Empty trace line in background */}
                <div className="absolute bottom-0 w-full h-full border-b-2 border-dashed border-zinc-800/50" />
                
                {count > 0 ? (
                  <div 
                    className="w-full max-w-[40px] rounded-t-xl transition-all duration-500 hover:brightness-110 relative overflow-hidden bg-gradient-to-t from-orange-600 to-primary shadow-[0_0_15px_rgba(249,115,22,0.15)] group-hover/bar:shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                    style={{ height: `${Math.max(10, hPercent)}%` }} // At least 10% if > 0
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                  </div>
                ) : (
                  <div className="w-full max-w-[40px] h-2 rounded-full bg-zinc-800/50 transition-colors group-hover/bar:bg-zinc-700/50" />
                )}
              </div>

              <span className="mt-3 h-4 flex items-center text-[11px] font-black text-zinc-500 uppercase tracking-widest shrink-0">
                {days[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyEvolution;
