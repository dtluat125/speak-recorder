'use client';

import { apiFactory } from '@/api/apiFactory';
import { Notification } from '@/components/Notification';
import RecordingDesktop from '@/components/pages/recording/RecordingDesktop';
import RecordingMobile from '@/components/pages/recording/RecordingMobile';
import Container from '@/components/ui/Container';
import { api } from '@/convex/_generated/api';
import { Note, PredictResponse } from '@/features/recording/types';
import { getAudioFromIndexedDB } from '@/lib/utils';
import { Preloaded } from 'convex/react';
import dayjs from 'dayjs';
import { debounce } from 'lodash';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';

export default function RecordingPage({
  preloadedNote,
}: {
  preloadedNote?: Preloaded<typeof api.notes.getNote>;
}) {
  // const currentNote = usePreloadedQueryWithAuth(preloadedNote);
  const [currentNote, setCurrentNote] = useState<{
    note: Note | null;
  }>({
    note: null,
  });

  const [error, setError] = useState('');

  const [{ loading: checkPronunciationLoading }, checkPronunciation] =
    useAsyncFn(async () => {
      try {
        const audioFileId = localStorage.getItem('audioFileId');
        const audioTranscript = localStorage.getItem('audioTranscript');
        const audioBlob = await getAudioFromIndexedDB(audioFileId || ''); // Replace with the actual audio file ID

        // const fileData = await fetch('/test.mp3');
        // const audioBlob = await fileData.blob();
        // const audioTranscript = 'The person who loves football is my brother';
        if (!audioBlob) {
          return;
        }
        if (process.env.NEXT_PUBLIC_MODE === 'development') {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(audioBlob);
          link.download = `${dayjs().format(
            'YYYY-MM-DD-HH:mm:ss',
          )}recording.wav`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        const audioUrl = URL.createObjectURL(audioBlob);
        const result =
          await apiFactory.pronunciationService?.checkPronunciation(
            audioBlob,
            audioTranscript || '',
          );

        setCurrentNote({
          note: {
            ...currentNote.note,
            audioFileUrl: audioUrl,
            generatingTranscript: false,
            generatingTitle: false,
            transcription: audioTranscript || '',
            title: audioTranscript || '',
            result: result as PredictResponse,
          },
        });

        console.log('result', result);
      } catch (error: any) {
        console.error('Error:', error);
        setError(
          error?.response?.data?.detail || 'Fail to check pronunciation',
        );
      }
    }, []);

  const debounceCheckPronunciation = debounce(checkPronunciation, 1000);

  useEffect(() => {
    debounceCheckPronunciation();
  }, [checkPronunciation]);

  if (checkPronunciationLoading) {
    return (
      <Container className="mt-10 text-center">
        <h1 className="text-4xl">
          <Loader2 className="mx-auto !h-10 !w-10 animate-spin" />
        </h1>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className=" ">
        <div>
          <Notification
            title="Error"
            variant="error"
            message={error}
            // className="max-w-[600px]"
          />
        </div>
      </Container>
    );
  }

  if (!currentNote || !currentNote.note)
    return (
      <Container>
        <h1>Current note is empty</h1>
      </Container>
    );

  return (
    <Container className="mx-auto max-w-[1500px]">
      {
        <>
          <RecordingDesktop {...(currentNote as { note: Note })} />
          <RecordingMobile {...(currentNote as { note: Note })} />
        </>
      }
    </Container>
  );
}
