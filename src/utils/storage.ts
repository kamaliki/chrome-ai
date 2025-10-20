import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Note, TimerSession, AppSettings } from '../types/chrome-ai';

interface FocusFlowDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
  };
  sessions: {
    key: string;
    value: TimerSession;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

let db: IDBPDatabase<FocusFlowDB>;

export const initDB = async () => {
  db = await openDB<FocusFlowDB>('focusflow', 1, {
    upgrade(db) {
      db.createObjectStore('notes', { keyPath: 'id' });
      db.createObjectStore('sessions', { keyPath: 'id' });
      db.createObjectStore('settings', { keyPath: 'theme' });
    },
  });
};

export const saveNote = async (note: Note) => {
  if (!db) await initDB();
  await db.put('notes', note);
};

export const getNotes = async (): Promise<Note[]> => {
  if (!db) await initDB();
  return await db.getAll('notes');
};

export const deleteNote = async (id: string) => {
  if (!db) await initDB();
  await db.delete('notes', id);
};

export const saveSession = async (session: TimerSession) => {
  if (!db) await initDB();
  await db.put('sessions', session);
};

export const getSessions = async (): Promise<TimerSession[]> => {
  if (!db) await initDB();
  return await db.getAll('sessions');
};

export const saveSettings = async (settings: AppSettings) => {
  if (!db) await initDB();
  await db.put('settings', settings);
};

export const getSettings = async (): Promise<AppSettings | undefined> => {
  if (!db) await initDB();
  return await db.get('settings', 'light');
};