import AudioPlayer from '@/components/pages/recording/AudioPlayer';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { routes } from '@/features/common/constants';
import { Note, PredictResponse } from '@/features/recording/types';
import { cn } from '@/lib/utils';
import { Cross2Icon, Pencil1Icon, UpdateIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Toaster } from 'react-hot-toast';

export default function RecordingMobile({
  note,
  reevaluate,
}: {
  note: Note;
  reevaluate: (transcript: string) => void;
}) {
  const { summary, transcription, title, _creationTime, audioFileUrl, result } =
    note || {};

  const [editTranscript, setEditTranscript] = useState<boolean>(false);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');

  const gradedTitle = useMemo(() => {
    return (
      <div className="leading-[150%]">
        {result?.labels?.map((wordPredict, index) => {
          const successClass = 'text-green-500 border-green-500';
          const failClass = 'text-red-500 border-red-500';
          return (
            <span className={wordPredict.details ? successClass : failClass}>
              {wordPredict.details?.map((detail) => (
                <span>
                  <span
                    className={`border-b-[4px] ${
                      detail.label ? successClass : failClass
                    }`}
                  >
                    {detail.word_segment}
                  </span>
                </span>
              ))}
              {index !== result.labels.length - 1 && ' '}
            </span>
          );
        })}
      </div>
    );
  }, [title]);

  const gradedPhonemes = useMemo(() => {
    return (
      <div className="leading-[150%]">
        {result?.labels?.map((wordPredict, index) => {
          const successClass = 'text-green-500';
          const failClass = 'text-red-500';
          return (
            <span className={wordPredict.details ? successClass : failClass}>
              {wordPredict.details?.map((detail) => (
                <span>
                  <span className={detail.label ? successClass : failClass}>
                    {detail.phoneme}
                  </span>
                </span>
              ))}
              {index !== result.labels.length - 1 && ' '}
            </span>
          );
        })}
      </div>
    );
  }, [title]);

  const originTranscript = useMemo(() => {
    return result?.labels
      ?.map((wordPredict, index) => {
        return wordPredict.word;
      })
      ?.join(' ')
      ?.toLocaleLowerCase();
  }, [result]);

  const handleReevaluate = () => {
    setEditTranscript(false);
    reevaluate(currentTranscript);
  };

  const handleCancelEditTranscript = () => {
    setEditTranscript(false);
    setCurrentTranscript(originTranscript);
  };

  useEffect(() => {
    if (originTranscript) {
      setCurrentTranscript(originTranscript);
    }
  }, [originTranscript]);

  return (
    <div className="md:hidden">
      <div className="my-5 flex w-full flex-col justify-center gap-4">
        <div
          className={cn(
            'flex w-full flex-wrap items-center gap-4',
            editTranscript ? 'gap-10' : 'gap-4',
          )}
        >
          {editTranscript ? (
            <div className="flex-1">
              <Input
                className={`leading h-auto text-2xl font-medium leading-[114.3%] tracking-[-0.75px] text-dark`}
                value={currentTranscript}
                onChange={(e) => setCurrentTranscript(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReevaluate()}
              />
            </div>
          ) : (
            <h2 className="leading text-2xl font-medium leading-[114.3%] tracking-[-0.75px] text-dark md:text-[35px] lg:text-[43px]">
              {gradedTitle ?? 'Your Note'}
            </h2>
          )}

          {editTranscript ? (
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="mt-1"
                    onClick={handleReevaluate}
                  >
                    <UpdateIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reevaluate</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="mt-1"
                    onClick={handleCancelEditTranscript}
                  >
                    <Cross2Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cancel</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="mt-3"
                  onClick={() => setEditTranscript(true)}
                >
                  <Pencil1Icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Not what you've just said? Update and reevaluate</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div
          className={`leading flex text-lg font-medium leading-[114.3%] tracking-[-0.75px] text-dark md:text-base lg:text-lg `}
        >
          <span>/</span>
          {gradedPhonemes}
          <span>/</span>
        </div>
      </div>
      {audioFileUrl && (
        <div className="mb-6 flex flex-col justify-start">
          <p>Your soundtrack:</p>
          <AudioPlayer src={audioFileUrl} />
        </div>
      )}
      {/* <div className="grid w-full grid-cols-2 ">
        <button
          onClick={() => (
            setTranscriptOpen(!transcriptOpen), setSummaryOpen(false)
          )}
          className={`py-[12px] text-[17px] leading-[114.3%] tracking-[-0.425px] ${
            transcriptOpen ? 'action-btn-active' : 'action-btn'
          }`}
        >
          Transcript
        </button>
        <button
          onClick={() => (
            setTranscriptOpen(false), setSummaryOpen(!summaryOpen)
          )}
          className={`py-[12px] text-[17px] leading-[114.3%] tracking-[-0.425px] ${
            summaryOpen ? 'action-btn-active' : 'action-btn'
          }`}
        >
          Summary
        </button>
      </div> */}
      <div className="w-full">
        {/* {transcriptOpen && (
          <div className="relative mt-2 w-full px-4 py-3 text-justify font-light">
            <div className="">{transcription}</div>
          </div>
        )}
        {summaryOpen && (
          <div className="relative mt-2 w-full px-4 py-3 text-justify font-light">
            {summary}
          </div>
        )} */}
        <Toaster position="bottom-left" reverseOrder={false} />
      </div>
      <div className="flex justify-start">
        <Link
          className={buttonVariants({ variant: 'default', size: 'lg' })}
          href={routes.record}
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
