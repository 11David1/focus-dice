import React, { useState, useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Dices, RotateCcw, Settings as SettingsIcon, Sparkles, CheckCircle, BarChart2, ArrowLeft, Trophy, Star, Filter } from 'lucide-react';
import { OFFLINE_CHALLENGES, CATEGORY_CONFIG, QUOTES } from './constants';
import { Challenge, Category, Completion } from './types';
import Timer from './components/Timer';
import SettingsModal from './components/SettingsModal';
import HeatmapView from './components/HeatmapView';
import Confetti from './components/Confetti';
import BreathingVisualizer from './components/BreathingVisualizer';
import { generateAiChallenge } from './services/geminiService';
import { saveCompletion, getCompletions, getStreak, saveCustomChallenge, getCustomChallenges, deleteCustomChallenge, getSettings, saveSettings } from './services/storage';
import { scheduleGoalCheck } from './services/notifications';

const App: React.FC = () => {
  // --- STATE ---
  
  // App Logic
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [useAi, setUseAi] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Timer / Active State
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  
  // UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'stats'>('home');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Data
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [streak, setStreak] = useState(0);
  const [customChallenges, setCustomChallenges] = useState<Challenge[]>([]);
  
  // Content (Quotes/Greeting)
  const [greeting, setGreeting] = useState('');
  const [dailyQuote, setDailyQuote] = useState(QUOTES[0]);

  // Journaling State
  const [journalEntry, setJournalEntry] = useState('');
  
  // Filter
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  // Environment
  const hasApiKey = !!process.env.API_KEY;

  // --- EFFECTS ---

  // Load Settings & Data on Mount
  useEffect(() => {
    const settings = getSettings();
    setUseAi(settings.useAi);
    setDarkMode(settings.darkMode);
    
    setCustomChallenges(getCustomChallenges());
    
    const data = getCompletions();
    setCompletions(data);
    setStreak(getStreak(data));

    updateGreetingAndQuote();
  }, []);

  // Persist Settings when changed
  useEffect(() => {
    saveSettings({ useAi, darkMode });
    // Apply Dark Mode Class
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [useAi, darkMode]);

  // Reload history when switching views
  useEffect(() => {
    if (currentView === 'stats') {
      const data = getCompletions();
      setCompletions(data);
      setStreak(getStreak(data));
    }
  }, [currentView]);

  // --- HANDLERS ---

  const updateGreetingAndQuote = () => {
    const hour = new Date().getHours();
    let greet = 'Hallo';
    if (hour < 12) greet = 'Guten Morgen';
    else if (hour < 18) greet = 'Guten Tag';
    else greet = 'Guten Abend';
    setGreeting(greet);

    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setDailyQuote(randomQuote);
  };

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  const toggleCategoryFilter = (cat: Category) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleCustomChallengeAdd = (c: Challenge) => {
    const updated = saveCustomChallenge(c);
    setCustomChallenges(updated);
  };

  const handleCustomChallengeDelete = (id: string) => {
    const updated = deleteCustomChallenge(id);
    setCustomChallenges(updated);
  };

  const handleRoll = useCallback(async () => {
    if (isRolling) return;
    
    setIsRolling(true);
    triggerHaptic();
    setCurrentChallenge(null);
    setShowSuccess(false);
    setJournalEntry(''); // Reset journal entry
    
    const rollDuration = 800; 

    // Filter Logic: Combine Offline + Custom -> Filter by Selection
    let pool = [...OFFLINE_CHALLENGES, ...customChallenges];
    if (selectedCategories.length > 0) {
      pool = pool.filter(c => selectedCategories.includes(c.category));
    }

    // Fallback if filter leaves empty pool
    if (pool.length === 0) pool = [...OFFLINE_CHALLENGES];

    let nextChallenge: Challenge;

    // AI Logic
    if (useAi && hasApiKey && selectedCategories.length === 0) {
      try {
        const aiResult = await generateAiChallenge();
        if (aiResult) {
          nextChallenge = aiResult;
        } else {
          nextChallenge = pool[Math.floor(Math.random() * pool.length)];
        }
      } catch (e) {
        nextChallenge = pool[Math.floor(Math.random() * pool.length)];
      }
    } else {
      nextChallenge = pool[Math.floor(Math.random() * pool.length)];
      await new Promise(r => setTimeout(r, rollDuration));
    }

    setCurrentChallenge(nextChallenge);
    setTimeLeft(nextChallenge.durationSeconds);
    setTimerActive(false);
    setIsRolling(false);
    triggerHaptic();

  }, [isRolling, useAi, hasApiKey, customChallenges, selectedCategories]);

  const resetTimer = () => {
    if (currentChallenge) {
      setTimeLeft(currentChallenge.durationSeconds);
      setTimerActive(false);
    }
  };

  const handleBackToStart = () => {
    setCurrentChallenge(null);
    updateGreetingAndQuote(); // Refresh quote when returning home
  };

  const handleCompletion = () => {
    if (!currentChallenge) return;
    
    triggerHaptic();
    // Save with journal entry if exists
    const entryText = journalEntry.trim() ? journalEntry.trim() : undefined;
    saveCompletion(currentChallenge, entryText);
    
    // NOTIFICATION LOGIC:
    // If it is the "Top Goal" challenge (id: 'j3') and the user wrote something, schedule a check.
    if (currentChallenge.id === 'j3' && entryText) {
      scheduleGoalCheck(entryText);
    }
    
    const newData = getCompletions();
    setCompletions(newData);
    setStreak(getStreak(newData));

    setTimerActive(false);
    setShowSuccess(true);
    
    setTimeout(() => {
        setShowSuccess(false);
        handleBackToStart();
    }, 2500);
  };

  const getCategoryTheme = (cat: Category) => {
    return CATEGORY_CONFIG[cat] || { label: 'Allgemein', icon: Sparkles, color: 'text-gray-500', bg: 'bg-gray-100' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-white dark:from-mint-950 dark:to-slate-950 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300 flex flex-col relative overflow-hidden">
      
      {showSuccess && <Confetti />}

      {/* Header */}
      <header className="flex justify-between items-center p-6 flex-shrink-0 z-10">
        <div className="flex items-center space-x-2">
          <div className="bg-mint-600 p-2 rounded-xl shadow-lg shadow-mint-200 dark:shadow-none">
            <Dices className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-mint-900 dark:text-mint-100">Focus Dice</h1>
        </div>
        <div className="flex space-x-2">
          <button 
            disabled={showSuccess}
            onClick={() => setCurrentView(currentView === 'home' ? 'stats' : 'home')}
            className={`p-3 rounded-full transition-all ${currentView === 'stats' ? 'bg-mint-100 dark:bg-mint-900/50 text-mint-600 dark:text-mint-300' : 'text-gray-400 dark:text-gray-500 hover:text-mint-600 dark:hover:text-mint-300'}`}
          >
            {currentView === 'home' ? <BarChart2 size={22} /> : <Dices size={22} />}
          </button>
          <button 
            disabled={showSuccess}
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 rounded-full hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all text-gray-400 dark:text-gray-500 hover:text-mint-600 dark:hover:text-mint-300"
          >
            <SettingsIcon size={22} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 pt-4 pb-32 w-full max-w-md mx-auto relative z-10">
        
        {/* VIEW: HOME */}
        {currentView === 'home' && (
          <>
            {/* Filter Chips (Only visible when not showing a challenge) */}
            {!currentChallenge && !isRolling && !showSuccess && (
              <div className="w-full mb-6 overflow-x-auto pb-2 scrollbar-hide">
                 <div className="flex space-x-2 px-1">
                   {Object.values(Category).map(cat => {
                     const isSelected = selectedCategories.includes(cat);
                     const config = CATEGORY_CONFIG[cat];
                     return (
                       <button
                         key={cat}
                         onClick={() => toggleCategoryFilter(cat)}
                         className={`
                           px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border
                           ${isSelected 
                             ? 'bg-mint-600 text-white border-mint-600 shadow-md shadow-mint-200 dark:shadow-none' 
                             : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-mint-300 dark:hover:border-slate-600'
                           }
                         `}
                       >
                         {config.label}
                       </button>
                     )
                   })}
                 </div>
              </div>
            )}

            {/* Welcome State (With Daily Wisdom) */}
            {!currentChallenge && !isRolling && !showSuccess && (
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8 animate-in fade-in duration-500 pb-12">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-mint-900 dark:text-white tracking-tight">
                    {greeting}.
                  </h2>
                  <div className="relative p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-mint-50 dark:border-slate-700 max-w-xs mx-auto">
                    <Sparkles className="absolute -top-3 -left-3 text-amber-400 w-6 h-6" fill="currentColor" />
                    <p className="text-gray-600 dark:text-gray-300 font-medium italic leading-relaxed text-sm">
                      "{dailyQuote.text}"
                    </p>
                    <p className="text-xs text-mint-500 dark:text-mint-400 mt-3 font-bold uppercase tracking-wider">
                      — {dailyQuote.author}
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-400 dark:text-gray-500 text-sm max-w-[200px]">
                  {selectedCategories.length > 0 
                    ? 'Würfle für deine gewählten Kategorien.'
                    : 'Würfle für deinen nächsten achtsamen Moment.'}
                </p>
              </div>
            )}

            {/* Rolling State */}
            {isRolling && (
              <div className="flex-1 flex flex-col justify-center items-center">
                 <Dices className="w-24 h-24 text-mint-400 animate-spin-slow" />
                 <p className="mt-8 text-mint-500 font-medium animate-pulse">
                   {useAi && selectedCategories.length === 0 ? 'Magic Mode generiert...' : 'Würfel rollen...'}
                 </p>
              </div>
            )}

            {/* Challenge Card */}
            {(currentChallenge || showSuccess) && !isRolling && (
              <div className="w-full flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                <div className={`w-full bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl shadow-mint-100 dark:shadow-black/50 overflow-hidden border border-mint-50 dark:border-slate-700 relative transition-all duration-500 ${showSuccess ? 'ring-4 ring-mint-200 dark:ring-mint-900 scale-105' : ''}`}>
                  
                  {showSuccess ? (
                    // SUCCESS STATE
                    <div className="flex flex-col items-center justify-center py-16 px-8 text-center animate-in fade-in zoom-in duration-500">
                      <div className="w-20 h-20 bg-gradient-to-tr from-amber-200 to-amber-100 dark:from-amber-600 dark:to-amber-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <Trophy className="text-amber-500 dark:text-amber-100 w-10 h-10 drop-shadow-sm" />
                      </div>
                      <h3 className="text-3xl font-bold text-mint-900 dark:text-white mb-2">Großartig!</h3>
                      <p className="text-mint-600 dark:text-mint-300 font-medium mb-6">Zeit für dich genommen.</p>
                      <div className="bg-mint-50 dark:bg-mint-900/30 px-4 py-2 rounded-full flex items-center gap-2">
                        <Star className="w-4 h-4 text-mint-400" fill="currentColor" />
                        <span className="text-sm font-bold text-mint-700 dark:text-mint-300">Streak: {streak} Tage</span>
                      </div>
                    </div>
                  ) : (
                    // CARD CONTENT
                    currentChallenge && (
                      <>
                        {/* Card Header */}
                        <div className={`h-24 ${getCategoryTheme(currentChallenge.category).bg} dark:bg-opacity-20 flex items-center justify-center relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-white/30 dark:bg-black/10 backdrop-blur-[2px]"></div>
                          {currentChallenge.isAiGenerated && (
                            <div className="absolute top-4 right-4 flex items-center space-x-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-lg">
                              <Sparkles size={12} className="text-amber-500" />
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">AI</span>
                            </div>
                          )}
                           {currentChallenge.isCustom && (
                            <div className="absolute top-4 right-4 flex items-center space-x-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-lg">
                              <Sparkles size={12} className="text-blue-500" />
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">EIGEN</span>
                            </div>
                          )}
                          {React.createElement(getCategoryTheme(currentChallenge.category).icon, {
                            size: 40,
                            className: `${getCategoryTheme(currentChallenge.category).color} opacity-80 z-10`
                          })}
                        </div>

                        {/* Card Body */}
                        <div className="p-8 text-center flex flex-col items-center">
                          <span className={`text-xs font-bold uppercase tracking-widest mb-3 ${getCategoryTheme(currentChallenge.category).color}`}>
                            {getCategoryTheme(currentChallenge.category).label}
                          </span>
                          
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                            {currentChallenge.text}
                          </h3>
                          
                          <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                            {currentChallenge.description}
                          </p>

                          {/* Journaling Input Field */}
                          {currentChallenge.category === Category.JOURNALING && (
                            <div className="w-full mb-6">
                              <textarea
                                value={journalEntry}
                                onChange={(e) => setJournalEntry(e.target.value)}
                                placeholder="Schreibe deine Gedanken hier..."
                                className="w-full p-4 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-900/30 rounded-2xl text-gray-700 dark:text-gray-200 placeholder-amber-300 dark:placeholder-amber-700/50 focus:outline-none focus:border-amber-300 transition-colors resize-none h-28 text-sm leading-relaxed"
                              />
                            </div>
                          )}

                          {/* Timer / Visualizer Section */}
                          {currentChallenge.durationSeconds > 0 ? (
                            <div className="w-full bg-gray-50 dark:bg-slate-900/50 rounded-3xl p-2 mb-2">
                              {currentChallenge.category === Category.BREATHING ? (
                                <BreathingVisualizer 
                                  duration={currentChallenge.durationSeconds}
                                  isActive={timerActive}
                                  onComplete={handleCompletion}
                                />
                              ) : (
                                <Timer 
                                  duration={currentChallenge.durationSeconds}
                                  timeLeft={timeLeft}
                                  isActive={timerActive}
                                  onTick={setTimeLeft}
                                  onComplete={handleCompletion}
                                  onToggle={() => setTimerActive(!timerActive)}
                                  onReset={resetTimer}
                                />
                              )}
                              
                              {/* Controls for Breathing */}
                              {currentChallenge.category === Category.BREATHING && (
                                <div className="flex justify-center pb-4 space-x-4">
                                  <button 
                                    onClick={() => setTimerActive(!timerActive)}
                                    className="px-6 py-2 rounded-full bg-mint-100 dark:bg-mint-900 text-mint-700 dark:text-mint-300 font-medium hover:bg-mint-200 transition-colors"
                                  >
                                    {timerActive ? 'Pause' : 'Start'}
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-full">
                              <button 
                                onClick={handleCompletion}
                                className="w-full bg-mint-100 dark:bg-mint-900 text-mint-700 dark:text-mint-300 font-bold py-4 rounded-2xl hover:bg-mint-200 dark:hover:bg-mint-800 transition-colors flex items-center justify-center gap-2"
                              >
                                <CheckCircle size={20} />
                                {currentChallenge.category === Category.JOURNALING && journalEntry.length > 0 
                                  ? 'Speichern & Fertig' 
                                  : 'Erledigt'}
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )
                  )}
                </div>
                
                {!showSuccess && (
                  <button 
                    onClick={handleBackToStart}
                    className="mt-6 text-gray-400 dark:text-gray-500 text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-2"
                  >
                    <RotateCcw size={14} />
                    Zurück zum Start
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* VIEW: STATS */}
        {currentView === 'stats' && (
          <HeatmapView 
            completions={completions} 
            streak={streak} 
            onBack={() => setCurrentView('home')}
          />
        )}

      </main>

      {/* Footer Action */}
      {!isRolling && currentView === 'home' && !showSuccess && (
        <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center z-40 pointer-events-none">
          <button
            onClick={handleRoll}
            className={`
              pointer-events-auto
              relative group overflow-hidden
              w-full max-w-xs h-16 rounded-2xl
              flex items-center justify-center space-x-3
              shadow-lg shadow-mint-300/50 dark:shadow-black/50
              transition-all duration-300 hover:-translate-y-1
              ${currentChallenge 
                ? 'bg-white dark:bg-slate-800 text-mint-600 dark:text-mint-400 border border-mint-100 dark:border-slate-600' 
                : useAi && selectedCategories.length === 0
                  ? 'bg-gradient-to-r from-amber-500 to-mint-600 text-white'
                  : 'bg-mint-600 dark:bg-mint-700 text-white'
              }
            `}
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            
            <Dices size={24} className={currentChallenge ? 'text-mint-600 dark:text-mint-400' : 'text-white'} />
            <span className="text-lg font-bold tracking-wide">
              {currentChallenge ? 'Neue Challenge' : 'Würfeln'}
            </span>
          </button>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        useAi={useAi}
        setUseAi={setUseAi}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        apiKeyPresent={hasApiKey}
        customChallenges={customChallenges}
        onAddCustomChallenge={handleCustomChallengeAdd}
        onDeleteCustomChallenge={handleCustomChallengeDelete}
      />

    </div>
  );
};

export default App;