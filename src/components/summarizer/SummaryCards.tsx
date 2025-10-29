import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Lightbulb, Target, Loader2, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Note } from '../../types/chrome-ai';
import { formatMarkdown } from '../../utils/textFormatter';

interface SummaryCardsProps {
  selectedNote: Note | null;
  summary: string;
  insights: string;
  actions: string;
  isLoading: boolean;
  onGenerateNewSummary: (note: Note) => void;
  onStartQuiz: () => void;
  showQuizDialog: boolean;
  setShowQuizDialog: (show: boolean) => void;
  children?: React.ReactNode;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  selectedNote,
  summary,
  insights,
  actions,
  isLoading,
  onGenerateNewSummary,
  onStartQuiz,
  showQuizDialog,
  setShowQuizDialog,
  children
}) => {
  if (!summary && !insights && !actions) return null;

  return (
    <div className="flex-1 space-y-6">
      {selectedNote && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Summary for: {selectedNote.title || 'Untitled'}</h3>
          <Button
            onClick={() => onGenerateNewSummary(selectedNote)}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            New Summary
          </Button>
        </div>
      )}
      
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdown(summary) }} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb
                  size={20}
                  className="text-yellow-600 dark:text-yellow-400"
                />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdown(insights) }} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {actions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target
                    size={20}
                    className="text-green-600 dark:text-green-400"
                  />
                  Next Actions
                </div>
                <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={onStartQuiz}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Brain size={16} />
                      Test Your Understanding
                    </Button>
                  </DialogTrigger>
                  {children}
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdown(actions) }} />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};