import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Languages, ArrowRight, Copy, Check } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  //add swahili
  { code: 'sw-KE', name: 'Swahili' }
];

export const Translator: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [copied, setCopied] = useState(false);
  const { translateText, isLoading } = useAI();

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    const translated = await translateText(inputText, targetLanguage);
    setOutputText(translated);
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
              Auto-detect
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
          </div>
        </div>
      </motion.div>
    </div>
  );
};