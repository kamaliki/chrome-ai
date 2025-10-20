import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle, Clock } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';
import { useAI } from '../hooks/useAI';
import { getSessions } from '../utils/storage';
import { TimerSession } from '../types/chrome-ai';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Timer: React.FC = () => {
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [sessionNotes, setSessionNotes] = useState('');
  const { timeLeft, isRunning, isCompleted, start, pause, reset, complete, formatTime, progress } = useTimer();
  const { generatePrompt, isLoading } = useAI();

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (isCompleted) {
      generateMotivationalMessage();
    }
  }, [isCompleted]);

  const loadSessions = async () => {
    const savedSessions = await getSessions();
    setSessions(savedSessions.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()));
  };

  const generateMotivationalMessage = async () => {
    const todaySessions = sessions.filter(s => 
      new Date(s.completedAt).toDateString() === new Date().toDateString()
    );
    
    const message = await generatePrompt(
      `Generate a motivational message for completing ${todaySessions.length + 1} focus sessions today`
    );
    setSessionNotes(message);
  };

  const handleComplete = async () => {
    await complete(sessionNotes);
    loadSessions();
    setSessionNotes('');
  };

  const todaySessions = sessions.filter(s => 
    new Date(s.completedAt).toDateString() === new Date().toDateString()
  );

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-4 md:p-8 bg-background overflow-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Focus Timer
        </h2>
        <p className="text-muted-foreground">
          Stay focused with the Pomodoro technique
        </p>
      </motion.div>

      {/* Timer Circle */}
      <div className="relative mb-8">
        <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-muted"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            className="text-primary"
            style={{
              strokeDasharray: `${2 * Math.PI * 45}`,
              strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}`,
            }}
            initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100) }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-mono font-bold text-foreground">
              {formatTime()}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {isCompleted ? 'Completed!' : isRunning ? 'Focus Time' : 'Ready to Start'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-8">
        {!isRunning ? (
          <Button
            onClick={start}
            className="gap-2 rounded-full"
          >
            <Play size={20} />
            Start
          </Button>
        ) : (
          <Button
            onClick={pause}
            variant="secondary"
            className="gap-2 rounded-full"
          >
            <Pause size={20} />
            Pause
          </Button>
        )}
        
        <Button
          onClick={reset}
          variant="outline"
          className="gap-2 rounded-full"
        >
          <RotateCcw size={20} />
          Reset
        </Button>

        {isCompleted && (
          <Button
            onClick={handleComplete}
            className="gap-2 rounded-full"
          >
            <CheckCircle size={20} />
            Complete
          </Button>
        )}
      </div>

      {/* Session Notes */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mb-6"
        >
          <Textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Add notes about this session..."
            className="resize-none"
            rows={3}
          />
        </motion.div>
      )}

      {/* Today's Progress */}
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary mb-1">
              {todaySessions.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Sessions completed
            </div>
            
            {todaySessions.length > 0 && (
              <div className="mt-3 text-xs text-muted-foreground">
                Total focus time: {Math.round(todaySessions.reduce((acc, s) => acc + s.duration, 0) / 60)} minutes
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};