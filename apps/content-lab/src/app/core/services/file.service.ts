import { Injectable } from '@angular/core';
import {
  readFileAsText,
  readFileAsDataURL,
  isMarkdownFile,
  isImageFile
} from '../utils';

export interface FileReadResult {
  content: string;
  filename: string;
  type: 'markdown' | 'image' | 'other';
}

@Injectable({
  providedIn: 'root'
})
export class FileService {

  /**
   * Read a markdown file and return its text content
   */
  async readMarkdownFile(file: File): Promise<FileReadResult> {
    if (!isMarkdownFile(file)) {
      throw new Error('File is not a valid markdown file');
    }

    try {
      const content = await readFileAsText(file);
      return {
        content,
        filename: file.name,
        type: 'markdown'
      };
    } catch (error) {
      console.error('Error reading markdown file:', error);
      throw new Error(`Failed to read file: ${file.name}`);
    }
  }

  /**
   * Read an image file and return its Data URL
   */
  async readImageFile(file: File): Promise<FileReadResult> {
    if (!isImageFile(file)) {
      throw new Error('File is not a valid image file');
    }

    try {
      const content = await readFileAsDataURL(file);
      return {
        content,
        filename: file.name,
        type: 'image'
      };
    } catch (error) {
      console.error('Error reading image file:', error);
      throw new Error(`Failed to read image: ${file.name}`);
    }
  }

  /**
   * Read any text file
   */
  async readTextFile(file: File): Promise<string> {
    try {
      return await readFileAsText(file);
    } catch (error) {
      console.error('Error reading text file:', error);
      throw new Error(`Failed to read file: ${file.name}`);
    }
  }

  /**
   * Validate if a file is a markdown file
   */
  isMarkdownFile(file: File): boolean {
    return isMarkdownFile(file);
  }

  /**
   * Validate if a file is an image file
   */
  isImageFile(file: File): boolean {
    return isImageFile(file);
  }

  /**
   * Process dropped files and categorize them
   */
  async processDroppedFiles(files: FileList): Promise<FileReadResult[]> {
    const results: FileReadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        if (isMarkdownFile(file)) {
          const result = await this.readMarkdownFile(file);
          results.push(result);
        } else if (isImageFile(file)) {
          const result = await this.readImageFile(file);
          results.push(result);
        } else {
          console.warn(`Unsupported file type: ${file.name}`);
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }

    return results;
  }

  /**
   * Create markdown syntax for an embedded image
   */
  createImageMarkdown(filename: string, dataUrl: string): string {
    // Remove file extension from filename for alt text
    const altText = filename.replace(/\.[^/.]+$/, '');
    return `![${altText}](${dataUrl})`;
  }

  /**
   * Get file extension from filename
   */
  getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()! : '';
  }

  /**
   * Get file name without extension
   */
  getFileNameWithoutExtension(filename: string): string {
    return filename.replace(/\.[^/.]+$/, '');
  }
}
