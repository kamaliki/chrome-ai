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
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'simple' | 'graphical'>('simple');
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
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
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

  const getTopics = () => {
    const topics: { [key: string]: Note[] } = {};
    notes.forEach(note => {
      const topic = note.topic || 'Uncategorized';
      if (!topics[topic]) topics[topic] = [];
      topics[topic].push(note);
    });
    return topics;
  };

  const getFilteredNotes = () => {
    if (!selectedTopic) return notes;
    return notes.filter(note => (note.topic || 'Uncategorized') === selectedTopic);
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

          {!selectedTopic ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select a Topic</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(getTopics()).map(([topic, topicNotes]) => (
                  <div
                    key={topic}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedTopic(topic)}
                  >
                    <h4 className="font-medium mb-2">{topic}</h4>
                    <p className="text-sm text-muted-foreground">
                      {topicNotes.length} note{topicNotes.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => { setSelectedTopic(null); setSelectedNote(null); }}
                  >
                    ← Back to Topics
                  </Button>
                  <h3 className="text-lg font-semibold">{selectedTopic}</h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'simple' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('simple')}
                  >
                    Simple View
                  </Button>
                  <Button
                    variant={viewMode === 'graphical' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('graphical')}
                  >
                    Graph View
                  </Button>
                </div>
              </div>

              {viewMode === 'graphical' ? (
                <TreeVisualization
                  notes={getFilteredNotes()}
                  selectedNote={selectedNote}
                  onNoteSelect={handleSummarize}
                />
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const tree: any = {};
                    getFilteredNotes().forEach(note => {
                      const tags = note.tags || [];
                      let current = tree;
                      tags.forEach(tag => {
                        if (!current[tag]) current[tag] = { notes: [], children: {} };
                        current = current[tag].children;
                      });
                      if (!current._notes) current._notes = [];
                      current._notes.push(note);
                    });
                    
                    const renderTree = (node: any, level = 0, parentPath = '') => {
                      return Object.entries(node).map(([key, value]: [string, any]) => {
                        if (key === '_notes') {
                          return value.map((note: Note) => (
                            <div
                              key={note.id}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedNote?.id === note.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                              }`}
                              style={{ marginLeft: `${level * 20}px` }}
                              onClick={() => handleSummarize(note)}
                            >
                              <h4 className="font-medium">{note.title || 'Untitled'}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(note.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          ));
                        }
                        const nodePath = `${parentPath}/${key}`;
                        const isExpanded = expandedNodes.has(nodePath);
                        return (
                          <div key={key}>
                            <div 
                              className="font-medium text-sm text-muted-foreground mb-2 cursor-pointer hover:text-foreground" 
                              style={{ marginLeft: `${level * 20}px` }}
                              onClick={() => {
                                const newExpanded = new Set(expandedNodes);
                                if (isExpanded) {
                                  newExpanded.delete(nodePath);
                                } else {
                                  newExpanded.add(nodePath);
                                }
                                setExpandedNodes(newExpanded);
                              }}
                            >
                              {isExpanded ? '📂' : '📁'} {key}
                            </div>
                            {isExpanded && (
                              <>
                                {renderTree(value.children, level + 1, nodePath)}
                                {value.notes && renderTree({ _notes: value.notes }, level + 1, nodePath)}
                              </>
                            )}
                          </div>
                        );
                      });
                    };
                    
                    return renderTree(tree);
                  })()
                  }
                </div>
              )}
            </div>
          )}
        </div>

        {selectedNote && (
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
        )}
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
