import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { 
  Edit3, 
  FileText, 
  Languages, 
  Brain,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { Editor } from './components/Editor';
import { SummarizerPanel } from './components/SummarizerPanel';
import { Translator } from './components/Translator';
import { initDB } from './utils/storage';
import { isAIAvailable } from './utils/chrome-ai';

type Tab = 'editor' | 'summarizer' | 'timer' | 'prompts' | 'translator';

const tabs = [
  { id: 'editor', label: 'My Notes', icon: Edit3 },
  { id: 'summarizer', label: 'AI Summarizer', icon: FileText },
  { id: 'translator', label: 'Translator', icon: Languages },
] as const;

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('editor');
  const [aiStatus, setAiStatus] = useState<'available' | 'unavailable' | 'checking'>('checking');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Initialize database
    await initDB();
    
    // Check AI availability
    const aiAvailable = await isAIAvailable();
    setAiStatus(aiAvailable ? 'available' : 'unavailable');
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'editor':
        return <Editor />;
      case 'summarizer':
        return <SummarizerPanel />;
      case 'translator':
        return <Translator />;
      default:
        return <Editor />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            
            <div className="p-2 bg-primary rounded-lg">
              <Brain className="text-primary-foreground" size={24} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground">
                FocusFlow
              </h1>
              <p className="text-sm text-muted-foreground">
                Privacy-first AI tutor assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* AI Status */}
            <Badge 
              variant={aiStatus === 'available' ? 'default' : aiStatus === 'unavailable' ? 'destructive' : 'secondary'}
              className="hidden sm:inline-flex"
            >
              {aiStatus === 'available' ? 'AI Ready' : 
               aiStatus === 'unavailable' ? 'AI Unavailable' : 'Checking AI...'}
            </Badge>

            {/* Theme Toggle */}
            <ModeToggle />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <nav className={`
          fixed md:relative z-50 md:z-auto
          w-64 h-full md:h-auto
          bg-card border-r p-4
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  className="w-full justify-start gap-3"
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </Button>
              );
            })}
          </div>

          {/* AI Status Warning */}
          {aiStatus === 'unavailable' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
            >
              <div className="flex items-start gap-2">
                <Settings className="text-destructive mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-destructive">
                    Chrome AI Unavailable
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enable Chrome's built-in AI features for full functionality.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto md:ml-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              {renderActiveComponent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AppContent />
    </ThemeProvider>
  );
}

export default App;