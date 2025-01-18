// Custom hook for checking pronunciation
import { apiFactory } from '@/api/apiFactory';
import { getAudioFromIndexedDB, getAudioMetadata } from '@/lib/utils';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useAsyncFn } from 'react-use';

interface PredictResponse {
  // Define the structure of your PredictResponse here
  [key: string]: any;
}

interface UseCheckPronunciationResponse {
  loading: boolean;
  error: string | null;
  result: PredictResponse | null;
  checkPronunciation: (
    audioBlob?: Blob | null,
    transcript?: string,
    audioId?: string,
  ) => Promise<PredictResponse | undefined>;
}

export function useCheckPronunciation(): UseCheckPronunciationResponse {
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResponse | null>(null);

  const [{ loading }, checkPronunciation] = useAsyncFn(
    async (
      passedAudioBlob?: Blob | null,
      transcript?: string,
      passedAudioId?: string,
    ) => {
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
        const response =
          await apiFactory.pronunciationService?.checkPronunciation(
            audioBlob,
            transcript || '',
            audioId,
          );

        setResult(response as PredictResponse);
        return response as PredictResponse;
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
    checkPronunciation,
  };
}
