'use client';

import { api } from '@/convex/_generated/api';
import {
  convertWebMToMP3,
  getAudioMetadata,
  getCurrentFormattedDate,
  saveAudio,
  saveAudioToIndexedDB,
} from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useMutation, useQuery } from 'convex/react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import fixWebmDuration from 'fix-webm-duration';
import { useRouter } from 'next-nprogress-bar';
import { Notification } from '@/components/Notification';
import { apiFactory } from '@/api/apiFactory';
import Container from '@/components/ui/Container';
import TranscribeDialog from '@/components/pages/recording/TranscribeDialog';
import { useTranscribe } from '@/hooks/use-transcribe';

const RecordVoicePage = () => {
  const [title, setTitle] = useState(
    'The person who loves football is my brother',
  );
  const envVarsUrl = useQuery(api.utils.envVarsMissing);

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);

  const [error, setError] = useState('');

  const { user } = useUser();

  const generateUploadUrl = useMutation(api.notes.generateUploadUrl);
  const createNote = useMutation(api.notes.createNote);

  const router = useRouter();
  const startTime = useRef(Date.now());

  const {
    loading: transcribeLoading,
    error: transcribeError,
    result: transcribeResult,
    transcribe,
  } = useTranscribe();

  const [isTranscribingOpen, setIsTranscribingOpen] = useState(false);
  const onTranscribingConfirm = (transcript: string) => {
    setIsTranscribingOpen(false);
    localStorage.setItem('audioTranscript', transcript);
    router.push(
      `/recording/test?${new URLSearchParams({
        audioFileId: localStorage.getItem('audioFileId') || '',
      }).toString()}`,
      { scroll: false },
    );
  };

  const onTranscribingOpenChange = (open: boolean) => {
    setIsTranscribingOpen(open);
    if (!open) {
      setIsRunning(false);
      setTotalSeconds(0);
    }
  };

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      console.log('Recording started', stream);
      setIsRunning(true);

      const audioStream = new MediaStream(stream.getAudioTracks());

      const recorder = new MediaRecorder(audioStream, {
        mimeType:
          getAudioMetadata()?.mimeType === 'audio/mp4'
            ? 'audio/mp4'
            : 'audio/webm',
        audioBitsPerSecond: 768000,
      });

      console.log('Recorder created', recorder);
      let audioChunks: any = [];

      recorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };

      recorder.onstop = async () => {
        try {
          let audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          if (getAudioMetadata().mimeType === 'audio/mp3')
            audioBlob = await convertWebMToMP3(audioBlob);

          const fileId = await saveAudioToIndexedDB(audioBlob);
          console.log('Audio saved with ID:', fileId);
          localStorage.setItem('audioFileId', fileId);
          localStorage.setItem('audioTranscript', '');

          transcribe?.(audioBlob);
          setIsTranscribingOpen(true);

          // Optional: Redirect or perform additional actions
          // router.push(`/recording/test`, { scroll: false });
        } catch (error) {
          console.error(error);
        }

        // }
      };
      setMediaRecorder(recorder as any);
      recorder.start();
      startTime.current = Date.now();
    } catch (error) {
      console.error(error);
      alert(error);
      setError(
        'Unable to access the media. Please ensure you have granted the necessary permissions.',
      );
    }
  }

  function stopRecording() {
    // @ts-ignore
    mediaRecorder?.stop();
    setIsRunning(false);
    mediaRecorder?.stream.getTracks().forEach((track) => track.stop());
  }

  const formattedDate = getCurrentFormattedDate();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTotalSeconds((prevTotalSeconds) => prevTotalSeconds + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (totalSeconds > 8) {
      stopRecording();
      return;
    }
  }, [totalSeconds]);

  function formatTime(time: number): string {
    return time < 10 ? `0${time}` : `${time}`;
  }

  const handleRecordClick = () => {
    if (!isRunning) startRecording();
    else {
      setTitle('Processing...');
      stopRecording();
    }
  };

  return (
    <Container className=" flex flex-col items-center justify-between">
      <TranscribeDialog
        open={isTranscribingOpen}
        onOpenChange={onTranscribingOpenChange}
        onTranscribingConfirm={onTranscribingConfirm}
        loading={transcribeLoading}
        error={transcribeError}
        result={transcribeResult}
      />
      <p className="pt-[25px] text-center  text-xl font-medium text-dark md:pt-[47px] md:text-4xl">
        Speak anything loud and clear!
      </p>
      {/* <blockquote className="mt-6 border-l-2 pl-6 italic md:text-2xl">
        "{title}"
      </blockquote> */}
      <p className="mb-20 mt-4 text-gray-400">{formattedDate}</p>
      <div className="relative mx-auto flex h-[316px] w-[316px] items-center justify-center">
        <div
          className={`recording-box absolute h-full w-full rounded-[50%] p-[12%] pt-[17%] ${
            isRunning ? 'record-animation' : ''
          }`}
        >
          <div
            className="h-full w-full rounded-[50%]"
            style={{ background: 'linear-gradient(#E31C1CD6, #003EB6CC)' }}
          />
        </div>
        <div className="z-50 flex h-fit w-fit flex-col items-center justify-center">
          <h1 className="text-[60px] leading-[114.3%] tracking-[-1.5px] text-light">
            {formatTime(Math.floor(totalSeconds / 60))}:
            {formatTime(totalSeconds % 60)}
          </h1>
        </div>
      </div>
      <div className="mt-10 flex w-fit items-center justify-center gap-[33px] pb-7 md:gap-[77px] ">
        {error ? (
          <Notification title="Error" message={error} variant="error" />
        ) : (
          <button
            onClick={handleRecordClick}
            className="mt-10 h-fit w-fit rounded-[50%] border-[2px]"
            style={{ boxShadow: '0px 0px 8px 5px rgba(0,0,0,0.3)' }}
          >
            {!isRunning ? (
              <Image
                src={'/icons/nonrecording_mic.svg'}
                alt="recording mic"
                width={148}
                height={148}
                className="h-[70px] w-[70px] md:h-[100px] md:w-[100px]"
              />
            ) : (
              <Image
                src={'/icons/recording_mic.svg'}
                alt="recording mic"
                width={148}
                height={148}
                className="h-[70px] w-[70px] animate-pulse transition md:h-[100px] md:w-[100px]"
              />
            )}
          </button>
        )}
      </div>
    </Container>
  );
};

export default RecordVoicePage;

function MissingEnvVars(props: { url: string }) {
  return (
    <div className="rounded-md bg-yellow-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon
            className="h-5 w-5 text-yellow-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Missing Environment Variables
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Set up your{' '}
              <a className="underline" target="_blank" href={props.url}>
                Convex environment variables here
              </a>{' '}
              with API keys from{' '}
              <a
                className="underline"
                target="_blank"
                href="https://api.together.xyz/settings/api-keys"
              >
                Together.ai
              </a>{' '}
              and{' '}
              <a
                className="underline"
                target="_blank"
                href="https://replicate.com/account/api-tokens"
              >
                Replicate
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
