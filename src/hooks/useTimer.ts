import { useState, useEffect, useCallback } from 'react';
import { TimerSession } from '../types/chrome-ai';
import { saveSession } from '../utils/storage';

export const useTimer = (initialDuration = 1 * 60) => {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsCompleted(false);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(initialDuration);
    setIsCompleted(false);
  }, [initialDuration]);

  const complete = useCallback(async (notes?: string) => {
    const session: TimerSession = {
      id: Date.now().toString(),
      duration: initialDuration - timeLeft,
      completedAt: new Date(),
      notes
    };
    
    await saveSession(session);
    setIsCompleted(true);
    setIsRunning(false);
  }, [initialDuration, timeLeft]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    timeLeft,
    isRunning,
    isCompleted,
    start,
    pause,
    reset,
    complete,
    formatTime: () => formatTime(timeLeft),
    progress: ((initialDuration - timeLeft) / initialDuration) * 100
  };
};