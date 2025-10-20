import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Edit3, Languages, Sparkles } from 'lucide-react';
import { Note } from '../types/chrome-ai';
import { saveNote, getNotes } from '../utils/storage';
import { useAI } from '../hooks/useAI';

export const Editor: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const { rewriteText, translateText, isLoading } = useAI();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const savedNotes = await getNotes();
    setNotes(savedNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    if (savedNotes.length > 0) {
      setCurrentNote(savedNotes[0]);
      setContent(savedNotes[0].content);
    }
  };

  const handleSave = useCallback(async () => {
    if (!content.trim()) return;

    const note: Note = currentNote ? {
      ...currentNote,
      content,
      updatedAt: new Date()
    } : {
      id: Date.now().toString(),
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await saveNote(note);
    setCurrentNote(note);
    loadNotes();
  }, [content, currentNote]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString());
    }
  };

  const handleRewrite = async () => {
    if (!selectedText) return;
    const rewritten = await rewriteText(selectedText);
    const newContent = content.replace(selectedText, rewritten);
    setContent(newContent);
    setSelectedText('');
  };

  const handleTranslate = async () => {
    if (!selectedText) return;
    const translated = await translateText(selectedText, 'es');
    const newContent = content.replace(selectedText, translated);
    setContent(newContent);
    setSelectedText('');
  };

  const createNewNote = () => {
    setCurrentNote(null);
    setContent('');
  };

  return (
    <div className="flex h-full">
      {/* Notes Sidebar */}
      <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={createNewNote}
          className="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          New Note
        </button>
        
        <div className="space-y-2">
          {notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                currentNote?.id === note.id
                  ? 'bg-blue-100 dark:bg-blue-900'
                  : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              onClick={() => {
                setCurrentNote(note);
                setContent(note.content);
              }}
            >
              <div className="text-sm font-medium truncate">
                {note.content.split('\n')[0] || 'Untitled'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(note.updatedAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Save size={16} />
            Save
          </button>
          
          {selectedText && (
            <>
              <button
                onClick={handleRewrite}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                <Sparkles size={16} />
                Rewrite
              </button>
              
              <button
                onClick={handleTranslate}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                <Languages size={16} />
                Translate
              </button>
            </>
          )}
        </div>

        {/* Text Area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onMouseUp={handleTextSelection}
          onKeyUp={handleTextSelection}
          placeholder="Start writing your thoughts..."
          className="flex-1 p-6 resize-none border-none outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-lg leading-relaxed"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        />
      </div>
    </div>
  );
};