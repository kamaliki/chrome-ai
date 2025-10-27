import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Languages, Sparkles, Upload, Image, FileText, Volume2, VolumeX, Trash2, Clock } from 'lucide-react';
import { Note, AIActivity } from '../types/chrome-ai';
import { saveNote, getNotes, deleteNote } from '../utils/storage';
import { useAI } from '../hooks/useAI';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EditorWelcome } from './EditorWelcome';
import { cleanOCRText, formatMarkdown } from '../utils/textFormatter';

// Convert markdown to plain text for textarea display
const markdownToPlainText = (markdown: string): string => {
  return markdown
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '• ');
};

export const Editor: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const [tags, setTags] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const { rewriteText, translateText, processMultimodalInput, speakResponse, generatePrompt, isLoading } = useAI();

  const [uploadedImages, setUploadedImages] = useState<Array<{id: string, url: string, name: string}>>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [aiActivities, setAiActivities] = useState<AIActivity[]>([]);
  const [showAiPanel, setShowAiPanel] = useState(true);
  const [isWritingNew, setIsWritingNew] = useState(false);

  // Load AI activities for current note
  useEffect(() => {
    if (currentNote?.id) {
      const savedActivities = localStorage.getItem(`focusflow-ai-activities-${currentNote.id}`);
      if (savedActivities) {
        try {
          const parsed = JSON.parse(savedActivities).map((activity: any) => ({
            ...activity,
            timestamp: new Date(activity.timestamp)
          }));
          setAiActivities(parsed);
        } catch (error) {
          setAiActivities([]);
        }
      } else {
        setAiActivities([]);
      }
    } else {
      setAiActivities([]);
    }
  }, [currentNote?.id]);

  // Save AI activities for current note
  const saveAiActivities = (activities: AIActivity[]) => {
    if (currentNote?.id) {
      localStorage.setItem(`focusflow-ai-activities-${currentNote.id}`, JSON.stringify(activities));
    }
    setAiActivities(activities);
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const savedNotes = await getNotes();
    setNotes(savedNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    if (savedNotes.length > 0) {
      setCurrentNote(savedNotes[0]);
      setContent(savedNotes[0].content);
      setTopic(savedNotes[0].topic || '');
      setTags(savedNotes[0].tags?.join(', ') || '');
    }
  };

  const handleSave = useCallback(async () => {
    if (!content.trim()) return;

    const note: Note = currentNote ? {
      ...currentNote,
      content,
      topic: topic.trim() || undefined,
      tags: tags.trim() ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      images: uploadedImages,
      updatedAt: new Date()
    } : {
      id: Date.now().toString(),
      content,
      topic: topic.trim() || undefined,
      tags: tags.trim() ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      images: uploadedImages,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await saveNote(note);
    setCurrentNote(note);
    loadNotes();
  }, [content, topic, tags, currentNote, uploadedImages]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString());
    }
  };

  const handleRewrite = async () => {
    if (!selectedText) return;
    const {result, explanation} = await rewriteText(selectedText);
    
    // Extract just the rewritten text (before any explanation)
    const cleanResult = result.split('**')[0].trim();
    const newContent = content.replace(selectedText, cleanResult);
    setContent(newContent);
    
    // Add to AI activities
    const activity: AIActivity = {
      id: Date.now().toString(),
      timestamp: new Date(),
      action: 'rewrite',
      originalText: selectedText,
      resultText: cleanResult,
      explanation
    };
    saveAiActivities([activity, ...aiActivities]);
    setShowAiPanel(true);
    
    setSelectedText('');
    speakResponse(`Text rewritten`);
  };

  const handleCleanText = async () => {
    if (!selectedText) return;
    const cleanedText = await generatePrompt(
      `Clean and format this extracted text, fix HTML entities, organize mathematical notation, and make it readable: ${selectedText}`
    );
    
    // Convert markdown to plain text for editor
    const plainText = markdownToPlainText(cleanedText);
    
    const newContent = content.replace(selectedText, plainText);
    setContent(newContent);
    
    // Add to AI activities
    const activity: AIActivity = {
      id: Date.now().toString(),
      timestamp: new Date(),
      action: 'rewrite',
      originalText: selectedText,
      resultText: cleanedText,
      explanation: 'Cleaned and formatted extracted text'
    };
    saveAiActivities([activity, ...aiActivities]);
    setShowAiPanel(true);
    
    setSelectedText('');
    speakResponse('Text cleaned and formatted');
  };

  const handleTranslate = async () => {
    if (!selectedText) return;
    const translated = await translateText(selectedText, targetLanguage);
    
    const newContent = content.replace(selectedText, translated);
    setContent(newContent);
    
    // Add to AI activities
    const activity: AIActivity = {
      id: Date.now().toString(),
      timestamp: new Date(),
      action: 'translate',
      originalText: selectedText,
      resultText: translated,
      language: targetLanguage,
      explanation: `Translated to ${targetLanguage.toUpperCase()}`
    };
    saveAiActivities([activity, ...aiActivities]);
    setShowAiPanel(true);
    
    setSelectedText('');
    speakResponseInLanguage(`Translation complete`, targetLanguage);
  };

  const speakResponseInLanguage = (text: string, lang: string) => {
    if (!text.trim()) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    // Set language code
    if (lang === 'es') utterance.lang = 'es-ES';
    else if (lang === 'ja') utterance.lang = 'ja-JP';
    else utterance.lang = 'en-US';
    
    // Find voice for the specific language
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(voice => 
      voice.lang.startsWith(lang)
    );
    
    if (targetVoice) {
      utterance.voice = targetVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const createNewNote = () => {
    setCurrentNote(null);
    setContent('');
    setTopic('');
    setTags('');
    setUploadedImages([]);
    setIsWritingNew(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteNote(noteId);
    
    // If we deleted the current note, clear the editor
    if (currentNote?.id === noteId) {
      setCurrentNote(null);
      setContent('');
      setTopic('');
      setTags('');
    }
    
    // Reload notes list
    loadNotes();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // Convert to base64 for persistent storage
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      const imageId = `img-${Date.now()}`;
      const imageData = { id: imageId, url: base64, name: file.name };
      
      setUploadedImages(prev => [...prev, imageData]);
      
      // Add text reference in content
      const processingText = `\n\n📷 Image: ${file.name}\n[Processing image...]\n`;
      setContent(prev => prev + processingText);
      
      const extractedText = await processMultimodalInput({ image: file });
      
      // Format the extracted text using local formatting function
      const formattedText = cleanOCRText(extractedText);
      
      // Replace the processing message with actual result and ensure it's saved
      const analysisText = `[Add a title above this line]\n\n${formattedText}\n\n---\n`;
      setContent(prev => {
        const newContent = prev.replace('[Processing image...]\n', analysisText);
        // Auto-save the note with extracted text and images
        setTimeout(() => {
          if (newContent.includes(analysisText)) {
            handleSave();
          }
        }, 100);
        return newContent;
      });
      
      // Speak the AI response
      speakResponse(`Image analysis complete: ${extractedText}`);
    } catch (error) {
      console.error('Image upload error:', error);
      setContent(prev => prev.replace('[Processing image...]\n', '❌ Image processing failed\n'));
    }
    
    // Clear the input
    event.target.value = '';
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
                className={`transition-colors ${
                  currentNote?.id === note.id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted/50'
                }`}
              >
                <CardContent className="p-3">
                  <div 
                    className="cursor-pointer"
                    onClick={() => {
                      setCurrentNote(note);
                      setContent(note.content);
                      setTopic(note.topic || '');
                      setTags(note.tags?.join(', ') || '');
                      setUploadedImages(note.images || []);
                    }}
                  >
                    <div className="text-sm font-medium truncate">
                      {note.content.split('\n')[0] || 'Untitled'}
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
                        handleDeleteNote(note.id);
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

      {/* Editor */}
      <div className="flex-1 h-screen flex flex-col">
        {/* Topic and Tags */}
        <div className="border-b p-4 flex items-center gap-2 flex-shrink-0">
          <Input
            placeholder="Topic (e.g., Mathematics, History)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-48"
          />
          <Input
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-48"
          />
        </div>
        
        {/* Toolbar */}
        <div className="border-b p-4 flex items-center gap-2 flex-shrink-0 flex-wrap">
          <Button
            onClick={handleSave}
            variant="default"
            className="gap-2"
          >
            <Save size={16} />
            Save
          </Button>
          
          {/* Multimodal Input */}
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <Button
              onClick={() => document.getElementById('image-upload')?.click()}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={isLoading}
            >
              <Image size={16} />
              Image
            </Button>
            

            <Button
              onClick={() => {
                if (isSpeaking) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                } else {
                  const textToSpeak = selectedText || content || 'No content to read';
                  // Auto-detect language and speak accordingly
                  const isSpanish = /[ñáéíóúü]/i.test(textToSpeak);
                  const isJapanese = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/i.test(textToSpeak);
                  const detectedLang = isJapanese ? 'ja' : isSpanish ? 'es' : 'en';
                  speakResponseInLanguage(textToSpeak, detectedLang);
                  setIsSpeaking(true);
                }
              }}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {isSpeaking ? 'Stop' : 'Speak'}
            </Button>
            
            <Button
              onClick={() => setShowAiPanel(!showAiPanel)}
              variant={showAiPanel ? "default" : "outline"}
              size="sm"
              className="gap-2"
            >
              <Clock size={16} />
              AI History
            </Button>
          </div>
          
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
                onClick={handleCleanText}
                disabled={isLoading}
                variant="outline"
                className="gap-2"
              >
                <FileText size={16} />
                Clean Text
              </Button>
              
              <div className="flex items-center gap-2">
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">🇪🇸 ES</SelectItem>
                    <SelectItem value="en">🇺🇸 EN</SelectItem>
                    <SelectItem value="ja">🇯🇵 JA</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  onClick={handleTranslate}
                  disabled={isLoading}
                  variant="outline"
                  className="gap-2"
                >
                  <Languages size={16} />
                  Translate
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex h-0">
          {/* Main Editor */}
          <div className="flex-1 flex flex-col">
            {/* Uploaded Images */}
            {uploadedImages.length > 0 && (
              <div className="p-4 border-b bg-muted/20">
                <h4 className="text-sm font-medium mb-2">Uploaded Images:</h4>
                <div className="flex flex-wrap gap-2">
                  {uploadedImages.map((img) => (
                    <div key={img.id} className="relative">
                      <img 
                        src={img.url} 
                        alt={img.name}
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <div className="text-xs text-center mt-1 truncate w-20">{img.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Text Area or Welcome Screen */}
            {notes.length === 0 && !content && !currentNote && !isWritingNew ? (
              <EditorWelcome />
            ) : (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onMouseUp={handleTextSelection}
                onKeyUp={handleTextSelection}
                placeholder="First line: Your note title (required)&#10;&#10;Then write your content here..."
                className="flex-1 resize text-lg max-h-screen m-1 p-1 border-none max-w-screen"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              />
            )}
          </div>
          
          {/* AI Activity Panel */}
          {showAiPanel && (
            <div className="w-80 border-l bg-muted/30 flex flex-col">
              <div className="p-4 border-b bg-muted/20 flex-shrink-0">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock size={16} />
                  AI Activity History
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {aiActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No AI activities yet. Try rewriting or translating some text!</p>
                ) : (
                  <div className="space-y-4">
                  {aiActivities.map((activity) => (
                    <Card key={activity.id} className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {activity.action.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Original:</strong>
                          <p className="text-muted-foreground bg-muted/50 p-2 rounded text-xs mt-1">
                            {activity.originalText}
                          </p>
                        </div>
                        
                        <div>
                          <strong>Result:</strong>
                          <div className="bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-100 p-2 rounded text-xs mt-1" dangerouslySetInnerHTML={{ __html: formatMarkdown(activity.resultText) }} />
                        </div>
                        
                        {activity.explanation && (
                          <div>
                            <strong>Changes:</strong>
                            <p className="text-xs text-muted-foreground mt-1">
                              {activity.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};