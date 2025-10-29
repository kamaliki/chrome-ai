import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface QuizReviewDialogProps {
  showQuizReview: boolean;
  onClose: () => void;
  reviewQuizResult: any;
}

export const QuizReviewDialog: React.FC<QuizReviewDialogProps> = ({
  showQuizReview,
  onClose,
  reviewQuizResult
}) => {
  return (
    <Dialog open={showQuizReview} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quiz Review</DialogTitle>
        </DialogHeader>
        
        {reviewQuizResult && (
          <div className="space-y-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">
                {reviewQuizResult.score}/{reviewQuizResult.totalQuestions}
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(reviewQuizResult.timestamp).toLocaleDateString()} at {new Date(reviewQuizResult.timestamp).toLocaleTimeString()}
              </div>
            </div>
            
            <div className="space-y-4">
              {reviewQuizResult.questions.map((question: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-3">
                    {question.isCorrect ? 
                      <CheckCircle size={20} className="text-green-500 mt-1" /> : 
                      <XCircle size={20} className="text-red-500 mt-1" />
                    }
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">Question {index + 1}</h4>
                      <p className="mb-3">{question.question}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 ml-7">
                    {question.options.map((option: string, optionIndex: number) => (
                      <div key={optionIndex} className={`p-2 rounded ${
                        optionIndex === question.correctAnswer ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600' :
                        optionIndex === question.userAnswer && !question.isCorrect ? 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600' :
                        'bg-muted/30'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${
                            optionIndex === question.correctAnswer ? 'text-green-800 dark:text-green-200' :
                            optionIndex === question.userAnswer && !question.isCorrect ? 'text-red-800 dark:text-red-200' :
                            'text-foreground'
                          }`}>{String.fromCharCode(65 + optionIndex)}.</span>
                          <span className={`text-sm ${
                            optionIndex === question.correctAnswer ? 'text-green-800 dark:text-green-200' :
                            optionIndex === question.userAnswer && !question.isCorrect ? 'text-red-800 dark:text-red-200' :
                            'text-foreground'
                          }`}>{option}</span>
                          {optionIndex === question.correctAnswer && (
                            <span className="text-xs text-green-700 dark:text-green-300 ml-auto font-medium">Correct</span>
                          )}
                          {optionIndex === question.userAnswer && !question.isCorrect && (
                            <span className="text-xs text-red-700 dark:text-red-300 ml-auto font-medium">Your Answer</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};