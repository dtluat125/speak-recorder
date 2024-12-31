import PronunciationService from '@/api/services/pronunciationService';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const apiFactory = {
  pronunciationService: new PronunciationService(BASE_URL),
};
