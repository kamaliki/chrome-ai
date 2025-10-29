import React, { useState } from 'react';
import { Languages, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TopicTagsHeaderProps {
  topic: string;
  tags: string;
  existingTopics: string[];
  existingTags: string[];
  detectedLanguage: {language: string, confidence: number} | null;
  onTopicChange: (topic: string) => void;
  onTagsChange: (tags: string) => void;
}

export const TopicTagsHeader: React.FC<TopicTagsHeaderProps> = ({
  topic,
  tags,
  existingTopics,
  existingTags,
  detectedLanguage,
  onTopicChange,
  onTagsChange
}) => {
  const [showTips, setShowTips] = useState(false);

  return (
    <div className="border-b p-2 md:p-4 space-y-3 flex-shrink-0">
      {showTips && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">📚 Organization Tips</h4>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <p><strong>Topic:</strong> Main subject (e.g., "Mathematics", "History")</p>
            <p><strong>Tags:</strong> Specific subtopics in order (e.g., "algebra, equations, chapter1")</p>
            <p><strong>Hierarchy:</strong> Topic → Tag1 → Tag2 → Tag3 → Your Note</p>
            <p className="text-blue-600 dark:text-blue-400">💡 Use consistent naming for better organization in the AI Summarizer!</p>
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-2 overflow-x-auto">
        <Button
          onClick={() => setShowTips(!showTips)}
          variant="ghost"
          size="sm"
          className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400/70 dark:hover:text-blue-300/80 dark:hover:bg-blue-950/30 flex-shrink-0"
        >
          <HelpCircle size={16} />
          {showTips ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </Button>
        <Input
          placeholder="Topic (e.g., Mathematics)"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          className="w-40 md:w-56 text-sm"
          list="existing-topics"
        />
        <datalist id="existing-topics">
          {existingTopics.map((existingTopic) => (
            <option key={existingTopic} value={existingTopic} />
          ))}
        </datalist>
        
        <Input
          placeholder="Tags (e.g., algebra, equations)"
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
          className="w-40 md:w-56 text-sm"
          list="existing-tags"
        />
        <datalist id="existing-tags">
          {existingTags.map((tag) => (
            <option key={tag} value={tag} />
          ))}
        </datalist>
        

        
        {detectedLanguage && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Languages size={14} />
            <span>{detectedLanguage.language.toUpperCase()}</span>
            <span className="text-green-600">({Math.round(detectedLanguage.confidence * 100)}%)</span>
          </div>
        )}
      </div>
    </div>
  );
};