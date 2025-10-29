import React from 'react';
import { motion } from 'framer-motion';
import { PenTool, Image, Sparkles, Languages, FileText, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const EditorWelcome: React.FC = () => {
  const features = [
    {
      icon: <PenTool className="text-blue-500" size={20} />,
      title: "Smart Writing",
      description: "AI-powered text editing and rewriting"
    },
    {
      icon: <Image className="text-green-500" size={20} />,
      title: "OCR Extraction",
      description: "Upload images to extract and clean text"
    },
    {
      icon: <Languages className="text-purple-500" size={20} />,
      title: "Translation",
      description: "Translate between multiple languages"
    },
    {
      icon: <Sparkles className="text-orange-500" size={20} />,
      title: "Text Enhancement",
      description: "Improve clarity and fix formatting"
    },
    {
      icon: <Lightbulb className="text-yellow-500" size={20} />,
      title: "AI Quizzes",
      description: "Test understanding with AI-generated questions"
    },
    {
      icon: <FileText className="text-indigo-500" size={20} />,
      title: "Tree Organization",
      description: "Visualize notes in hierarchical structure"
    }
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <PenTool size={40} className="text-primary" />
          </div>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-foreground mb-4"
        >
          Start Your First Note
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-muted-foreground mb-8"
        >
          Click "New Note" to begin writing, or upload an image to extract text with AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <Card className="h-full hover:shadow-md transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <div className="mb-3">{feature.icon}</div>
                  <h3 className="font-semibold text-sm mb-2">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="flex items-center justify-center gap-4 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Lightbulb size={16} className="text-yellow-500" />
            <span>Click ? for organization tips</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-blue-500" />
            <span>Select text for AI options</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};