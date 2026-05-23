export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  stress_level: number;
  mood: string;
  created_at: string;
}

export type StressLevel = 1 | 2 | 3 | 4 | 5;

export type BreathingType = '4-7-8' | 'box' | 'relaxing';

export interface BreathingPattern {
  name: string;
  inhale: number;
  hold1?: number;
  exhale: number;
  hold2?: number;
  cycles: number;
}
