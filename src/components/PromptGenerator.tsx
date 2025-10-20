import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Heart, Target, Lightbulb } from 'lucide-react';
import { useAI } from '../hooks/useAI';

const promptTypes = [
  { id: 'focus', label: 'Focus Question', icon: Target, color: 'blue' },
  { id: 'motivation', label: 'Motivation', icon: Heart, color: 'red' },
  { id: 'reflection', label: 'Reflection', icon: Lightbulb, color: 'yellow' },
];

export const PromptGenerator: React.FC = () => {
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [selectedType, setSelectedType] = useState('focus');
  const [dailyPrompts, setDailyPrompts] = useState<string[]>([]);
  const { generatePrompt, isLoading } = useAI();

  useEffect(() => {
    generateDailyPrompt();
  }, [selectedType]);

  const generateDailyPrompt = async () => {
    const contexts = {
      focus: 'Generate a thought-provoking question to help someone focus on their most important task today',
      motivation: 'Create an inspiring and motivational message to energize someone for their day',
      reflection: 'Suggest a reflective question to help someone learn from their recent experiences'
    };

    const prompt = await generatePrompt(contexts[selectedType as keyof typeof contexts]);
    setCurrentPrompt(prompt);
  };

  const savePrompt = () => {
    if (currentPrompt && !dailyPrompts.includes(currentPrompt)) {
      setDailyPrompts(prev => [currentPrompt, ...prev.slice(0, 4)]);
    }
  };

  return (
    <div className="h-full p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Daily Prompt Generator
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered prompts to inspire your day
          </p>
        </div>

        {/* Prompt Type Selector */}
        <div className="flex justify-center gap-2 mb-8">
          {promptTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  selectedType === type.id
                    ? `bg-${type.color}-500 text-white`
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={16} />
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Current Prompt */}
        <motion.div
          key={currentPrompt}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Sparkles className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Today's {promptTypes.find(t => t.id === selectedType)?.label}
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {currentPrompt || 'Generating your personalized prompt...'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={generateDailyPrompt}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            Generate New
          </button>
          
          <button
            onClick={savePrompt}
            disabled={!currentPrompt}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            <Heart size={20} />
            Save Prompt
          </button>
        </div>

        {/* Saved Prompts */}
        {dailyPrompts.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Saved Prompts
            </h3>
            <div className="space-y-3">
              {dailyPrompts.map((prompt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
                >
                  <p className="text-gray-700 dark:text-gray-300">{prompt}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};