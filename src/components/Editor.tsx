import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Languages, Sparkles } from 'lucide-react';
import { Note } from '../types/chrome-ai';
import { saveNote, getNotes } from '../utils/storage';
import { useAI } from '../hooks/useAI';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

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
    <div className="flex h-screen">
      {/* Notes Sidebar */}
      <div className="w-64 h-full bg-muted/50 border-r p-4 overflow-y-auto">
        <Button
          onClick={createNewNote}
          className="w-full mb-4"
        >
          New Note
        </Button>
        
        <div className="space-y-2">
          {notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card 
                className={`cursor-pointer transition-colors ${
                  currentNote?.id === note.id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => {
                  setCurrentNote(note);
                  setContent(note.content);
                }}
              >
                <CardContent className="p-3">
                  <div className="text-sm font-medium truncate">
                    {note.content.split('\n')[0] || 'Untitled'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 h-full flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-4 flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={handleSave}
            variant="default"
            className="gap-2"
          >
            <Save size={16} />
            Save
          </Button>
          
          {selectedText && (
            <>
              <Button
                onClick={handleRewrite}
                disabled={isLoading}
                variant="secondary"
                className="gap-2"
              >
                <Sparkles size={16} />
                Rewrite
              </Button>
              
              <Button
                onClick={handleTranslate}
                disabled={isLoading}
                variant="outline"
                className="gap-2"
              >
                <Languages size={16} />
                Translate
              </Button>
            </>
          )}
        </div>

        {/* Text Area */}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onMouseUp={handleTextSelection}
          onKeyUp={handleTextSelection}
          placeholder="Start writing your thoughts..."
          className="flex-1 resize-none border-none text-lg leading-relaxed"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        />
      </div>
    </div>
  );
};