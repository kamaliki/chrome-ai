import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Note, AIActivity } from '../types/chrome-ai';
import { saveNote, getNotes, deleteNote } from '../utils/storage';
import { useAI } from '../hooks/useAI';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { EditorWelcome } from './EditorWelcome';
import { ModelLoadingAnimation } from './ModelLoadingAnimation';
import { cleanOCRText } from '../utils/textFormatter';
import { NotesSidebar } from './editor/NotesSidebar';
import { TopicTagsHeader } from './editor/TopicTagsHeader';
import { EditorToolbar } from './editor/EditorToolbar';
import { AIActivityPanel } from './editor/AIActivityPanel';
import { MobileNotesPanel } from './editor/MobileNotesPanel';

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
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [tags, setTags] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const { rewriteText, translateText, processMultimodalInput, speakResponse, generatePrompt, detectLanguage, isLoading } = useAI();

  const [uploadedImages, setUploadedImages] = useState<Array<{id: string, url: string, name: string}>>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [aiActivities, setAiActivities] = useState<AIActivity[]>([]);
  const [showAiPanel, setShowAiPanel] = useState(true);
  const [isWritingNew, setIsWritingNew] = useState(false);
  const [existingTopics, setExistingTopics] = useState<string[]>([]);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [detectedLanguage, setDetectedLanguage] = useState<{language: string, confidence: number} | null>(null);
  const [showMobileNotes, setShowMobileNotes] = useState(false);

  // Load AI activities for current note
  useEffect(() => {
    if (currentNote?.id) {
      const savedActivities = localStorage.getItem(`cbc-tutor-ai-activities-${currentNote.id}`);
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
      localStorage.setItem(`cbc-tutor-ai-activities-${currentNote.id}`, JSON.stringify(activities));
    }
    setAiActivities(activities);
  };

  useEffect(() => {
    loadNotes();
  }, []);

  // Detect language when content changes
  useEffect(() => {
    const detectContentLanguage = async () => {
      if (content.trim().length > 20) {
        const result = await detectLanguage(content);
        setDetectedLanguage(result);
      } else {
        setDetectedLanguage(null);
      }
    };
    
    const timeoutId = setTimeout(detectContentLanguage, 1000);
    return () => clearTimeout(timeoutId);
  }, [content, detectLanguage]);

  const loadNotes = async () => {
    const savedNotes = await getNotes();
    setNotes(savedNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    
    // Extract unique topics and tags
    const topics = [...new Set(savedNotes.map(note => note.topic).filter(Boolean))];
    const tags = [...new Set(savedNotes.flatMap(note => note.tags || []))];
    //@ts-expect-error
    setExistingTopics(topics);
    setExistingTags(tags);
    
    if (savedNotes.length > 0) {
      setCurrentNote(savedNotes[0]);
      setContent(savedNotes[0].content);
      setTitle(savedNotes[0].title || '');
      setTopic(savedNotes[0].topic || '');
      setTags(savedNotes[0].tags?.join(', ') || '');
    }
  };

  const handleSave = useCallback(async () => {
    if (!content.trim() || !title.trim() || !topic.trim() || !tags.trim()) return;

    const note: Note = currentNote ? {
      ...currentNote,
      content,
      title: title.trim() || undefined,
      topic: topic.trim() || undefined,
      tags: tags.trim() ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      images: uploadedImages,
      updatedAt: new Date()
    } : {
      id: Date.now().toString(),
      content,
      title: title.trim() || undefined,
      topic: topic.trim() || undefined,
      tags: tags.trim() ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      images: uploadedImages,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await saveNote(note);
    setCurrentNote(note);
    loadNotes();
  }, [content, title, topic, tags, currentNote, uploadedImages]);

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
      `Clean and format this text, fix HTML entities, organize notation, and make it readable. Return ONLY the cleaned text with no explanations: ${selectedText}`
    );
    
    // Convert markdown to plain text for editor
    const plainText = markdownToPlainText(cleanedText);
    
    const newContent = content.replace(selectedText, plainText);
    setContent(newContent);
    
    // Add to AI activities
    const activity: AIActivity = {
      id: Date.now().toString(),
      timestamp: new Date(),
      action: 'clean',
      originalText: selectedText,
      resultText: cleanedText,
      explanation: 'Cleaned and formatted text'
    };
    saveAiActivities([activity, ...aiActivities]);
    setShowAiPanel(true);
    
    setSelectedText('');
    speakResponse('Text cleaned');
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
    
    // Map language codes to locale codes
    const langMap: Record<string, string> = {
      'es': 'es-ES',
      'ja': 'ja-JP', 
      'fr': 'fr-FR',
      'de': 'de-DE',
      'sw-KE': 'sw-KE', // Swahili (Kenya)
      'sw': 'sw-KE'
    };
    
    utterance.lang = langMap[lang] || 'en-US';
    
    // Find voice for the specific language
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(voice => 
      voice.lang.startsWith(lang) || voice.lang.startsWith(langMap[lang] || '')
    );
    
    if (targetVoice) {
      utterance.voice = targetVoice;
    } else if (lang === 'sw-KE' || lang === 'sw') {
      // Fallback to English for Swahili since it's rarely available
      utterance.lang = 'en-US';
      console.log('Swahili voice not available, using English fallback');
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const createNewNote = () => {
    setCurrentNote(null);
    setContent('');
    setTitle('');
    setTopic('');
    setTags('');
    setUploadedImages([]);
    setIsWritingNew(true);
  };

  const handleNoteSelect = (note: Note) => {
    setCurrentNote(note);
    setContent(note.content);
    setTitle(note.title || '');
    setTopic(note.topic || '');
    setTags(note.tags?.join(', ') || '');
    setUploadedImages(note.images || []);
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteNote(noteId);
    
    // If we deleted the current note, clear the editor
    if (currentNote?.id === noteId) {
      setCurrentNote(null);
      setContent('');
      setTitle('');
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
      
      // Clean OCR text and convert to plain text for editor
      const cleanedText = cleanOCRText(extractedText);
      const plainText = markdownToPlainText(cleanedText);
      
      // Replace the processing message with actual result and ensure it's saved
      const analysisText = `[Add a title above this line]\n\n${plainText}\n\n---\n`;
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
    <div className="flex h-screen relative">
      {/* Model Loading Animation */}
      <AnimatePresence>
        {isLoading && (
          <ModelLoadingAnimation message="Processing with AI..." />
        )}
      </AnimatePresence>
      {/* Mobile Sidebar Overlay */}
      {showAiPanel && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowAiPanel(false)}
        />
      )}
      
      <NotesSidebar
        notes={notes}
        currentNote={currentNote}
        onNoteSelect={handleNoteSelect}
        onCreateNew={createNewNote}
        onDeleteNote={handleDeleteNote}
        showAiPanel={showAiPanel}
      />

      {/* Editor */}
      <div className="flex-1 h-screen flex flex-col md:ml-0">
        <TopicTagsHeader
          topic={topic}
          tags={tags}
          existingTopics={existingTopics}
          existingTags={existingTags}
          detectedLanguage={detectedLanguage}
          onTopicChange={setTopic}
          onTagsChange={setTags}
        />
        
        <EditorToolbar
          content={content}
          title={title}
          topic={topic}
          tags={tags}
          selectedText={selectedText}
          targetLanguage={targetLanguage}
          isSpeaking={isSpeaking}
          isLoading={isLoading}
          showAiPanel={showAiPanel}
          onSave={handleSave}
          onImageUpload={handleImageUpload}
          onSpeak={() => {
            if (isSpeaking) {
              window.speechSynthesis.cancel();
              setIsSpeaking(false);
            } else {
              const textToSpeak = selectedText || content || 'No content to read';
              const isSpanish = /[ñáéíóúü]/i.test(textToSpeak);
              const isJapanese = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/i.test(textToSpeak);
              const detectedLang = isJapanese ? 'ja' : isSpanish ? 'es' : 'en';
              speakResponseInLanguage(textToSpeak, detectedLang);
              setIsSpeaking(true);
            }
          }}
          onToggleAiPanel={() => setShowAiPanel(!showAiPanel)}
          onRewrite={handleRewrite}
          onCleanText={handleCleanText}
          onTranslate={handleTranslate}
          onLanguageChange={setTargetLanguage}
        />

        {/* Content Area */}
        <div className="flex-1 flex h-0 flex-col md:flex-row">
          {/* Main Editor */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Note Title */}
            <div className="p-4 border-b">
              <Input
                placeholder="Note Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold border-none p-0 focus-visible:ring-0 shadow-none"
              />
            </div>
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
                placeholder="Write your note content here..."
                className="flex-1 resize text-lg max-h-screen m-1 p-4 border-none max-w-screen"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              />
            )}
          </div>
          
          <AIActivityPanel
            aiActivities={aiActivities}
            showAiPanel={showAiPanel}
            onRecoverText={setContent}
          />
        </div>
      </div>
      
      <MobileNotesPanel
        notes={notes}
        currentNote={currentNote}
        showMobileNotes={showMobileNotes}
        onToggle={() => setShowMobileNotes(!showMobileNotes)}
        onNoteSelect={handleNoteSelect}
        onCreateNew={createNewNote}
      />
    </div>
  );
};