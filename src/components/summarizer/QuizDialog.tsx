import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizDialogProps {
  quizComplete: boolean;
  quizQuestions: QuizQuestion[];
  currentQuestionIndex: number;
  userAnswers: { [key: string]: number };
  onAnswerSelect: (questionId: string, answerIndex: number) => void;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
  onResetQuiz: () => void;
  onStartQuiz: () => void;
}

export const QuizDialog: React.FC<QuizDialogProps> = ({
  quizComplete,
  quizQuestions,
  currentQuestionIndex,
  userAnswers,
  onAnswerSelect,
  onNextQuestion,
  onPreviousQuestion,
  onResetQuiz,
  onStartQuiz
}) => {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Understanding Quiz</DialogTitle>
      </DialogHeader>
      
      {!quizComplete ? (
        quizQuestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
              <span>{Object.keys(userAnswers).length} answered</span>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                {quizQuestions[currentQuestionIndex].question}
              </h3>
              
              <RadioGroup
                value={userAnswers[quizQuestions[currentQuestionIndex].id]?.toString()}
                onValueChange={(value) => onAnswerSelect(quizQuestions[currentQuestionIndex].id, parseInt(value))}
              >
                {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={onPreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button
                onClick={onNextQuestion}
                disabled={userAnswers[quizQuestions[currentQuestionIndex].id] === undefined}
              >
                {currentQuestionIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next'}
              </Button>
            </div>
          </div>
        )
      ) : (
        <div className="text-center space-y-4">
          <div className="text-4xl">
            {Object.values(userAnswers).filter((answer, index) => answer === quizQuestions[index]?.correctAnswer).length / quizQuestions.length >= 0.8 ? '🎉' : 
             Object.values(userAnswers).filter((answer, index) => answer === quizQuestions[index]?.correctAnswer).length / quizQuestions.length >= 0.6 ? '👍' : '📚'}
          </div>
          <h3 className="text-xl font-bold">
            Quiz Complete!
          </h3>
          <p className="text-lg">
            You scored {Object.values(userAnswers).filter((answer, index) => answer === quizQuestions[index]?.correctAnswer).length} out of {quizQuestions.length}
          </p>
          {Object.values(userAnswers).filter((answer, index) => answer === quizQuestions[index]?.correctAnswer).length / quizQuestions.length < 0.6 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <p className="text-orange-800 dark:text-orange-200 text-sm">
                Consider reviewing the material and retaking the quiz to improve your understanding.
              </p>
            </div>
          )}
          <div className="space-y-2">
            {quizQuestions.map((q, index) => {
              const userAnswer = userAnswers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <div key={q.id} className="flex items-center gap-2 text-sm">
                  {isCorrect ? 
                    <CheckCircle size={16} className="text-green-500" /> : 
                    <XCircle size={16} className="text-red-500" />
                  }
                  <span>Question {index + 1}: {isCorrect ? 'Correct' : 'Incorrect'}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            {Object.values(userAnswers).filter((answer, index) => answer === quizQuestions[index]?.correctAnswer).length / quizQuestions.length < 0.6 && (
              <Button onClick={() => { onResetQuiz(); onStartQuiz(); }} variant="outline">
                Retake Quiz
              </Button>
            )}
            <Button onClick={onResetQuiz}>Close</Button>
          </div>
        </div>
      )}
    </DialogContent>
  );
};