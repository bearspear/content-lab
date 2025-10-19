/**
 * Read a file as text content
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsText(file);
  });
}

/**
 * Read a file as Data URL (for images)
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file as Data URL'));
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Create and trigger a download for a blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Create a blob from text content
 */
export function createTextBlob(content: string, mimeType: string = 'text/plain'): Blob {
  return new Blob([content], { type: mimeType });
}

/**
 * Validate if a file is a markdown file
 */
export function isMarkdownFile(file: File): boolean {
  return file.name.endsWith('.md') ||
         file.name.endsWith('.markdown') ||
         file.type === 'text/markdown';
}

/**
 * Validate if a file is an image file
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}
