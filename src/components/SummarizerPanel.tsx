import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Lightbulb, Target, Loader2, Brain, CheckCircle, XCircle } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { getNotes, saveNote } from '../utils/storage';
import { Note } from '../types/chrome-ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { WelcomeScreen } from './WelcomeScreen';
import { formatMarkdown } from '../utils/textFormatter';

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

  const handleSummarize = async (note: Note) => {
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
  };

  const generateNewSummary = async (note: Note) => {
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
  };

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

  // Group notes by topic
  const notesByTopic = notes.reduce((acc, note) => {
    const topic = note.topic || 'Uncategorized';
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  const topics = Object.keys(notesByTopic).sort();

  return (
    <div className="h-full flex flex-col p-6 bg-background overflow-y-auto">
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

        {/* Topics and Notes */}
        <div className="space-y-6">
          {topics.map(topic => (
            <div key={topic}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                {topic}
                <span className="text-sm text-muted-foreground">({notesByTopic[topic].length} notes)</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {notesByTopic[topic].map(note => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all ${
                        selectedNote?.id === note.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleSummarize(note)}
                    >
                      <CardContent className="p-3">
                        <div className="text-sm font-medium truncate mb-1">
                          {note.content.split('\n')[0] || 'Untitled'}
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-xs text-muted-foreground">
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </div>
                          {note.summaries && note.summaries.length > 0 && (
                            <div className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                              {note.summaries.length} summar{note.summaries.length > 1 ? 'ies' : 'y'}
                            </div>
                          )}
                        </div>
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {note.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                            {note.tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{note.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Results */}
      {(summary || insights || actions) && (
        <div className="flex-1 space-y-6">
          {selectedNote && (
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Summary for: {selectedNote.content.split('\n')[0] || 'Untitled'}</h3>
              <Button
                onClick={() => generateNewSummary(selectedNote)}
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
                          onClick={startQuiz}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Brain size={16} />
                          Test Your Understanding
                        </Button>
                      </DialogTrigger>
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
                                  onValueChange={(value) => handleAnswerSelect(quizQuestions[currentQuestionIndex].id, parseInt(value))}
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
                                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                                  disabled={currentQuestionIndex === 0}
                                >
                                  Previous
                                </Button>
                                <Button
                                  onClick={nextQuestion}
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
                                <Button onClick={() => { resetQuiz(); startQuiz(); }} variant="outline">
                                  Retake Quiz
                                </Button>
                              )}
                              <Button onClick={resetQuiz}>Close</Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
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
      )}
      
      {/* Quiz History for Selected Note */}
      {selectedNote?.quizResults && selectedNote.quizResults.length > 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="text-purple-500" size={20} />
                Quiz History for This Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {selectedNote.quizResults.map((result) => {
                  const percentage = Math.round((result.score / result.totalQuestions) * 100);
                  return (
                    <div key={result.id} className="border rounded-lg p-4">
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
                        {result.questions.map((question, index) => (
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
