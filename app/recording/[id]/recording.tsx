'use client';

import { Notification } from '@/components/Notification';
import RecordingDesktop from '@/components/pages/recording/RecordingDesktop';
import RecordingMobile from '@/components/pages/recording/RecordingMobile';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/Container';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { api } from '@/convex/_generated/api';
import { Note, PredictResponse } from '@/features/recording/types';
import { useCheckPronunciation } from '@/hooks/use-check-pronunciation';
import { useTranscribe } from '@/hooks/use-transcribe';
import { cn, getAudioFromIndexedDB } from '@/lib/utils';
import {
  CheckIcon,
  Cross2Icon,
  Pencil1Icon,
  UpdateIcon,
} from '@radix-ui/react-icons';
import { Preloaded } from 'convex/react';
import { debounce } from 'lodash';
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

  const [isTranscriptConfirmed, setIsTranscriptConfirmed] = useState(false);
  const [editTranscript, setEditTranscript] = useState<boolean>(false);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');

  const { loading, error, result, checkPronunciation } =
    useCheckPronunciation();

  const {
    loading: transcribeLoading,
    error: transcribeError,
    result: transcribeResult,
    transcribe,
  } = useTranscribe();
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
  const debounceTranscribe = debounce(transcribe, 1000);

  const handleConfirmTranscript = () => {
    localStorage.setItem('audioTranscript', currentTranscript);
    setEditTranscript(false);
    setIsTranscriptConfirmed(true);
  };

  useEffect(() => {
    if (!isTranscriptConfirmed) return;
    const audioFileId = localStorage.getItem('audioFileId');
    const audioTranscript = localStorage.getItem('audioTranscript') || '';
    if (audioFileId) {
      getAudioFromIndexedDB(audioFileId).then((audioBlob) => {
        if (audioBlob) {
          debounceCheckPronunciation?.(audioBlob, audioTranscript);
        }
      });
    }
  }, [checkPronunciation, isTranscriptConfirmed]);

  useEffect(() => {
    if (isTranscriptConfirmed) return;
    const audioFileId = localStorage.getItem('audioFileId');
    if (audioFileId) {
      getAudioFromIndexedDB(audioFileId).then((audioBlob) => {
        if (audioBlob) {
          debounceTranscribe?.(audioBlob);
        }
      });
    }
  }, [transcribe, isTranscriptConfirmed]);

  useEffect(() => {
    if (!transcribeResult) return;
    setCurrentTranscript(transcribeResult.transcript);
  }, [transcribeResult]);

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

  if (!isTranscriptConfirmed) {
    if (transcribeLoading || (!transcribeResult && !transcribeError)) {
      return (
        <Container className="flex h-[calc(100vh-280px)] items-center justify-center text-center">
          <h1 className="my-auto flex items-center justify-center gap-2 text-4xl">
            <span className="animate-pulse">Transcribing... </span>{' '}
          </h1>
        </Container>
      );
    }

    if (transcribeError) {
      return (
        <Container className=" ">
          <div>
            <Notification
              title="Error"
              variant="error"
              message={transcribeError}
              // className="max-w-[600px]"
            />
          </div>
        </Container>
      );
    }

    return (
      <Container>
        <div className="flex h-[calc(100vh-280px)] flex-col items-center justify-center">
          <p className="text-xl font-semibold md:text-center">
            Transcript confirmation
          </p>
          <div className="mt-3 text-lg">
            {editTranscript ? (
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => setEditTranscript(false)}
                      className="flex items-center gap-1"
                    >
                      Confirm <CheckIcon className="h-4 w-4 shrink-0" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Confirm</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() => setEditTranscript(true)}
                    className="flex items-center gap-1"
                  >
                    Edit <Pencil1Icon className="h-4 w-4 shrink-0 md:w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Not what you've just said? Update the transcript</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div
            className={cn(
              'text-medium mt-6  flex flex-wrap items-center gap-4 md:mt-8',
              'gap-4',
            )}
          >
            {editTranscript ? (
              <div className="flex-1">
                <Input
                  className={`leading !h-auto text-2xl font-medium leading-[114.3%] tracking-[-0.75px] text-dark`}
                  value={currentTranscript}
                  onChange={(e) => setCurrentTranscript(e.target.value)}
                />
              </div>
            ) : (
              <p className="text-center text-2xl">
                "{currentTranscript || 'Transcription not available'}"
              </p>
            )}
          </div>
          <div className="mt-6">
            <Button onClick={handleConfirmTranscript}>Next</Button>
          </div>
        </div>
      </Container>
    );
  }

  if (loading || (!result && !error)) {
    return (
      <Container className="flex h-[calc(100vh-280px)] items-center justify-center text-center">
        <h1 className="my-auto flex items-center justify-center gap-2 text-4xl">
          <span className="animate-pulse">Processing... </span>{' '}
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
