'use client';

import { Notification } from '@/components/Notification';
import RecordingDesktop from '@/components/pages/recording/RecordingDesktop';
import RecordingMobile from '@/components/pages/recording/RecordingMobile';
import Container from '@/components/ui/Container';
import { api } from '@/convex/_generated/api';
import { Note, PredictResponse } from '@/features/recording/types';
import { useCheckPronunciation } from '@/hooks/use-check-pronunciation';
import { getAudioFromIndexedDB } from '@/lib/utils';
import { Preloaded } from 'convex/react';
import { debounce } from 'lodash';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

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

  const urlSearchParams = useSearchParams();
  const router = useRouter();

  const { loading, error, result, checkPronunciation } =
    useCheckPronunciation();

  const handleCheckPronunciation = async (
    audioBlob?: Blob,
    audioTranscript?: string,
    audioFileId?: string,
  ) => {
    const response = await checkPronunciation?.(
      audioBlob || null,
      audioTranscript,
      audioFileId,
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

  const debounceCheckPronunciation = debounce(handleCheckPronunciation, 200);

  useEffect(() => {
    const audioFileId = urlSearchParams.get('audioFileId');
    if (!audioFileId) {
      router.push('/record');
      return;
    }
    const audioTranscript = localStorage.getItem('audioTranscript') || '';
    if (audioFileId) {
      getAudioFromIndexedDB(audioFileId).then((audioBlob) => {
        if (audioBlob) {
          debounceCheckPronunciation?.(audioBlob, audioTranscript, audioFileId);
        }
      });
    }
  }, [checkPronunciation]);

  const handleReevaluate = async (transcript: string) => {
    localStorage.setItem('audioTranscript', transcript);
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
      <Container className="flex h-[calc(100vh-280px)] flex-col items-center justify-center gap-6 text-center">
        <h1 className="text-xl">Analyzing your speech ...</h1>

        <Loader2 className="h-8 w-8 animate-spin" />
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
