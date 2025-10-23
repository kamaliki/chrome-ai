import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Languages, Sparkles, Upload, Mic, Image, FileText, Volume2, VolumeX } from 'lucide-react';
import { Note } from '../types/chrome-ai';
import { saveNote, getNotes } from '../utils/storage';
import { useAI } from '../hooks/useAI';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export const Editor: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const { rewriteText, translateText, processMultimodalInput, speakResponse, isLoading } = useAI();
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [uploadedImages, setUploadedImages] = useState<Array<{id: string, url: string, name: string}>>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

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
    
    // Speak the rewritten text
    speakResponse(`Text rewritten: ${rewritten}`);
  };

  const handleTranslate = async () => {
    if (!selectedText) return;
    const translated = await translateText(selectedText, 'es');
    const newContent = content.replace(selectedText, translated);
    setContent(newContent);
    setSelectedText('');
    
    // Speak the translation
    speakResponse(`Translation: ${translated}`);
  };

  const createNewNote = () => {
    setCurrentNote(null);
    setContent('');
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // Create image URL and add to state
      const imageUrl = URL.createObjectURL(file);
      const imageId = `img-${Date.now()}`;
      
      setUploadedImages(prev => [...prev, { id: imageId, url: imageUrl, name: file.name }]);
      
      // Add text reference in content
      setContent(prev => prev + `\n\n📷 Image: ${file.name}\n[Processing image...]\n`);
      
      const extractedText = await processMultimodalInput({ image: file });
      
      // Replace the processing message with actual result
      setContent(prev => prev.replace('[Processing image...]\n', `AI Analysis: ${extractedText}\n\n---\n`));
      
      // Speak the AI response
      speakResponse(`Image analysis complete: ${extractedText}`);
    } catch (error) {
      console.error('Image upload error:', error);
      setContent(prev => prev.replace('[Processing image...]\n', '❌ Image processing failed\n'));
    }
    
    // Clear the input
    event.target.value = '';
  };

  const startRecording = async () => {
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      console.log('Microphone access granted, creating recorder...');
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (e) => {
        console.log('Audio data available:', e.data.size, 'bytes');
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        try {
          if (chunks.length === 0) {
            console.error('No audio data recorded');
            setContent(prev => prev + '\n\n❌ No audio data recorded\n');
            return;
          }
          
          // Add immediate feedback
          setContent(prev => prev + '\n\n[Processing audio...]\n');
          
          const audioBlob = new Blob(chunks, { type: recorder.mimeType });
          console.log('Audio blob created:', audioBlob.size, 'bytes, type:', audioBlob.type);
          
          const audioFile = new File([audioBlob], 'recording.webm', { type: audioBlob.type });
          
          const transcribedText = await processMultimodalInput({ audio: audioFile });
          
          // Replace the processing message with actual result
          setContent(prev => prev.replace('[Processing audio...]\n', `🎤 Audio Transcription:\n${transcribedText}\n`));
          
          // Speak confirmation
          speakResponse('Audio transcription complete');
        } catch (error) {
          console.error('Audio processing error:', error);
          setContent(prev => prev.replace('[Processing audio...]\n', `❌ Audio processing failed: ${error}\n`));
        }
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.onerror = (error) => {
        console.error('Recording error:', error);
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
        alert(`Recording error: ${error}`);
      };
      
      recorder.onstart = () => {
        console.log('Recording started');
        setContent(prev => prev + '\n\n🎤 Recording... (speak now)\n');
      };
      
      setMediaRecorder(recorder);
      recorder.start(1000); // Collect data every second
      setIsRecording(true);
      
      console.log('Recording state:', recorder.state);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert(`Could not access microphone: ${error.message}. Please check permissions and try again.`);
    }
  };

  const stopRecording = () => {
    console.log('Stop recording called, recorder state:', mediaRecorder?.state);
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      console.log('Stopping recorder...');
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      
      // Remove the "Recording..." message
      setContent(prev => prev.replace('\n\n🎤 Recording... (speak now)\n', ''));
    } else {
      console.log('Recorder not in recording state or null');
    }
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
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              className="gap-2"
              disabled={isLoading}
            >
              <Mic size={16} />
              {isRecording ? 'Stop' : 'Record'}
            </Button>
            
            <Button
              onClick={() => {
                if (isSpeaking) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                } else {
                  const textToSpeak = selectedText || content.slice(-200) || 'No content to read';
                  speakResponse(textToSpeak);
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

        {/* Content Area */}
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
    </div>
  );
};