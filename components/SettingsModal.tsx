import React, { useState } from 'react';
import { X, Sparkles, Database, Moon, Sun, Plus, Trash2 } from 'lucide-react';
import { Challenge, Category } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  useAi: boolean;
  setUseAi: (val: boolean) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  apiKeyPresent: boolean;
  customChallenges: Challenge[];
  onAddCustomChallenge: (c: Challenge) => void;
  onDeleteCustomChallenge: (id: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, useAi, setUseAi, darkMode, setDarkMode, apiKeyPresent,
  customChallenges, onAddCustomChallenge, onDeleteCustomChallenge
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'custom'>('general');
  const [newText, setNewText] = useState('');
  const [newDuration, setNewDuration] = useState(60);
  const [newCategory, setNewCategory] = useState<Category>(Category.FOCUS);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newText.trim()) return;
    const newChallenge: Challenge = {
      id: `custom-${Date.now()}`,
      text: newText,
      description: 'Deine eigene Challenge',
      durationSeconds: newDuration,
      category: newCategory,
      isCustom: true
    };
    onAddCustomChallenge(newChallenge);
    setNewText('');
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 pb-2 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Einstellungen</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-2 border-b border-gray-100 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'general' ? 'bg-mint-100 text-mint-700 dark:bg-mint-900/40 dark:text-mint-300' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
          >
            Allgemein
          </button>
          <button 
             onClick={() => setActiveTab('custom')}
             className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'custom' ? 'bg-mint-100 text-mint-700 dark:bg-mint-900/40 dark:text-mint-300' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
          >
            Eigene Karten
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Data Source */}
              <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-3">Modus</h3>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${!useAi ? 'bg-mint-100 text-mint-600' : 'bg-gray-100 dark:bg-slate-700 text-gray-400'}`}>
                      <Database size={20} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">Offline Karten</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setUseAi(false)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${!useAi ? 'border-mint-500' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    {!useAi && <div className="w-3 h-3 bg-mint-500 rounded-full" />}
                  </button>
                </div>

                <div className={`flex items-center justify-between ${!apiKeyPresent ? 'opacity-50 grayscale' : ''}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${useAi ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 dark:bg-slate-700 text-gray-400'}`}>
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">Magic Mode (AI)</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                        {apiKeyPresent ? 'Unendliche Vielfalt' : 'Benötigt API Key'}
                      </div>
                    </div>
                  </div>
                  <button 
                    disabled={!apiKeyPresent}
                    onClick={() => setUseAi(true)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${useAi ? 'border-amber-500' : 'border-gray-300 dark:border-gray-600'}`}
                  >
                    {useAi && <div className="w-3 h-3 bg-amber-500 rounded-full" />}
                  </button>
                </div>
              </div>

              {/* Appearance */}
              <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-3">Erscheinung</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-200 dark:bg-slate-700 rounded-full text-gray-600 dark:text-gray-300">
                      {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">Dark Mode</span>
                  </div>
                  <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative w-12 h-7 rounded-full transition-colors ${darkMode ? 'bg-mint-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${darkMode ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-6">
              {/* Add New */}
              <div className="space-y-3">
                <input 
                  type="text" 
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Titel der Challenge..."
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-mint-500"
                />
                <div className="flex gap-2">
                  <select 
                    value={newDuration} 
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-800 dark:text-white text-sm flex-1"
                  >
                    <option value={0}>Kein Timer</option>
                    <option value={30}>30 Sek.</option>
                    <option value={60}>1 Min.</option>
                    <option value={120}>2 Min.</option>
                    <option value={300}>5 Min.</option>
                  </select>
                  <select 
                    value={newCategory} 
                    onChange={(e) => setNewCategory(e.target.value as Category)}
                    className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-800 dark:text-white text-sm flex-1"
                  >
                    {Object.values(Category).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={handleAdd}
                  disabled={!newText.trim()}
                  className="w-full py-3 bg-mint-600 disabled:bg-mint-300 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Hinzufügen
                </button>
              </div>

              {/* List */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Deine Karten ({customChallenges.length})</h3>
                {customChallenges.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-gray-600 italic">Noch keine eigenen Karten erstellt.</p>
                )}
                {customChallenges.map(challenge => (
                  <div key={challenge.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800">
                    <div className="flex-1 mr-2">
                      <div className="font-medium text-gray-800 dark:text-gray-200 text-sm">{challenge.text}</div>
                      <div className="text-[10px] text-gray-500">{challenge.category} • {challenge.durationSeconds}s</div>
                    </div>
                    <button 
                      onClick={() => onDeleteCustomChallenge(challenge.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;