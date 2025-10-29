import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { getNotes, saveNote } from '../utils/storage';
import { Note } from '../types/chrome-ai';
import { Button } from '@/components/ui/button';
import { WelcomeScreen } from './WelcomeScreen';
import { TreeVisualization } from './summarizer/TreeVisualization';
import { SummaryCards } from './summarizer/SummaryCards';
import { QuizDialog } from './summarizer/QuizDialog';
import { QuizHistoryPanel } from './summarizer/QuizHistoryPanel';
import { ProgressChart } from './summarizer/ProgressChart';
import { QuizReviewDialog } from './summarizer/QuizReviewDialog';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const SummarizerPanel: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [summary, setSummary] = useState('');
  const [insights, setInsights] = useState('');
  const [actions, setActions] = useState('');
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: number }>({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [showQuizReview, setShowQuizReview] = useState(false);
  const [reviewQuizResult, setReviewQuizResult] = useState<any>(null);
  const [showMobileQuizPanel, setShowMobileQuizPanel] = useState(false);
  const [showProgressChart, setShowProgressChart] = useState(false);
  const { summarizeText, generatePrompt, isLoading } = useAI();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const savedNotes = await getNotes();
    setNotes(
      savedNotes.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    );
  };

  const handleSummarize = useCallback(async (note: Note) => {
    setSelectedNote(note);
    
    // Check if note already has summaries
    if (note.summaries && note.summaries.length > 0) {
      const latestSummary = note.summaries[0];
      setSummary(latestSummary.summary);
      setInsights(latestSummary.insights);
      setActions(latestSummary.actions);
      return;
    }
    
    // Generate new summary
    await generateNewSummary(note);
  }, []);

  const generateNewSummary = useCallback(async (note: Note) => {
    setSummary('');
    setInsights('');
    setActions('');

    const noteSummary = await summarizeText(note.content);
    setSummary(noteSummary);

    const keyInsights = await generatePrompt(`summarize key points only: ${note.content}`);
    setInsights(keyInsights);

    const nextActions = await generatePrompt(`summarize action items only: ${note.content}`);
    setActions(nextActions);
    
    // Save summary to note
    const summaryData = {
      id: Date.now().toString(),
      summary: noteSummary,
      insights: keyInsights,
      actions: nextActions,
      timestamp: new Date()
    };
    
    const updatedNote = {
      ...note,
      summaries: [summaryData, ...(note.summaries || [])].slice(0, 5) // Keep last 5 summaries
    };
    
    await saveNote(updatedNote);
    setSelectedNote(updatedNote);
    loadNotes();
  }, [summarizeText, generatePrompt, loadNotes]);

  const startQuiz = async () => {
    if (!selectedNote || !actions) return;
    
    const questionsPrompt = `Based on these action items: "${actions}", create exactly 5 multiple choice questions to test understanding. Format as JSON array with objects containing: question, options (array of 4 choices), correctAnswer (0-3 index). Focus on comprehension and application.`;
    
    try {
      const questionsResponse = await generatePrompt(questionsPrompt);
      // Extract JSON from response
      const jsonMatch = questionsResponse.match(/\[.*\]/s);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]).map((q: any, index: number) => ({
          id: `q${index}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer
        }));
        setQuizQuestions(questions);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setQuizComplete(false);
        setShowQuizDialog(true);
      }
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    }
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    const answers = quizQuestions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      userAnswer: userAnswers[q.id] || -1,
      isCorrect: userAnswers[q.id] === q.correctAnswer
    }));
    
    const score = answers.filter(a => a.isCorrect).length;
    
    const quizResult = {
      id: Date.now().toString(),
      score,
      totalQuestions: quizQuestions.length,
      timestamp: new Date(),
      questions: answers
    };
    
    // Save to note
    const updatedNote = {
      ...selectedNote!,
      quizResults: [quizResult, ...(selectedNote!.quizResults || [])].slice(0, 10)
    };
    
    await saveNote(updatedNote);
    setSelectedNote(updatedNote);
    loadNotes();
    
    setQuizComplete(true);
  };

  const resetQuiz = () => {
    setShowQuizDialog(false);
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizComplete(false);
  };

  const summarizeAllNotes = async () => {
    if (notes.length === 0) return;

    const allContent = notes.map(note => note.content).join('\n\n');
    const dailySummary = await summarizeText(allContent);
    setSummary(dailySummary);

    const dailyInsights = await generatePrompt(`3 bullet points only: ${allContent}`);
    setInsights(dailyInsights);

    const dailyActions = await generatePrompt(`3 action items only: ${allContent}`);
    setActions(dailyActions);
  };



  if (notes.length === 0) {
    return <WelcomeScreen />;
  }

  return (
    <div className="h-full flex bg-background">
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            AI Summarizer
          </h2>

          <div className="flex gap-2 mb-4">
            <Button
              onClick={summarizeAllNotes}
              disabled={isLoading || notes.length === 0}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileText size={16} />
              )}
              Summarize Selected Note
            </Button>
          </div>

          <TreeVisualization
            notes={notes}
            selectedNote={selectedNote}
            onNoteSelect={handleSummarize}
          />
        </div>

        <SummaryCards
          selectedNote={selectedNote}
          summary={summary}
          insights={insights}
          actions={actions}
          isLoading={isLoading}
          onGenerateNewSummary={generateNewSummary}
          onStartQuiz={startQuiz}
          showQuizDialog={showQuizDialog}
          setShowQuizDialog={setShowQuizDialog}
        >
          <QuizDialog
            quizComplete={quizComplete}
            quizQuestions={quizQuestions}
            currentQuestionIndex={currentQuestionIndex}
            userAnswers={userAnswers}
            onAnswerSelect={handleAnswerSelect}
            onNextQuestion={nextQuestion}
            onPreviousQuestion={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            onResetQuiz={resetQuiz}
            onStartQuiz={startQuiz}
          />
        </SummaryCards>
      </div>
      <QuizHistoryPanel
        selectedNote={selectedNote}
        onShowProgressChart={() => setShowProgressChart(true)}
        onReviewQuiz={(result) => { setReviewQuizResult(result); setShowQuizReview(true); }}
        showMobilePanel={showMobileQuizPanel}
        onToggleMobilePanel={() => setShowMobileQuizPanel(!showMobileQuizPanel)}
      />
      
      <QuizReviewDialog
        showQuizReview={showQuizReview}
        onClose={() => setShowQuizReview(false)}
        reviewQuizResult={reviewQuizResult}
      />
      
      <ProgressChart
        selectedNote={selectedNote}
        showProgressChart={showProgressChart}
        onClose={() => setShowProgressChart(false)}
      />
    </div>
  );
};
