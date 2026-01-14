export enum Category {
  BANQUEO = 'Banqueo',
  VIDEOS = 'Videos',
  APUNTES = 'Apuntes',
  GENERAL = 'General'
}

export interface SessionRecord {
  id: string;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
  category: Category;
  date: string; // ISO date string for grouping
}

export interface AppState {
  isSessionActive: boolean;
  currentSessionStartTime: number | null;
  currentCategory: Category;
  elapsedTime: number; // in seconds
}