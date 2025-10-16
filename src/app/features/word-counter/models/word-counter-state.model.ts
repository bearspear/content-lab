export interface WordCounterState {
  text: string;
  readingSpeed: number; // words per minute
  showStopWords: boolean;
  highlightMode: string; // 'none' | 'long-sentences' | 'complex-words' | etc.
}

export const DEFAULT_WORD_COUNTER_STATE: WordCounterState = {
  text: '',
  readingSpeed: 225, // average reading speed
  showStopWords: false,
  highlightMode: 'none'
};

export interface TextStatistics {
  // Basic counts
  wordCount: number;
  uniqueWords: number;
  characterCount: number;
  characterCountNoSpaces: number;
  sentenceCount: number;
  paragraphCount: number;
  lineCount: number;

  // Reading metrics
  readingTimeMinutes: number;
  readingTimeSeconds: number;
  speakingTimeMinutes: number;

  // Readability scores
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFogIndex: number;

  // Sentence analysis
  averageSentenceLength: number;
  longestSentence: number;
  shortestSentence: number;

  // Word analysis
  averageWordLength: number;
  complexWords: number;
  syllableCount: number;
}

export interface WordFrequency {
  word: string;
  count: number;
  percentage: number;
}
