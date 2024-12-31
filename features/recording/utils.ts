import { PronunciationApiResponse } from '@/features/recording/types';

interface HighlightedWord {
  word: string; // Word or phoneme
  isCorrect: boolean; // Whether the pronunciation is correct
}

// Function to process API response and highlight pronunciation feedback
export function processPronunciationFeedback(
  response: PronunciationApiResponse,
): HighlightedWord[] {
  const highlightedWords: HighlightedWord[] = [];

  // Iterate over phoneme labels
  response.phoneme_labels.forEach((labelGroup) => {
    const { phonemes, scores } = labelGroup;

    phonemes.forEach((phoneme, index) => {
      const isCorrect = scores[index] === 1; // Score of 1 means correct
      highlightedWords.push({
        word: phoneme,
        isCorrect,
      });
    });
  });

  return highlightedWords;
}

export function mp3ToBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Ensure the file type is MP3
    if (file.type !== 'audio/mpeg') {
      reject(new Error('Invalid file type. Please upload an MP3 file.'));
      return;
    }

    // Read the file as a Blob
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result) {
        // Create a Blob from the file data
        const blob = new Blob([reader.result], { type: 'audio/mpeg' });
        resolve(blob);
      } else {
        reject(new Error('Failed to read the file.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading the file.'));
    };

    reader.readAsArrayBuffer(file);
  });
}
