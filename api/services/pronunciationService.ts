import ApiClient from '@/api/apiClient';
import FormData from 'form-data';

import { PredictResponse } from '@/features/recording/types';
import dayjs from 'dayjs';
import { getAudioMetadata } from '@/lib/utils';

class PronunciationService {
  private apiClient;

  constructor(apiBaseURL: string) {
    const apiClientInstance = new ApiClient(apiBaseURL);
    this.apiClient = apiClientInstance.getInstance();
  }

  public async checkPronunciation(
    audioBlob: Blob,
    transcriptText: string,
    audioId?: string,
  ): Promise<
    | PredictResponse
    | {
        detail: string;
      }
  > {
    const formData = new FormData();

    // Append audio file
    formData.append(
      'audio',
      audioBlob,
      `${audioId || dayjs().format('YYYY-MM-DD HH:mm:ss')}.${
        getAudioMetadata().extension
      }`,
    );

    // Append transcript text
    formData.append('transcript', transcriptText?.toLowerCase() || '//');

    try {
      const response = await this.apiClient.post<PredictResponse>(
        '/predict',
        formData,
        {},
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('Error Response:', error.response.data);
        throw error;
      }
      console.error('Error:', error.message);
      throw error;
    }
  }

  public async transcribe(
    audioBlob: Blob,
    audioId?: string,
  ): Promise<{ transcript: string }> {
    const formData = new FormData();

    // Append audio file
    formData.append(
      'audio',
      audioBlob,
      `${audioId || dayjs().format('YYYY-MM-DD HH:mm:ss')}.${
        getAudioMetadata().extension
      }`,
    );

    try {
      const response = await this.apiClient.post<{ transcript: string }>(
        '/transcribe',
        formData,
        {},
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('Error Response:', error.response.data);
        throw error;
      }
      console.error('Error:', error.message);
      throw error;
    }
  }
}

export default PronunciationService;
