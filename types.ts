
export enum ExamType {
  NTPC = 'RRB NTPC',
  JE_CIVIL = 'RRB JE Civil'
}

export enum ExamStage {
  CBT1 = 'CBT 1',
  CBT2 = 'CBT 2'
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of options
  explanation: string;
  subject: string;
}

export interface QuizSet {
  id: string;
  title: string;
  exam: ExamType;
  stage: ExamStage;
  questions: Question[];
  timestamp: number;
}

export interface UserProgress {
  quizId: string;
  score: number;
  total: number;
  timestamp: number;
  exam: ExamType;
}
