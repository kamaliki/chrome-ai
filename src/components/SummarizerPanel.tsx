import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Lightbulb, Target, Loader2, Brain, CheckCircle, XCircle, TrendingUp, BarChart3 } from 'lucide-react';
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

interface TreeNodeProps {
  name: string;
  data: { notes: Note[]; children: any };
  level: number;
  selectedNote: Note | null;
  onNoteSelect: (note: Note) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ name, data, level, selectedNote, onNoteSelect }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const hasChildren = Object.keys(data.children).length > 0;
  const hasNotes = data.notes.length > 0;
  const totalNotes = data.notes.length + Object.values(data.children).reduce((sum: number, child: any) => {
    return sum + child.notes.length + Object.values(child.children).reduce((childSum: number, grandChild: any) => childSum + grandChild.notes.length, 0);
  }, 0);
  
  const getIndentColor = (level: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
    return colors[level % colors.length];
  };
  
  return (
    <div className="space-y-2">
      {/* Node Header */}
      <div 
        className={`flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors`}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ marginLeft: `${level * 20}px` }}
      >
        <div className="flex items-center gap-2">
          {/* Tree connector */}
          <div className={`w-3 h-3 rounded-full ${getIndentColor(level)}`}></div>
          
          {/* Expand/collapse icon */}
          {(hasChildren || hasNotes) && (
            <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
              ▶
            </div>
          )}
          
          {/* Node name */}
          <span className={`font-medium ${level === 0 ? 'text-lg' : level === 1 ? 'text-base' : 'text-sm'}`}>
            {name}
          </span>
          
          {/* Note count */}
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            {totalNotes} note{totalNotes !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Direct notes at this level */}
            {hasNotes && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4" style={{ marginLeft: `${(level + 1) * 20}px` }}>
                {data.notes.map(note => (
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
                      onClick={() => onNoteSelect(note)}
                    >
                      <CardContent className="p-3">
                        <div className="text-sm font-medium truncate mb-1">
                          {note.title || 'Untitled'}
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
            )}
            
            {/* Child nodes */}
            {hasChildren && (
              <div className="space-y-2">
                {Object.entries(data.children)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([childName, childData]) => (
                    <TreeNode
                      key={childName}
                      name={childName}
                      data={childData as any}
                      level={level + 1}
                      selectedNote={selectedNote}
                      onNoteSelect={onNoteSelect}
                    />
                  ))
                }
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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

  // Create tree structure: topic -> tag1 -> tag2 -> ... -> note
  const createTreeStructure = (notes: Note[]) => {
    const tree: any = {};
    
    notes.forEach(note => {
      const topic = note.topic || 'Uncategorized';
      const tags = note.tags || [];
      
      // Initialize topic if not exists
      if (!tree[topic]) {
        tree[topic] = { notes: [], children: {} };
      }
      
      // If no tags, add directly to topic
      if (tags.length === 0) {
        tree[topic].notes.push(note);
        return;
      }
      
      // Navigate through tag hierarchy
      let current = tree[topic];
      tags.forEach((tag, index) => {
        if (!current.children[tag]) {
          current.children[tag] = { notes: [], children: {} };
        }
        current = current.children[tag];
        
        // Add note to the last tag level
        if (index === tags.length - 1) {
          current.notes.push(note);
        }
      });
    });
    
    return tree;
  };
  
  const treeStructure = createTreeStructure(notes);
  const topics = Object.keys(treeStructure).sort();

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

        {/* Tree View Structure */}
        <div className="space-y-6">
          {topics.map(topic => (
            <TreeNode 
              key={topic}
              name={topic}
              data={treeStructure[topic]}
              level={0}
              selectedNote={selectedNote}
              onNoteSelect={handleSummarize}
            />
          ))}
        </div>
      </div>

      {/* Summary Results */}
      {(summary || insights || actions) && (
        <div className="flex-1 space-y-6">
          {selectedNote && (
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Summary for: {selectedNote.title || 'Untitled'}</h3>
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
      

      </div>
      
      {/* Quiz History Panel - Desktop */}
      {selectedNote?.quizResults && selectedNote.quizResults.length > 0 && (
        <div className="hidden md:flex w-80 border-l bg-muted/30 flex-col">
          <div className="p-4 border-b bg-muted/20 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Brain className="text-purple-500" size={20} />
                Quiz History
              </h3>
              <Button
                onClick={() => setShowProgressChart(true)}
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
                  <div key={result.id} className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50" onClick={() => { setReviewQuizResult(result); setShowQuizReview(true); }}>
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
          </div>
        </div>
      )}
      
      {/* Mobile Quiz History Floating Button */}
      {selectedNote?.quizResults && selectedNote.quizResults.length > 0 && (
        <div className="md:hidden fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setShowMobileQuizPanel(!showMobileQuizPanel)}
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg"
          >
            <Brain size={24} />
          </Button>
          
          <AnimatePresence>
            {showMobileQuizPanel && (
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
                        <div key={result.id} className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50" onClick={() => { setReviewQuizResult(result); setShowQuizReview(true); setShowMobileQuizPanel(false); }}>
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
      )}
      
      {/* Quiz Review Dialog */}
      <Dialog open={showQuizReview} onOpenChange={setShowQuizReview}>
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
      
      {/* Progress Chart Dialog */}
      <Dialog open={showProgressChart} onOpenChange={setShowProgressChart}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Quiz Progress Chart</DialogTitle>
          </DialogHeader>
          
          {selectedNote?.quizResults && selectedNote.quizResults.length > 0 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 size={20} className="text-blue-500" />
                    Quiz Performance Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <div className="grid grid-cols-1 gap-4">
                      {selectedNote.quizResults.slice().reverse().map((result, index) => {
                        const percentage = Math.round((result.score / result.totalQuestions) * 100);
                        return (
                          <div key={result.id} className="flex items-center gap-4">
                            <div className="text-sm text-muted-foreground w-20">
                              Quiz {index + 1}
                            </div>
                            <div className="flex-1 bg-muted rounded-full h-4 relative">
                              <div 
                                className={`h-4 rounded-full transition-all ${
                                  percentage >= 80 ? 'bg-green-500' :
                                  percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                                {percentage}%
                              </span>
                            </div>
                            <div className="text-sm font-medium w-16">
                              {result.score}/{result.totalQuestions}
                            </div>
                            <div className="text-xs text-muted-foreground w-24">
                              {new Date(result.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
                <div className="px-6 pb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-medium">
                      Average Score: {Math.round(
                        selectedNote.quizResults.reduce((sum, result) => 
                          sum + (result.score / result.totalQuestions), 0
                        ) / selectedNote.quizResults.length * 100
                      )}%
                    </span>
                  </div>
                  <div className="text-muted-foreground text-sm mt-1">
                    Showing performance for {selectedNote.quizResults.length} quiz attempts
                  </div>
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Mobile Quiz Panel Overlay */}
      {showMobileQuizPanel && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowMobileQuizPanel(false)}
        />
      )}
    </div>
  );
};
