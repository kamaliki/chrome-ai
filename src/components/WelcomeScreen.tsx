import React from 'react';
import { motion } from 'framer-motion';
import { Brain, FileText, Languages, Camera, Target, Lightbulb, CheckCircle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const WelcomeScreen: React.FC = () => {
  const features = [
    {
      icon: <FileText className="text-blue-500" size={24} />,
      title: "Smart Note Editor",
      description: "Write and organize your thoughts with AI-powered assistance",
      gradient: "from-blue-500/10 to-blue-600/10"
    },
    {
      icon: <Camera className="text-green-500" size={24} />,
      title: "OCR Text Extraction",
      description: "Extract text from images and clean it with AI",
      gradient: "from-green-500/10 to-green-600/10"
    },
    {
      icon: <Brain className="text-purple-500" size={24} />,
      title: "AI Summarization",
      description: "Generate summaries, insights, and action items from your notes",
      gradient: "from-purple-500/10 to-purple-600/10"
    },
    {
      icon: <CheckCircle className="text-orange-500" size={24} />,
      title: "Understanding Quizzes",
      description: "Test your comprehension with AI-generated questions",
      gradient: "from-orange-500/10 to-orange-600/10"
    },
    {
      icon: <Languages className="text-pink-500" size={24} />,
      title: "Multi-language Support",
      description: "Translate content between 10+ languages instantly",
      gradient: "from-pink-500/10 to-pink-600/10"
    },
    {
      icon: <Target className="text-red-500" size={24} />,
      title: "Privacy-First",
      description: "All AI processing happens locally in your browser",
      gradient: "from-red-500/10 to-red-600/10"
    }
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background via-background to-muted/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 max-w-2xl"
      >
        <div className="flex items-center justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="relative"
          >
            <Brain size={64} className="text-primary" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles size={20} className="text-yellow-500" />
            </motion.div>
          </motion.div>
        </div>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-foreground mb-4"
        >
          Welcome to <span className="text-primary">FocusFlow</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-muted-foreground mb-8"
        >
          Your privacy-first AI learning companion. Take notes, extract insights, and test your understanding—all powered by Chrome's built-in AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-full px-4 py-2"
        >
          <CheckCircle size={16} className="text-green-500" />
          <span>100% Offline • No Data Collection • Chrome AI Powered</span>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
          >
            <Card className={`h-full hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${feature.gradient} border-0`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  {feature.icon}
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-12 text-center"
      >
        <p className="text-muted-foreground mb-4">Ready to get started?</p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Create your first note in the Editor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Or upload an image to extract text</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};