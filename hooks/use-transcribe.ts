// Custom hook for checking pronunciation
import { apiFactory } from '@/api/apiFactory';
import { getAudioFromIndexedDB, getAudioMetadata } from '@/lib/utils';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useAsyncFn } from 'react-use';

export interface TranscribeResponse {
  // Define the structure of your TranscribeResponse here
  transcript: string;
}

interface UseTranscribeResponse {
  loading: boolean;
  error: string | null;
  result: TranscribeResponse | null;
  transcribe: (
    audioBlob?: Blob | null,
    audioId?: string,
  ) => Promise<TranscribeResponse | undefined>;
}

export function useTranscribe(): UseTranscribeResponse {
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranscribeResponse | null>(null);

  const [{ loading }, transcribe] = useAsyncFn(
    async (passedAudioBlob?: Blob | null, passedAudioId?: string) => {
      try {
        let audioBlob = passedAudioBlob;
        let audioId = passedAudioId;
        if (!audioBlob) {
          const audioFileId = localStorage.getItem('audioFileId');

          audioBlob = (await getAudioFromIndexedDB(audioFileId || '')) as any;
          audioId = audioFileId || '';
          if (!audioBlob) throw new Error('Audio file not found');
        }

        // Optionally save the audio file locally in non-production environments
        if (process.env.NEXT_PUBLIC_MODE !== 'production') {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(audioBlob);
          link.download = `${dayjs().format('YYYY-MM-DD-HH:mm:ss')}recording.${
            getAudioMetadata().extension
          }`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        // Call the API to check pronunciation
        const response = await apiFactory.pronunciationService?.transcribe(
          audioBlob,
          audioId,
        );

        setResult(response as TranscribeResponse);
        return response as TranscribeResponse;
      } catch (error: any) {
        console.error('Error:', error);
        const errorMessage =
          error?.response?.data?.detail || 'Failed to check pronunciation';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [],
  );

  return {
    loading,
    error,
    result,
    transcribe,
  };
}
