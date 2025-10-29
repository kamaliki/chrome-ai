import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Note } from '../../types/chrome-ai';

interface QuizHistoryPanelProps {
  selectedNote: Note | null;
  onShowProgressChart: () => void;
  onReviewQuiz: (result: any) => void;
  showMobilePanel: boolean;
  onToggleMobilePanel: () => void;
}

export const QuizHistoryPanel: React.FC<QuizHistoryPanelProps> = ({
  selectedNote,
  onShowProgressChart,
  onReviewQuiz,
  showMobilePanel,
  onToggleMobilePanel
}) => {
  if (!selectedNote?.quizResults || selectedNote.quizResults.length === 0) {
    return null;
  }

  return (
    <>
      {/* Desktop Panel */}
      <div className="hidden md:flex w-80 border-l bg-muted/30 flex-col">
        <div className="p-4 border-b bg-muted/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Brain className="text-purple-500" size={20} />
              Quiz History
            </h3>
            <Button
              onClick={onShowProgressChart}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <BarChart3 size={16} />
              Progress
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {selectedNote.quizResults.map((result) => {
              const percentage = Math.round((result.score / result.totalQuestions) * 100);
              return (
                <div key={result.id} className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50" onClick={() => onReviewQuiz(result)}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(result.timestamp).toLocaleDateString()} at {new Date(result.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {result.score}/{result.totalQuestions}
                      </div>
                      <div className={`text-sm ${
                        percentage >= 80 ? 'text-green-600' :
                        percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {percentage}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {result.questions.map((question: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {question.isCorrect ? 
                          <CheckCircle size={14} className="text-green-500" /> : 
                          <XCircle size={14} className="text-red-500" />
                        }
                        <span className="text-muted-foreground">
                          Question {index + 1}: {question.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Mobile Floating Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggleMobilePanel}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
        >
          <Brain size={24} />
        </Button>
        
        <AnimatePresence>
          {showMobilePanel && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="absolute bottom-16 right-0 bg-card border rounded-lg shadow-lg max-h-80 w-72 overflow-hidden"
            >
              <div className="p-3 border-b bg-muted/20">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Brain className="text-purple-500" size={16} />
                  Quiz History
                </h3>
              </div>
              <div className="max-h-60 overflow-y-auto p-3">
                <div className="space-y-3">
                  {selectedNote.quizResults.map((result) => {
                    const percentage = Math.round((result.score / result.totalQuestions) * 100);
                    return (
                      <div key={result.id} className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50" onClick={() => { onReviewQuiz(result); onToggleMobilePanel(); }}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(result.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold">
                              {result.score}/{result.totalQuestions}
                            </div>
                            <div className={`text-xs ${
                              percentage >= 80 ? 'text-green-600' :
                              percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {percentage}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Mobile Overlay */}
      {showMobilePanel && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggleMobilePanel}
        />
      )}
    </>
  );
};