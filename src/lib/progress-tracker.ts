// Progress Tracking System
export interface UserProgress {
  userId: string;
  hiragana: CharacterProgress[];
  katakana: CharacterProgress[];
  kanji: CharacterProgress[];
  vocabulary: VocabularyProgress[];
  grammar: GrammarProgress[];
  quizzes: QuizProgress[];
  stats: UserStats;
  achievements: Achievement[];
  lastStudied: string;
  studyStreak: number;
}

export interface CharacterProgress {
  character: string;
  mastery: number; // 0-100
  lastReviewed: string;
  timesCorrect: number;
  timesIncorrect: number;
  nextReview: string;
}

export interface VocabularyProgress {
  word: string;
  mastery: number;
  lastReviewed: string;
  timesCorrect: number;
  timesIncorrect: number;
  nextReview: string;
}

export interface GrammarProgress {
  pattern: string;
  mastery: number;
  lastReviewed: string;
  timesCorrect: number;
  timesIncorrect: number;
  nextReview: string;
}

export interface QuizProgress {
  quizType: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
  timeSpent: number; // in seconds
}

export interface UserStats {
  totalStudyTime: number; // in minutes
  totalQuizzes: number;
  averageScore: number;
  charactersLearned: number;
  vocabularyLearned: number;
  grammarPointsLearned: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  xp: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'learning' | 'streak' | 'quiz' | 'special';
}

// Local Storage Keys
const STORAGE_KEYS = {
  USER_PROGRESS: 'japanese_learning_progress',
  USER_PREFERENCES: 'japanese_learning_preferences',
  QUIZ_HISTORY: 'japanese_quiz_history'
};

// Progress Tracker Class
export class ProgressTracker {
  private static instance: ProgressTracker;
  private progress: UserProgress | null = null;

  private constructor() {
    this.loadProgress();
  }

  public static getInstance(): ProgressTracker {
    if (!ProgressTracker.instance) {
      ProgressTracker.instance = new ProgressTracker();
    }
    return ProgressTracker.instance;
  }

