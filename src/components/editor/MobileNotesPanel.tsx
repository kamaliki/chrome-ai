import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, List, ChevronDown } from 'lucide-react';
import { Note } from '../../types/chrome-ai';
import { Button } from '@/components/ui/button';

interface MobileNotesPanelProps {
  notes: Note[];
  currentNote: Note | null;
  showMobileNotes: boolean;
  onToggle: () => void;
  onNoteSelect: (note: Note) => void;
  onCreateNew: () => void;
}

export const MobileNotesPanel: React.FC<MobileNotesPanelProps> = ({
  notes,
  currentNote,
  showMobileNotes,
  onToggle,
  onNoteSelect,
  onCreateNew
}) => {
  return (
    <div className="md:hidden fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {showMobileNotes && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="mb-4 bg-card border rounded-lg shadow-lg max-h-80 w-64 overflow-hidden"
          >
            <div className="p-3 border-b bg-muted/20">
              <h3 className="font-semibold text-sm">Notes</h3>
            </div>
            <div className="max-h-60 overflow-y-auto">
              <Button
                onClick={() => {
                  onCreateNew();
                  onToggle();
                }}
                className="w-full m-2 gap-2"
                size="sm"
              >
                <Plus size={16} />
                New Note
              </Button>
              
              <div className="px-2 pb-2 space-y-1">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-2 rounded cursor-pointer text-sm transition-colors ${
                      currentNote?.id === note.id
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      onNoteSelect(note);
                      onToggle();
                    }}
                  >
                    <div className="font-medium truncate">
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
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Button
        onClick={onToggle}
        size="lg"
        className="rounded-full w-14 h-14 shadow-lg"
      >
        {showMobileNotes ? <ChevronDown size={24} /> : <List size={24} />}
      </Button>
    </div>
  );
};