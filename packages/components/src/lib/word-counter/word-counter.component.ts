import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatefulComponent } from '@content-lab/core';
import { StateManagerService } from '@content-lab/core';
import {
  WordCounterState,
  DEFAULT_WORD_COUNTER_STATE,
  TextStatistics,
  WordFrequency
} from './models/word-counter-state.model';

@Component({
  selector: 'app-word-counter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './word-counter.component.html',
  styleUrl: './word-counter.component.scss'
})
export class WordCounterComponent extends StatefulComponent<WordCounterState> implements OnDestroy {
  protected readonly TOOL_ID = 'word-counter';

  state: WordCounterState = { ...DEFAULT_WORD_COUNTER_STATE };
  statistics: TextStatistics | null = null;
  wordFrequencies: WordFrequency[] = [];

  private analysisTimeout: any;

  // Stop words list (common English words to filter)
  private stopWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
    'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
    'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
    'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
  ]);

  constructor(stateManager: StateManagerService) {
    super(stateManager);
  }

  protected override getDefaultState(): WordCounterState {
    return { ...DEFAULT_WORD_COUNTER_STATE };
  }

  protected override applyState(state: WordCounterState): void {
    this.state = { ...state };
    this.analyzeText();
  }

  protected override getCurrentState(): WordCounterState {
    return { ...this.state };
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.analysisTimeout) {
      clearTimeout(this.analysisTimeout);
    }
  }

  /**
   * Handle text input changes with debouncing
   */
  onTextChange(): void {
    if (this.analysisTimeout) {
      clearTimeout(this.analysisTimeout);
    }

    this.analysisTimeout = setTimeout(() => {
      this.analyzeText();
      this.saveState();
    }, 300);
  }

  /**
   * Main text analysis function
   */
  private analyzeText(): void {
    if (!this.state.text) {
      this.statistics = null;
      this.wordFrequencies = [];
      return;
    }

    const text = this.state.text;

    // Count words
    const words = this.getWords(text);
    const wordCount = words.length;
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;

    // Count characters
    const characterCount = text.length;
    const characterCountNoSpaces = text.replace(/\s/g, '').length;

    // Count sentences
    const sentences = this.getSentences(text);
    const sentenceCount = sentences.length;

    // Count paragraphs
    const paragraphs = this.getParagraphs(text);
    const paragraphCount = paragraphs.length;

    // Count lines
    const lineCount = text.split('\n').length;

    // Calculate syllables (approximate)
    const syllableCount = this.countSyllables(text);

    // Calculate complex words (3+ syllables)
    const complexWords = words.filter(word => this.countWordSyllables(word) >= 3).length;

    // Reading time
    const readingTimeMinutes = Math.floor(wordCount / this.state.readingSpeed);
    const readingTimeSeconds = Math.round((wordCount % this.state.readingSpeed) * (60 / this.state.readingSpeed));

    // Speaking time (average 130 WPM)
    const speakingTimeMinutes = Math.floor(wordCount / 130);

    // Page estimates (for printing/PDF export)
    const pagesDoublespaced = Math.ceil(wordCount / 250);      // Standard double-spaced
    const pagesSingleSpaced = Math.ceil(wordCount / 500);       // Standard single-spaced
    const pagesAcademic = Math.ceil(wordCount / 275);           // Academic format (double-spaced, 12pt Times)
    const pagesNovel = Math.ceil(wordCount / 300);              // Typical paperback novel format

    // Readability scores
    const fleschReadingEase = this.calculateFleschReadingEase(
      wordCount,
      sentenceCount,
      syllableCount
    );

    const fleschKincaidGrade = this.calculateFleschKincaidGrade(
      wordCount,
      sentenceCount,
      syllableCount
    );

    const gunningFogIndex = this.calculateGunningFog(
      wordCount,
      sentenceCount,
      complexWords
    );

    // Sentence analysis
    const sentenceLengths = sentences.map(s => this.getWords(s).length);
    const averageSentenceLength = sentenceLengths.length > 0
      ? Math.round(sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length)
      : 0;
    const longestSentence = sentenceLengths.length > 0 ? Math.max(...sentenceLengths) : 0;
    const shortestSentence = sentenceLengths.length > 0 ? Math.min(...sentenceLengths) : 0;

    // Word analysis
    const wordLengths = words.map(w => w.length);
    const averageWordLength = wordLengths.length > 0
      ? Math.round((wordLengths.reduce((a, b) => a + b, 0) / wordLengths.length) * 10) / 10
      : 0;

    this.statistics = {
      wordCount,
      uniqueWords,
      characterCount,
      characterCountNoSpaces,
      sentenceCount,
      paragraphCount,
      lineCount,
      readingTimeMinutes,
      readingTimeSeconds,
      speakingTimeMinutes,
      pagesDoublespaced,
      pagesSingleSpaced,
      pagesAcademic,
      pagesNovel,
      fleschReadingEase,
      fleschKincaidGrade,
      gunningFogIndex,
      averageSentenceLength,
      longestSentence,
      shortestSentence,
      averageWordLength,
      complexWords,
      syllableCount
    };

    // Calculate word frequencies
    this.calculateWordFrequencies(words);
  }

  /**
   * Extract words from text
   */
  private getWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s'-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  /**
   * Extract sentences from text
   */
  private getSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Extract paragraphs from text
   */
  private getParagraphs(text: string): string[] {
    return text
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }

  /**
   * Count syllables in text (approximate)
   */
  private countSyllables(text: string): number {
    const words = this.getWords(text);
    return words.reduce((count, word) => count + this.countWordSyllables(word), 0);
  }

  /**
   * Count syllables in a single word (approximate algorithm)
   */
  private countWordSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;

    // Remove silent e
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');

    // Count vowel groups
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  /**
   * Calculate Flesch Reading Ease score
   * Formula: 206.835 - 1.015(total words/total sentences) - 84.6(total syllables/total words)
   */
  private calculateFleschReadingEase(
    words: number,
    sentences: number,
    syllables: number
  ): number {
    if (words === 0 || sentences === 0) return 0;

    const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    return Math.round(Math.max(0, Math.min(100, score)) * 10) / 10;
  }

  /**
   * Calculate Flesch-Kincaid Grade Level
   * Formula: 0.39(total words/total sentences) + 11.8(total syllables/total words) - 15.59
   */
  private calculateFleschKincaidGrade(
    words: number,
    sentences: number,
    syllables: number
  ): number {
    if (words === 0 || sentences === 0) return 0;

    const grade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
    return Math.round(Math.max(0, grade) * 10) / 10;
  }

  /**
   * Calculate Gunning Fog Index
   * Formula: 0.4[(words/sentences) + 100(complex words/words)]
   */
  private calculateGunningFog(
    words: number,
    sentences: number,
    complexWords: number
  ): number {
    if (words === 0 || sentences === 0) return 0;

    const index = 0.4 * ((words / sentences) + 100 * (complexWords / words));
    return Math.round(index * 10) / 10;
  }

  /**
   * Calculate word frequencies
   */
  private calculateWordFrequencies(words: string[]): void {
    const frequencyMap = new Map<string, number>();

    words.forEach(word => {
      const lowerWord = word.toLowerCase();

      // Skip stop words if filter is enabled
      if (this.state.showStopWords && this.stopWords.has(lowerWord)) {
        return;
      }

      frequencyMap.set(lowerWord, (frequencyMap.get(lowerWord) || 0) + 1);
    });

    // Convert to array and sort by frequency
    this.wordFrequencies = Array.from(frequencyMap.entries())
      .map(([word, count]) => ({
        word,
        count,
        percentage: Math.round((count / words.length) * 1000) / 10
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 words
  }

  /**
   * Toggle stop words filter
   */
  toggleStopWords(): void {
    this.state.showStopWords = !this.state.showStopWords;
    this.analyzeText();
    this.saveState();
  }

  /**
   * Clear all text
   */
  clearText(): void {
    this.state.text = '';
    this.statistics = null;
    this.wordFrequencies = [];
    this.saveState();
  }

  /**
   * Get readability description
   */
  getReadabilityDescription(score: number): string {
    if (score >= 90) return 'Very Easy (5th grade)';
    if (score >= 80) return 'Easy (6th grade)';
    if (score >= 70) return 'Fairly Easy (7th grade)';
    if (score >= 60) return 'Standard (8th-9th grade)';
    if (score >= 50) return 'Fairly Difficult (10th-12th grade)';
    if (score >= 30) return 'Difficult (College)';
    return 'Very Difficult (College Graduate)';
  }

  /**
   * Format reading time
   */
  formatReadingTime(minutes: number, seconds: number): string {
    if (minutes === 0) {
      return `${seconds} seconds`;
    }
    if (seconds === 0) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    }
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}, ${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
  }

  /**
   * Copy statistics to clipboard
   */
  copyStatistics(): void {
    if (!this.statistics) return;

    const stats = `
Text Statistics
===============
Words: ${this.statistics.wordCount}
Characters: ${this.statistics.characterCount}
Sentences: ${this.statistics.sentenceCount}
Paragraphs: ${this.statistics.paragraphCount}
Reading Time: ${this.formatReadingTime(this.statistics.readingTimeMinutes, this.statistics.readingTimeSeconds)}

Page Count Estimates
====================
Double-spaced: ${this.statistics.pagesDoublespaced} pages (~250 words/page)
Single-spaced: ${this.statistics.pagesSingleSpaced} pages (~500 words/page)
Academic format: ${this.statistics.pagesAcademic} pages (~275 words/page)
Novel format: ${this.statistics.pagesNovel} pages (~300 words/page)

Readability
===========
Flesch Reading Ease: ${this.statistics.fleschReadingEase} (${this.getReadabilityDescription(this.statistics.fleschReadingEase)})
Flesch-Kincaid Grade: ${this.statistics.fleschKincaidGrade}
Gunning Fog Index: ${this.statistics.gunningFogIndex}

Average Sentence Length: ${this.statistics.averageSentenceLength} words
Average Word Length: ${this.statistics.averageWordLength} characters
    `.trim();

    navigator.clipboard.writeText(stats).then(() => {
      // Could show a notification here
      console.log('Statistics copied to clipboard');
    });
  }
}
