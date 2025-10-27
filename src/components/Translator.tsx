import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Languages, ArrowRight, Copy, Check, Clock } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TranslationHistory {
  id: string;
  inputText: string;
  outputText: string;
  targetLanguage: string;
  timestamp: Date;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ja', name: 'Japanese' },
  { code: 'sw-KE', name: 'Swahili' }
];

export const Translator: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('sw-KE');
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { translateText, detectLanguage, isLoading } = useAI();
  const [translationHistory, setTranslationHistory] = useState<TranslationHistory[]>([]);
  const [detectedLanguage, setDetectedLanguage] = useState<{language: string, confidence: number} | null>(null);

  // Load translation history on component mount
  React.useEffect(() => {
    const saved = localStorage.getItem('translation-history');
    if (saved) {
      const parsed = JSON.parse(saved).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
      setTranslationHistory(parsed);
    }
  }, []);

  // Detect language when input changes
  React.useEffect(() => {
    const detectInputLanguage = async () => {
      if (inputText.trim().length > 10) {
        const result = await detectLanguage(inputText);
        setDetectedLanguage(result);
      } else {
        setDetectedLanguage(null);
      }
    };
    
    const timeoutId = setTimeout(detectInputLanguage, 500);
    return () => clearTimeout(timeoutId);
  }, [inputText, detectLanguage]);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    const translated = await translateText(inputText, targetLanguage);
    setOutputText(translated);
    
    // Save to history
    const historyItem: TranslationHistory = {
      id: Date.now().toString(),
      inputText,
      outputText: translated,
      targetLanguage,
      timestamp: new Date()
    };
    
    const newHistory = [historyItem, ...translationHistory].slice(0, 50); // Keep last 50
    setTranslationHistory(newHistory);
    localStorage.setItem('translation-history', JSON.stringify(newHistory));
  };

  const handleCopy = async () => {
    if (outputText) {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleTranslate();
    }
  };

  return (
    <div className="h-full p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            AI Translator
          </h2>
          <p className="text-muted-foreground">
            Translate text instantly with Chrome's built-in AI
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {detectedLanguage ? (
                <div className="flex items-center gap-1">
                  <span>{detectedLanguage.language.toUpperCase()}</span>
                  <span className="text-xs text-green-600">({Math.round(detectedLanguage.confidence * 100)}%)</span>
                </div>
              ) : (
                'Auto-detect'
              )}
            </span>
          </div>
          
          <ArrowRight className="text-muted-foreground" size={20} />
          
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="px-4 py-2 border border-input rounded-lg bg-background text-foreground"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Translation Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="text-primary" size={20} />
                Original Text
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter text to translate..."
                className="h-64 resize-none"
              />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {inputText.length} characters
                </span>
                
                <Button
                  onClick={handleTranslate}
                  disabled={isLoading || !inputText.trim()}
                  className="gap-2"
                >
                  <Languages size={16} />
                  {isLoading ? 'Translating...' : 'Translate'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="text-green-600 dark:text-green-400" size={20} />
                  Translation
                </div>
                
                {outputText && (
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full h-64 p-4 border rounded-lg bg-muted/50 overflow-y-auto">
                {outputText ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="leading-relaxed text-foreground"
                  >
                    {outputText}
                  </motion.p>
                ) : (
                  <p className="text-muted-foreground italic">
                    Translation will appear here...
                  </p>
                )}
              </div>
              
              {outputText && (
                <div className="text-sm text-muted-foreground">
                  Translated to {languages.find(l => l.code === targetLanguage)?.name}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Tip: Press Ctrl+Enter to translate quickly
          </p>
          
          <div className="flex justify-center gap-2">
            <Button
              onClick={() => setInputText('')}
              variant="outline"
              size="sm"
            >
              Clear Input
            </Button>
            
            <Button
              onClick={() => {
                setInputText(outputText);
                setOutputText('');
              }}
              disabled={!outputText}
              variant="secondary"
              size="sm"
            >
              Swap Languages
            </Button>
            
            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant={showHistory ? "default" : "outline"}
              size="sm"
            >
              <Clock size={16} className="mr-2" />
              History
            </Button>
          </div>
        </div>
        
        {/* Translation History */}
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="text-blue-500" size={20} />
                  Translation History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {translationHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No translations yet. Start translating to build your history!
                    </p>
                  ) : (
                    translationHistory.map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                           onClick={() => {
                             setInputText(item.inputText);
                             setOutputText(item.outputText);
                             setTargetLanguage(item.targetLanguage);
                           }}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            {languages.find(l => l.code === item.targetLanguage)?.name || item.targetLanguage}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="text-muted-foreground">{item.inputText}</div>
                          <div className="font-medium">{item.outputText}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};