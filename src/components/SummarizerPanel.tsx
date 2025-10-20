import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Lightbulb, Target, Loader2 } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { getNotes } from '../utils/storage';
import { Note } from '../types/chrome-ai';

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
    setNotes(savedNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
  };

  const handleSummarize = async (note: Note) => {
    setSelectedNote(note);
    setSummary('');
    setInsights('');
    setActions('');

    const noteSummary = await summarizeText(note.content);
    setSummary(noteSummary);

    const keyInsights = await generatePrompt(`Extract key insights from: ${note.content}`);
    setInsights(keyInsights);

    const nextActions = await generatePrompt(`Suggest next actions based on: ${note.content}`);
    setActions(nextActions);
  };

  const summarizeAllNotes = async () => {
    if (notes.length === 0) return;
    
    const allContent = notes.map(note => note.content).join('\n\n');
    const dailySummary = await summarizeText(allContent);
    setSummary(dailySummary);

    const dailyInsights = await generatePrompt(`Extract key insights from today's notes: ${allContent}`);
    setInsights(dailyInsights);

    const dailyActions = await generatePrompt(`Suggest next actions based on today's notes: ${allContent}`);
    setActions(dailyActions);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-white dark:bg-gray-900">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          AI Summarizer
        </h2>
        
        <div className="flex gap-2 mb-4">
          <button
            onClick={summarizeAllNotes}
            disabled={isLoading || notes.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            Summarize All Notes
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {notes.slice(0, 6).map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedNote?.id === note.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => handleSummarize(note)}
            >
              <div className="text-sm font-medium truncate mb-1">
                {note.content.split('\n')[0] || 'Untitled'}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(note.updatedAt).toLocaleDateString()}
              </div>
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
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <FileText size={20} className="text-blue-500" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Summary</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{summary}</p>
            </motion.div>
          )}

          {insights && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={20} className="text-yellow-500" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Key Insights</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{insights}</p>
            </motion.div>
          )}

          {actions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Target size={20} className="text-green-500" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Next Actions</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{actions}</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};