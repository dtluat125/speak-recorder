import ApiClient from '@/api/apiClient';
import FormData from 'form-data';

import {
  PredictResponse,
  PronunciationApiResponse,
} from '@/features/recording/types';
import dayjs from 'dayjs';

class PronunciationService {
  private apiClient;

  constructor(apiBaseURL: string) {
    const apiClientInstance = new ApiClient(apiBaseURL);
    this.apiClient = apiClientInstance.getInstance();
  }

  public async checkPronunciation(
    audioBlob: Blob,
    transcriptText: string,
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
      `audio-${dayjs().format('yyyy-MM-DD HH:mm:ss')}.mp3`,
    );

    // Append transcript text
    formData.append('transcript', transcriptText);

    try {
      const response = await this.apiClient.post<PronunciationApiResponse>(
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
}

export default PronunciationService;
