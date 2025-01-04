'use client';

import { apiFactory } from '@/api/apiFactory';
import { Notification } from '@/components/Notification';
import RecordingDesktop from '@/components/pages/recording/RecordingDesktop';
import RecordingMobile from '@/components/pages/recording/RecordingMobile';
import Container from '@/components/ui/Container';
import { api } from '@/convex/_generated/api';
import { Note, PredictResponse } from '@/features/recording/types';
import { useCheckPronunciation } from '@/hooks/use-check-pronunciation';
import { getAudioFromIndexedDB, getAudioMetadata } from '@/lib/utils';
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

  const { loading, error, result, checkPronunciation } =
    useCheckPronunciation();

  const handleCheckPronunciation = async (
    audioBlob?: Blob,
    audioTranscript?: string,
  ) => {
    const response = await checkPronunciation?.(
      audioBlob || null,
      audioTranscript,
    );
    const audioUrl = audioBlob
      ? URL.createObjectURL(audioBlob)
      : currentNote?.note?.audioFileUrl;
    setCurrentNote({
      note: {
        audioFileUrl: audioUrl,
        result: response as PredictResponse,
      },
    });
  };

  const debounceCheckPronunciation = debounce(handleCheckPronunciation, 1000);

  useEffect(() => {
    const audioFileId = localStorage.getItem('audioFileId');
    const audioTranscript = localStorage.getItem('audioTranscript') || '';
    if (audioFileId) {
      getAudioFromIndexedDB(audioFileId).then((audioBlob) => {
        if (audioBlob) {
          debounceCheckPronunciation?.(audioBlob, audioTranscript);
        }
      });
    }
  }, [checkPronunciation]);

  const handleReevaluate = async (transcript: string) => {
    checkPronunciation?.(null, transcript)?.then((response) => {
      setCurrentNote({
        note: {
          ...currentNote?.note,
          transcription: transcript,
          result: response as PredictResponse,
        },
      });
    });
  };

  if (loading || (!result && !error)) {
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
          <RecordingDesktop
            reevaluate={handleReevaluate}
            {...(currentNote as { note: Note })}
          />
          <RecordingMobile
            reevaluate={handleReevaluate}
            {...(currentNote as { note: Note })}
          />
        </>
      }
    </Container>
  );
}
