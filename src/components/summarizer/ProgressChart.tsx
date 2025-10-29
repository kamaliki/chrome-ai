import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Note } from '../../types/chrome-ai';

interface ProgressChartProps {
  selectedNote: Note | null;
  showProgressChart: boolean;
  onClose: () => void;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  selectedNote,
  showProgressChart,
  onClose
}) => {
  if (!selectedNote?.quizResults || selectedNote.quizResults.length === 0) {
    return null;
  }

  return (
    <Dialog open={showProgressChart} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Quiz Progress Chart</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} className="text-blue-500" />
                Quiz Performance Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <div className="grid grid-cols-1 gap-4">
                  {selectedNote.quizResults.slice().reverse().map((result, index) => {
                    const percentage = Math.round((result.score / result.totalQuestions) * 100);
                    return (
                      <div key={result.id} className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground w-20">
                          Quiz {index + 1}
                        </div>
                        <div className="flex-1 bg-muted rounded-full h-4 relative">
                          <div 
                            className={`h-4 rounded-full transition-all ${
                              percentage >= 80 ? 'bg-green-500' :
                              percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                            {percentage}%
                          </span>
                        </div>
                        <div className="text-sm font-medium w-16">
                          {result.score}/{result.totalQuestions}
                        </div>
                        <div className="text-xs text-muted-foreground w-24">
                          {new Date(result.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
            <div className="px-6 pb-6">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium">
                  Average Score: {Math.round(
                    selectedNote.quizResults.reduce((sum, result) => 
                      sum + (result.score / result.totalQuestions), 0
                    ) / selectedNote.quizResults.length * 100
                  )}%
                </span>
              </div>
              <div className="text-muted-foreground text-sm mt-1">
                Showing performance for {selectedNote.quizResults.length} quiz attempts
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};