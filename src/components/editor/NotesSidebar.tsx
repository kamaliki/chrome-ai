import React from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Note } from '../../types/chrome-ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface NotesSidebarProps {
  notes: Note[];
  currentNote: Note | null;
  onNoteSelect: (note: Note) => void;
  onCreateNew: () => void;
  onDeleteNote: (noteId: string) => void;
  showAiPanel: boolean;
}

export const NotesSidebar: React.FC<NotesSidebarProps> = ({
  notes,
  currentNote,
  onNoteSelect,
  onCreateNew,
  onDeleteNote,
  showAiPanel
}) => {
  return (
    <div className={`
      w-64 h-full bg-muted/50 border-r p-2 md:p-4 overflow-y-auto
      fixed md:relative z-50 md:z-auto
      transform transition-transform duration-200 ease-in-out
      ${showAiPanel ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      hidden md:block
    `}>
      <Button onClick={onCreateNew} className="w-full mb-4">
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
              className={`transition-colors ${
                currentNote?.id === note.id
                  ? 'bg-primary/10 border-primary'
                  : 'hover:bg-muted/50'
              }`}
            >
              <CardContent className="p-3">
                <div 
                  className="cursor-pointer"
                  onClick={() => onNoteSelect(note)}
                >
                  <div className="text-sm font-medium truncate">
                    {note.title || 'Untitled'}
                  </div>
                  {note.topic && (
                    <div className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-2 py-1 rounded mt-1 inline-block">
                      {note.topic}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this note?')) {
                      onDeleteNote(note.id);
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full text-destructive hover:text-destructive"
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};