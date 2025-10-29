import React from 'react';
import { Save, Languages, Sparkles, Image, FileText, Volume2, VolumeX, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditorToolbarProps {
  content: string;
  title: string;
  topic: string;
  tags: string;
  selectedText: string;
  targetLanguage: string;
  isSpeaking: boolean;
  isLoading: boolean;
  showAiPanel: boolean;
  onSave: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSpeak: () => void;
  onToggleAiPanel: () => void;
  onRewrite: () => void;
  onCleanText: () => void;
  onTranslate: () => void;
  onLanguageChange: (lang: string) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  content,
  title,
  topic,
  tags,
  selectedText,
  targetLanguage,
  isSpeaking,
  isLoading,
  showAiPanel,
  onSave,
  onImageUpload,
  onSpeak,
  onToggleAiPanel,
  onRewrite,
  onCleanText,
  onTranslate,
  onLanguageChange
}) => {
  return (
    <div className="border-b p-2 md:p-4 flex items-center gap-1 md:gap-2 flex-shrink-0 flex-wrap">
      <Button
        onClick={onSave}
        variant="default"
        size="sm"
        className="gap-1 md:gap-2"
        disabled={!content.trim() || !title.trim() || !topic.trim() || !tags.trim()}
        title={!content.trim() || !title.trim() || !topic.trim() || !tags.trim() ? 
          `Missing: ${[!title.trim() && 'Title', !topic.trim() && 'Topic', !tags.trim() && 'Tags', !content.trim() && 'Content'].filter(Boolean).join(', ')}` : 
          'Save note'}
      >
        <Save size={14} />
        <span className="hidden sm:inline">Save</span>
      </Button>
      
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          className="hidden"
          id="image-upload"
        />
        <Button
          onClick={() => document.getElementById('image-upload')?.click()}
          variant="outline"
          size="sm"
          className="gap-1"
          disabled={isLoading}
        >
          <Image size={14} />
          <span className="hidden sm:inline">Image</span>
        </Button>

        <Button
          onClick={onSpeak}
          variant="outline"
          size="sm"
          className="gap-1"
        >
          {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span className="hidden sm:inline">{isSpeaking ? 'Stop' : 'Speak'}</span>
        </Button>
        
        <Button
          onClick={onToggleAiPanel}
          variant={showAiPanel ? "default" : "outline"}
          size="sm"
          className="gap-1"
        >
          <Clock size={14} />
          <span className="hidden sm:inline">AI History</span>
        </Button>
      </div>
      
      {selectedText && (
        <>
          <Button
            onClick={onRewrite}
            disabled={isLoading}
            variant="secondary"
            size="sm"
            className="gap-1"
          >
            <Sparkles size={14} />
            <span className="hidden sm:inline">Rewrite</span>
          </Button>
          
          <Button
            onClick={onCleanText}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <FileText size={14} />
            <span className="hidden sm:inline">Clean</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <Select value={targetLanguage} onValueChange={onLanguageChange}>
              <SelectTrigger className="w-16 md:w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">🇪🇸 ES</SelectItem>
                <SelectItem value="en">🇺🇸 EN</SelectItem>
                <SelectItem value="ja">🇯🇵 JA</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={onTranslate}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <Languages size={14} />
              <span className="hidden sm:inline">Translate</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};