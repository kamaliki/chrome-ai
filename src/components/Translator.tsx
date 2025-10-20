import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Languages, ArrowRight, Copy, Check } from 'lucide-react';
import { useAI } from '../hooks/useAI';

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
    <div className="h-full p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            AI Translator
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Translate text instantly with Chrome's built-in AI
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Auto-detect
            </span>
          </div>
          
          <ArrowRight className="text-gray-400" size={20} />
          
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Languages className="text-blue-500" size={20} />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Original Text
              </h3>
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter text to translate..."
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {inputText.length} characters
              </span>
              
              <button
                onClick={handleTranslate}
                disabled={isLoading || !inputText.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                <Languages size={16} />
                {isLoading ? 'Translating...' : 'Translate'}
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Languages className="text-green-500" size={20} />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Translation
                </h3>
              </div>
              
              {outputText && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
            
            <div className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 overflow-y-auto">
              {outputText ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="leading-relaxed"
                >
                  {outputText}
                </motion.p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  Translation will appear here...
                </p>
              )}
            </div>
            
            {outputText && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Translated to {languages.find(l => l.code === targetLanguage)?.name}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Tip: Press Ctrl+Enter to translate quickly
          </p>
          
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setInputText('')}
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Clear Input
            </button>
            
            <button
              onClick={() => {
                setInputText(outputText);
                setOutputText('');
              }}
              disabled={!outputText}
              className="px-4 py-2 text-sm bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-300 dark:hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Swap Languages
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};