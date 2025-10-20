import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle, Clock } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';
import { useAI } from '../hooks/useAI';
import { getSessions } from '../utils/storage';
import { TimerSession } from '../types/chrome-ai';

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
    <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Focus Timer
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
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
            className="text-gray-200 dark:text-gray-700"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            className="text-blue-500"
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
            <div className="text-4xl font-mono font-bold text-gray-900 dark:text-gray-100">
              {formatTime()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isCompleted ? 'Completed!' : isRunning ? 'Focus Time' : 'Ready to Start'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-8">
        {!isRunning ? (
          <button
            onClick={start}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
          >
            <Play size={20} />
            Start
          </button>
        ) : (
          <button
            onClick={pause}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors"
          >
            <Pause size={20} />
            Pause
          </button>
        )}
        
        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
        >
          <RotateCcw size={20} />
          Reset
        </button>

        {isCompleted && (
          <button
            onClick={handleComplete}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            <CheckCircle size={20} />
            Complete
          </button>
        )}
      </div>

      {/* Session Notes */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mb-6"
        >
          <textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Add notes about this session..."
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
            rows={3}
          />
        </motion.div>
      )}

      {/* Today's Progress */}
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={20} className="text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Today's Progress
          </h3>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="text-2xl font-bold text-blue-500 mb-1">
            {todaySessions.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Sessions completed
          </div>
          
          {todaySessions.length > 0 && (
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Total focus time: {Math.round(todaySessions.reduce((acc, s) => acc + s.duration, 0) / 60)} minutes
            </div>
          )}
        </div>
      </div>
    </div>
  );
};