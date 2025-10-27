import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
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
  X,
  Download,
  FolderOpen,
  LogOut,
  User
} from 'lucide-react';
import { Editor } from './components/Editor';
import { SummarizerPanel } from './components/SummarizerPanel';
import { Translator } from './components/Translator';
import { OnboardingWelcome } from './components/OnboardingWelcome';
import { initDB, getNotes, saveNote } from './utils/storage';
import { isAIAvailable } from './utils/chrome-ai';
import { Input } from '@/components/ui/input';
import { LoginForm } from './components/LoginForm';
import { isLoggedIn, getCurrentUser, logoutUser } from './utils/auth';

const tabs = [
  { id: 'notes', label: 'My Notes', icon: Edit3, path: '/app/notes' },
  { id: 'summary', label: 'AI Summarizer', icon: FileText, path: '/app/summary' },
  { id: 'translate', label: 'Translator', icon: Languages, path: '/app/translate' },
] as const;

function WelcomePage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isLoggedIn()) {
      navigate('/app');
    } else {
      navigate('/login');
    }
  };

  return <OnboardingWelcome onGetStarted={handleGetStarted} />;
}

function AppLayout() {
  const [aiStatus, setAiStatus] = useState<'available' | 'unavailable' | 'checking'>('checking');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logoutUser();
    window.location.href = '/';
  };

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

  const isActiveTab = (path: string) => location.pathname === path;

  const exportNotes = async () => {
    const allNotes = await getNotes();
    const exportData = {
      notes: allNotes,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cbc-tutor-notes-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importNotes = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (importData.notes && Array.isArray(importData.notes)) {
        for (const note of importData.notes) {
          await saveNote(note);
        }
        alert(`Imported ${importData.notes.length} notes successfully!`);
      } else {
        alert('Invalid file format');
      }
    } catch (error) {
      alert('Error importing notes: ' + error);
    }
    
    event.target.value = '';
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
                CBC Tutor
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

            {/* User Info */}
            {currentUser && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground hidden sm:flex">
                <User size={14} />
                <span>{currentUser}</span>
              </div>
            )}

            {/* Export/Import */}
            <Button
              onClick={exportNotes}
              variant="outline"
              size="sm"
              className="gap-2 hidden sm:flex"
            >
              <Download size={16} />
              Export
            </Button>
            
            <Input
              type="file"
              accept=".json"
              onChange={importNotes}
              className="hidden"
              id="import-notes"
            />
            <Button
              onClick={() => document.getElementById('import-notes')?.click()}
              variant="outline"
              size="sm"
              className="gap-2 hidden sm:flex"
            >
              <FolderOpen size={16} />
              Import
            </Button>

            {/* Logout */}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2 hidden sm:flex"
            >
              <LogOut size={16} />
              Logout
            </Button>

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
                    navigate(tab.path);
                    setSidebarOpen(false);
                  }}
                  variant={isActiveTab(tab.path) ? 'default' : 'ghost'}
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
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(isLoggedIn());

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginForm onLogin={() => window.location.href = '/app'} />} />
          <Route path="/app" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/app/notes" replace />} />
            <Route path="notes" element={<Editor />} />
            <Route path="summary" element={<SummarizerPanel />} />
            <Route path="translate" element={<Translator />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;