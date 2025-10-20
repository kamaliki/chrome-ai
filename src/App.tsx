import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  Edit3, 
  FileText, 
  Timer as TimerIcon, 
  Sparkles, 
  Languages, 
  Moon, 
  Sun,
  Brain,
  Settings
} from 'lucide-react';
import { Editor } from './components/Editor';
import { SummarizerPanel } from './components/SummarizerPanel';
import { Timer } from './components/Timer';
import { PromptGenerator } from './components/PromptGenerator';
import { Translator } from './components/Translator';
import { initDB } from './utils/storage';
import { isAIAvailable } from './utils/chrome-ai';

type Tab = 'editor' | 'summarizer' | 'timer' | 'prompts' | 'translator';

const tabs = [
  { id: 'editor', label: 'Focus Journal', icon: Edit3 },
  { id: 'summarizer', label: 'AI Summarizer', icon: FileText },
  { id: 'timer', label: 'Focus Timer', icon: TimerIcon },
  { id: 'prompts', label: 'Daily Prompts', icon: Sparkles },
  { id: 'translator', label: 'Translator', icon: Languages },
] as const;

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('editor');
  const [isDark, setIsDark] = useState(false);
  const [aiStatus, setAiStatus] = useState<'available' | 'unavailable' | 'checking'>('checking');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Initialize database
    await initDB();
    
    // Check theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
    
    // Check AI availability
    const aiAvailable = await isAIAvailable();
    setAiStatus(aiAvailable ? 'available' : 'unavailable');
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'editor':
        return <Editor />;
      case 'summarizer':
        return <SummarizerPanel />;
      case 'timer':
        return <Timer />;
      case 'prompts':
        return <PromptGenerator />;
      case 'translator':
        return <Translator />;
      default:
        return <Editor />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Brain className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                FocusFlow
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Privacy-first AI productivity assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* AI Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                aiStatus === 'available' ? 'bg-green-500' : 
                aiStatus === 'unavailable' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {aiStatus === 'available' ? 'AI Ready' : 
                 aiStatus === 'unavailable' ? 'AI Unavailable' : 'Checking AI...'}
              </span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* AI Status Warning */}
          {aiStatus === 'unavailable' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
            >
              <div className="flex items-start gap-2">
                <Settings className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Chrome AI Unavailable
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Enable Chrome's built-in AI features for full functionality.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderActiveComponent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;