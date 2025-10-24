import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Lightbulb, Target, Loader2 } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { getNotes } from '../utils/storage';
import { Note } from '../types/chrome-ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SummarizerPanel: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [summary, setSummary] = useState('');
  const [insights, setInsights] = useState('');
  const [actions, setActions] = useState('');
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
    setSummary('');
    setInsights('');
    setActions('');

    const noteSummary = await summarizeText(note.content);
    setSummary(noteSummary);

    const keyInsights = await generatePrompt(`3 bullet points only: ${note.content}`);
    setInsights(keyInsights);

    const nextActions = await generatePrompt(`3 action items only: ${note.content}`);
    setActions(nextActions);
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
            Summarize All Notes
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {notes.slice(0, 6).map(note => (
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
                  <div className="text-xs text-muted-foreground">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Summary Results */}
      {(summary || insights || actions) && (
        <div className="flex-1 space-y-6">
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
                  <p className="text-foreground leading-relaxed">{summary}</p>
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
                  <div className="text-foreground leading-relaxed">
                    {insights.split('\n').map((line, index) => {
                      let cleanLine = line
                        .replace(/^(Okay,.*?:|Here's.*?:|.*breakdown.*?:)/i, '')
                        .trim();

                      if (cleanLine.includes('**') && cleanLine.includes(':')) {
                        const headerText = cleanLine.replace(
                          /\*\*(.*?)\*\*:?/g,
                          '$1'
                        );
                        return (
                          <div
                            key={index}
                            className="font-semibold text-yellow-700 dark:text-yellow-300 mb-1 mt-3 first:mt-0"
                          >
                            {headerText}
                          </div>
                        );
                      }

                      if (cleanLine.startsWith('*') || cleanLine.startsWith('•')) {
                        return (
                          <div
                            key={index}
                            className="flex items-start gap-2 mb-2 ml-2"
                          >
                            <span className="text-yellow-700 dark:text-yellow-300 mt-1">
                              •
                            </span>
                            <span>
                              {cleanLine.replace(/^[*•]\s*/, '')}
                            </span>
                          </div>
                        );
                      }

                      return cleanLine ? (
                        <p key={index} className="mb-2">
                          {cleanLine}
                        </p>
                      ) : null;
                    })}
                  </div>
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
                  <CardTitle className="flex items-center gap-2">
                    <Target
                      size={20}
                      className="text-green-600 dark:text-green-400"
                    />
                    Next Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-foreground leading-relaxed">
                    {actions.split('\n').map((line, index) => {
                      let cleanLine = line
                        .replace(/^(Okay,.*?:|Here's.*?:|.*breakdown.*?:)/i, '')
                        .trim();

                      if (cleanLine.includes('**') && cleanLine.includes(':')) {
                        const headerText = cleanLine.replace(
                          /\*\*(.*?)\*\*:?/g,
                          '$1'
                        );
                        return (
                          <div
                            key={index}
                            className="font-semibold text-green-700 dark:text-green-300 mb-1 mt-3 first:mt-0"
                          >
                            {headerText}
                          </div>
                        );
                      }

                      if (cleanLine.startsWith('*') || cleanLine.startsWith('•')) {
                        return (
                          <div
                            key={index}
                            className="flex items-start gap-2 mb-2 ml-2"
                          >
                            <span className="text-green-600 dark:text-green-200 mt-1">
                              •
                            </span>
                            <span>
                              {cleanLine.replace(/^[*•]\s*/, '')}
                            </span>
                          </div>
                        );
                      }

                      return cleanLine ? (
                        <p key={index} className="mb-2">
                          {cleanLine}
                        </p>
                      ) : null;
                    })} 
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