  private loadProgress(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
      if (stored) {
        this.progress = JSON.parse(stored);
      } else {
        this.initializeProgress();
      }
    }
  }

  private saveProgress(): void {
    if (typeof window !== 'undefined' && this.progress) {
      localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(this.progress));
    }
  }

  private initializeProgress(): void {
    this.progress = {
      userId: 'default_user',
      hiragana: [],
      katakana: [],
      kanji: [],
      vocabulary: [],
      grammar: [],
      quizzes: [],
      stats: {
        totalStudyTime: 0,
        totalQuizzes: 0,
        averageScore: 0,
        charactersLearned: 0,
        vocabularyLearned: 0,
        grammarPointsLearned: 0,
        level: 'beginner',
        xp: 0
      },
      achievements: [],
      lastStudied: new Date().toISOString(),
      studyStreak: 0
    };
    this.saveProgress();
  }

  public getProgress(): UserProgress {
    return this.progress || this.initializeProgress() || this.progress!;
  }

  public updateCharacterProgress(type: 'hiragana' | 'katakana' | 'kanji', character: string, correct: boolean): void {
    if (!this.progress) return;

    const progressArray = this.progress[type];
    let charProgress = progressArray.find(p => p.character === character);

    if (!charProgress) {
      charProgress = {
        character,
        mastery: 0,
        lastReviewed: new Date().toISOString(),
        timesCorrect: 0,
        timesIncorrect: 0,
        nextReview: new Date().toISOString()
      };
      progressArray.push(charProgress);
    }

    if (correct) {
      charProgress.timesCorrect++;
      charProgress.mastery = Math.min(100, charProgress.mastery + 10);
    } else {
      charProgress.timesIncorrect++;
      charProgress.mastery = Math.max(0, charProgress.mastery - 5);
    }

    charProgress.lastReviewed = new Date().toISOString();
    charProgress.nextReview = this.calculateNextReview(charProgress.mastery);

    this.updateStats();
    this.saveProgress();
  }

  public updateVocabularyProgress(word: string, correct: boolean): void {
    if (!this.progress) return;

    let vocabProgress = this.progress.vocabulary.find(p => p.word === word);

    if (!vocabProgress) {
      vocabProgress = {
        word,
        mastery: 0,
        lastReviewed: new Date().toISOString(),
        timesCorrect: 0,
        timesIncorrect: 0,
        nextReview: new Date().toISOString()
      };
      this.progress.vocabulary.push(vocabProgress);
    }

    if (correct) {
      vocabProgress.timesCorrect++;
      vocabProgress.mastery = Math.min(100, vocabProgress.mastery + 10);
    } else {
      vocabProgress.timesIncorrect++;
      vocabProgress.mastery = Math.max(0, vocabProgress.mastery - 5);
    }

    vocabProgress.lastReviewed = new Date().toISOString();
    vocabProgress.nextReview = this.calculateNextReview(vocabProgress.mastery);

    this.updateStats();
    this.saveProgress();
  }

  public recordQuizResult(quizType: string, score: number, totalQuestions: number, timeSpent: number): void {
    if (!this.progress) return;

    const quizResult: QuizProgress = {
      quizType,
      score,
      totalQuestions,
      correctAnswers: Math.round(score * totalQuestions / 100),
      completedAt: new Date().toISOString(),
      timeSpent
    };

    this.progress.quizzes.push(quizResult);
    this.progress.stats.totalQuizzes++;
    this.progress.stats.xp += Math.round(score);

    // Update average score
    const totalScore = this.progress.quizzes.reduce((sum, quiz) => sum + quiz.score, 0);
    this.progress.stats.averageScore = totalScore / this.progress.quizzes.length;

    // Check for achievements
    this.checkAchievements();

    this.saveProgress();
  }

  private calculateNextReview(mastery: number): string {
    const now = new Date();
    let daysToAdd = 1;

    if (mastery >= 80) daysToAdd = 7;
    else if (mastery >= 60) daysToAdd = 3;
    else if (mastery >= 40) daysToAdd = 2;

    now.setDate(now.getDate() + daysToAdd);
    return now.toISOString();
  }

  private updateStats(): void {
    if (!this.progress) return;

    this.progress.stats.charactersLearned = 
      this.progress.hiragana.filter(p => p.mastery >= 70).length +
      this.progress.katakana.filter(p => p.mastery >= 70).length +
      this.progress.kanji.filter(p => p.mastery >= 70).length;

    this.progress.stats.vocabularyLearned = 
      this.progress.vocabulary.filter(p => p.mastery >= 70).length;

    this.progress.stats.grammarPointsLearned = 
      this.progress.grammar.filter(p => p.mastery >= 70).length;

    // Update level based on progress
    const totalMastery = this.progress.stats.charactersLearned + this.progress.stats.vocabularyLearned;
    if (totalMastery >= 200) {
      this.progress.stats.level = 'advanced';
    } else if (totalMastery >= 100) {
      this.progress.stats.level = 'intermediate';
    } else {
      this.progress.stats.level = 'beginner';
    }

    this.progress.lastStudied = new Date().toISOString();
  }

  private checkAchievements(): void {
    if (!this.progress) return;

    const achievements: Achievement[] = [];

    // First Quiz Achievement
    if (this.progress.stats.totalQuizzes === 1) {
      achievements.push({
        id: 'first_quiz',
        name: 'First Steps',
        description: 'Complete your first quiz',
        icon: '🌟',
        unlockedAt: new Date().toISOString(),
        category: 'quiz'
      });
    }

    // Perfect Score Achievement
    const perfectQuizzes = this.progress.quizzes.filter(q => q.score === 100).length;
    if (perfectQuizzes === 1) {
      achievements.push({
        id: 'perfect_score',
        name: 'Perfect!',
        description: 'Get a perfect score on a quiz',
        icon: '💯',
        unlockedAt: new Date().toISOString(),
        category: 'quiz'
      });
    }

    // Add new achievements
    achievements.forEach(achievement => {
      if (!this.progress!.achievements.find(a => a.id === achievement.id)) {
        this.progress!.achievements.push(achievement);
      }
    });
  }

  public getCharactersForReview(type: 'hiragana' | 'katakana' | 'kanji'): string[] {
    if (!this.progress) return [];

    const now = new Date().toISOString();
    return this.progress[type]
      .filter(p => p.nextReview <= now)
      .map(p => p.character);
  }

  public getMasteryLevel(type: 'hiragana' | 'katakana' | 'kanji', character: string): number {
    if (!this.progress) return 0;

    const progress = this.progress[type].find(p => p.character === character);
    return progress ? progress.mastery : 0;
  }

  public resetProgress(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER_PROGRESS);
      this.initializeProgress();
    }
  }
}