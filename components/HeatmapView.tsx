import React, { useMemo } from 'react';
import { Completion, Category } from '../types';
import { CATEGORY_CONFIG } from '../constants';
import { Flame, Calendar, Trophy, ArrowLeft, Clock } from 'lucide-react';

interface HeatmapViewProps {
  completions: Completion[];
  streak: number;
  onBack: () => void;
}

const HeatmapView: React.FC<HeatmapViewProps> = ({ completions, streak, onBack }) => {
  
  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      
      const dayCompletions = completions.filter(c => {
        const cDate = new Date(c.timestamp);
        return cDate.toDateString() === d.toDateString();
      });

      result.push({
        date: d,
        count: dayCompletions.length,
        items: dayCompletions
      });
    }
    return result;
  }, [completions]);

  const totalCount = completions.length;

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-slate-700';
    if (count === 1) return 'bg-mint-300 dark:bg-mint-600';
    if (count === 2) return 'bg-mint-500 dark:bg-mint-500';
    return 'bg-mint-700 dark:bg-mint-400';
  };

  const getCategoryTheme = (cat: Category) => {
    return CATEGORY_CONFIG[cat] || { label: 'Allgemein', icon: Calendar, color: 'text-gray-500', bg: 'bg-gray-100' };
  };

  return (
    <div className="w-full h-full flex flex-col relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Scrollable Content Container */}
      {/* Added pb-32 to make space for the fixed button at the bottom */}
      <div className="flex-1 space-y-6 pb-32">
        
        {/* Header Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-mint-50 dark:border-slate-700 flex flex-col items-center justify-center space-y-2">
            <div className="bg-orange-100 dark:bg-orange-900/40 p-2 rounded-full text-orange-500">
              <Flame size={20} fill="currentColor" />
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">{streak}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Tage Streak</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-mint-50 dark:border-slate-700 flex flex-col items-center justify-center space-y-2">
            <div className="bg-mint-100 dark:bg-mint-900/40 p-2 rounded-full text-mint-500">
              <Trophy size={20} />
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">{totalCount}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Challenges</div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg shadow-mint-100 dark:shadow-none border border-mint-50 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="text-gray-400 dark:text-gray-500" size={18} />
            <h3 className="font-bold text-gray-700 dark:text-gray-200">Letzte 4 Wochen</h3>
          </div>
          
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => (
              <div key={d} className="text-center text-[10px] text-gray-300 dark:text-gray-600 font-medium">{d}</div>
            ))}
          </div>

          {/* The Dots */}
          <div className="grid grid-cols-7 gap-3">
            {days.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 ${getHeatmapColor(day.count)}`}
                  title={`${day.date.toLocaleDateString()}: ${day.count} Challenges`}
                >
                  {day.count > 0 && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full opacity-50" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          <h3 className="px-2 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase">Verlauf (Letzte 50)</h3>
          {completions.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-600 py-4 italic text-sm">
              Noch keine Challenges abgeschlossen.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Increased limit to 50 since we have infinite scroll via sticky button now */}
              {completions.slice(0, 50).map((comp) => (
                <div key={comp.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 flex gap-4 items-start">
                  <div className={`p-2 rounded-xl mt-1 ${getCategoryTheme(comp.category).bg}`}>
                      {React.createElement(getCategoryTheme(comp.category).icon, {
                        size: 16,
                        className: getCategoryTheme(comp.category).color
                      })}
                  </div>
                  <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-bold ${getCategoryTheme(comp.category).color}`}>{getCategoryTheme(comp.category).label}</span>
                        <div className="flex items-center text-gray-300 dark:text-gray-600 text-[10px] gap-1">
                          <Clock size={10} />
                          {new Date(comp.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {/* Find original challenge text if possible, though we don't store text in completion currently. 
                            We rely on the category for context or the note. */}
                        Challenge erledigt
                      </div>
                      {comp.note && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-slate-700/50 p-2 rounded-lg border-l-2 border-mint-300 dark:border-mint-700">
                          "{comp.note}"
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Sticky Back Button */}
      {/* Using a fixed position container with a gradient fade to make it look seamless over content */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-20 pointer-events-none">
        {/* Gradient fade background behind the button area */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-slate-950 dark:via-slate-950/90 h-32 -z-10" />
        
        <div className="w-full max-w-md mx-auto pointer-events-auto">
          <button 
            onClick={onBack}
            className="w-full py-4 bg-mint-100 dark:bg-mint-900 text-mint-700 dark:text-mint-300 font-bold rounded-2xl hover:bg-mint-200 dark:hover:bg-mint-800 transition-colors shadow-xl shadow-white/50 dark:shadow-black/50 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Zurück zum Würfeln
          </button>
        </div>
      </div>

    </div>
  );
};

export default HeatmapView;