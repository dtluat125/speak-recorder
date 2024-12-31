// Type for a single phoneme label and its corresponding score
export interface PhonemeLabel {
  phonemes: string[]; // Array of phoneme strings
  scores: number[]; // Array of scores for each phoneme
}

export interface LabelDetails {
  phoneme: string; // The phoneme representation of the word segment
  word_segment: string; // The specific segment of the word
  label: number; // The label for the word segment (e.g., 0 or 1)
}

export interface WordLabel {
  word: string; // The full word being analyzed
  details: LabelDetails[]; // Array of details about phonemes and labels for this word
}

export interface PredictResponse {
  labels: WordLabel[]; // Array of words with their respective details
}

export interface Note {
  summary?: string;
  transcription?: string;
  title?: string;
  _creationTime?: string;
  audioFileUrl?: string;
  generatingTranscript?: boolean;
  generatingTitle?: boolean;
  result: PredictResponse;
}
