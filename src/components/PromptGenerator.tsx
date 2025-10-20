import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Heart, Target, Lightbulb } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    <div className="h-full p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Daily Prompt Generator
          </h2>
          <p className="text-muted-foreground">
            AI-powered prompts to inspire your day
          </p>
        </div>

        {/* Prompt Type Selector */}
        <div className="flex justify-center gap-2 mb-8">
          {promptTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                variant={selectedType === type.id ? 'default' : 'outline'}
                className="gap-2"
              >
                <Icon size={16} />
                {type.label}
              </Button>
            );
          })}
        </div>

        {/* Current Prompt */}
        <motion.div
          key={currentPrompt}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Sparkles className="text-primary" size={24} />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Today's {promptTypes.find(t => t.id === selectedType)?.label}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-foreground leading-relaxed">
                {currentPrompt || 'Generating your personalized prompt...'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={generateDailyPrompt}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            Generate New
          </Button>
          
          <Button
            onClick={savePrompt}
            disabled={!currentPrompt}
            variant="secondary"
            className="gap-2"
          >
            <Heart size={20} />
            Save Prompt
          </Button>
        </div>

        {/* Saved Prompts */}
        {dailyPrompts.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              Saved Prompts
            </h3>
            <div className="space-y-3">
              {dailyPrompts.map((prompt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-foreground">{prompt}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};