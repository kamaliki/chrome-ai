import React from 'react';
import { motion } from 'framer-motion';
import { Brain, FileText, Languages, Camera, Target, Lightbulb, CheckCircle, Sparkles, ArrowRight, Play, Lock, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OnboardingWelcomeProps {
  onGetStarted: () => void;
}

export const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: <FileText className="text-blue-500" size={24} />,
      title: "Smart Note Editor",
      description: "Write with AI-powered rewriting, cleaning, and markdown formatting",
      gradient: "from-blue-500/10 to-blue-600/10"
    },
    {
      icon: <Eye className="text-cyan-500" size={24} />,
      title: "Language Detection",
      description: "Auto-detect text language with confidence levels using Chrome AI",
      gradient: "from-cyan-500/10 to-cyan-600/10"
    },
    {
      icon: <Camera className="text-green-500" size={24} />,
      title: "OCR Text Extraction",
      description: "Extract and clean text from images with AI formatting",
      gradient: "from-green-500/10 to-green-600/10"
    },
    {
      icon: <Brain className="text-purple-500" size={24} />,
      title: "AI Summarization",
      description: "Generate summaries, insights, and action items with markdown support",
      gradient: "from-purple-500/10 to-purple-600/10"
    },
    {
      icon: <CheckCircle className="text-orange-500" size={24} />,
      title: "Understanding Quizzes",
      description: "Test comprehension with AI-generated questions and progress tracking",
      gradient: "from-orange-500/10 to-orange-600/10"
    },
    {
      icon: <Languages className="text-pink-500" size={24} />,
      title: "Smart Translation",
      description: "Translate with auto-detection and confidence indicators",
      gradient: "from-pink-500/10 to-pink-600/10"
    },
    {
      icon: <Lock className="text-indigo-500" size={24} />,
      title: "Secure Authentication",
      description: "Local username/password protection with encrypted storage",
      gradient: "from-indigo-500/10 to-indigo-600/10"
    },
    {
      icon: <Download className="text-emerald-500" size={24} />,
      title: "Export & Import",
      description: "Backup and sync your notes across devices with JSON export",
      gradient: "from-emerald-500/10 to-emerald-600/10"
    },
    {
      icon: <Target className="text-red-500" size={24} />,
      title: "Privacy-First",
      description: "All AI processing and data storage happens locally in your browser",
      gradient: "from-red-500/10 to-red-600/10"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background via-background to-muted/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 max-w-4xl"
      >
        <div className="flex items-center justify-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="relative"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <Brain size={48} className="text-primary" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles size={24} className="text-yellow-500" />
            </motion.div>
          </motion.div>
        </div>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-bold text-foreground mb-6"
        >
          Welcome to <span className="text-primary">CBC Tutor</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-muted-foreground mb-8 leading-relaxed"
        >
          Your privacy-first AI learning companion. Take notes, extract insights, and test your understanding—all powered by Chrome's built-in AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-4 text-sm text-muted-foreground bg-muted/50 rounded-full px-6 py-3 mb-12"
        >
          <CheckCircle size={18} className="text-green-500" />
          <span className="font-medium">100% Offline</span>
          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
          <span className="font-medium">No Data Collection</span>
          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
          <span className="font-medium">Chrome AI Powered</span>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full mb-12"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
          >
            <Card className={`h-full hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${feature.gradient} border-0 hover:scale-105`}>
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="text-center"
      >
        <Button
          onClick={onGetStarted}
          size="lg"
          className="gap-3 text-lg px-8 py-6 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Play size={20} />
          Get Started
          <ArrowRight size={20} />
        </Button>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-muted-foreground mt-4 text-sm"
        >
          Create secure local account • Export/import your data
        </motion.p>
      </motion.div>
    </div>
  );
};