import React from 'react';
import { Clock, RotateCcw } from 'lucide-react';
import { AIActivity } from '../../types/chrome-ai';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatMarkdown } from '../../utils/textFormatter';

interface AIActivityPanelProps {
  aiActivities: AIActivity[];
  showAiPanel: boolean;
  onRecoverText: (text: string) => void;
}

const markdownToPlainText = (markdown: string): string => {
  return markdown
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '• ');
};

export const AIActivityPanel: React.FC<AIActivityPanelProps> = ({
  aiActivities,
  showAiPanel,
  onRecoverText
}) => {
  if (!showAiPanel) return null;

  return (
    <div className={`
      w-full md:w-80 border-t md:border-t-0 md:border-l bg-muted/30 flex flex-col
      fixed md:relative bottom-0 md:bottom-auto left-0 md:left-auto
      h-1/2 md:h-full z-50 md:z-auto
    `}>
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
                    <div className="flex items-center justify-between mb-1">
                      <strong>Result:</strong>
                      <Button
                        onClick={() => {
                          const plainText = markdownToPlainText(activity.resultText);
                          onRecoverText(plainText);
                        }}
                        variant="outline"
                        size="sm"
                        className="gap-1 h-6 px-2 text-xs"
                      >
                        <RotateCcw size={12} />
                        Recover
                      </Button>
                    </div>
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
  );
};