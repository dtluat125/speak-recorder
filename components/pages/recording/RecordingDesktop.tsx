'use client';

import AudioPlayer from '@/components/pages/recording/AudioPlayer';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { routes } from '@/features/common/constants';
import { Note } from '@/features/recording/types';
import { cn } from '@/lib/utils';
import { Cross2Icon, Pencil1Icon, UpdateIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export default function RecordingDesktop({
  note,
  reevaluate,
}: {
  note: Note;
  reevaluate: (transcript: string) => void;
}) {
  const {
    generatingTitle,
    summary,
    transcription,
    title,
    _creationTime,
    audioFileUrl,
    result,
  } = note || {};

  const [originalIsOpen, setOriginalIsOpen] = useState<boolean>(true);
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
                    className={`border-b-[6px] ${
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
  }, [result]);

  const originTranscript = useMemo(() => {
    return result?.labels
      ?.map((wordPredict, index) => {
        return wordPredict.word;
      })
      ?.join(' ')
      ?.toLocaleLowerCase();
  }, [result]);

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
    <div className="hidden md:block">
      <div className="mt-5 flex items-center justify-start">
        <div className="flex w-full flex-col gap-5">
          <div
            className={cn(
              'flex w-full flex-wrap items-center gap-4',
              editTranscript ? 'gap-10' : 'gap-4',
            )}
          >
            {editTranscript ? (
              <div className="flex-1">
                <Input
                  className={`leading h-auto text-4xl font-medium leading-[114.3%] tracking-[-0.75px] text-dark${
                    generatingTitle && 'animate-pulse'
                  }`}
                  value={currentTranscript}
                  onChange={(e) => setCurrentTranscript(e.target.value)}
                />
              </div>
            ) : (
              <h2
                className={`leading text-4xl font-medium leading-[114.3%] tracking-[-0.75px] text-dark${
                  generatingTitle && 'animate-pulse'
                }`}
              >
                {generatingTitle
                  ? 'Generating Title...'
                  : gradedTitle ?? 'Your Note'}
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
                      <UpdateIcon className="h-7 w-7" />
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
                      <Cross2Icon className="h-7 w-7" />
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
                    <Pencil1Icon className="h-7 w-7" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Not what you've just said? Update and reevaluate</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <div
            className={`leading flex text-sm font-medium leading-[114.3%] tracking-[-0.75px] text-dark md:text-base lg:text-lg ${
              generatingTitle && 'animate-pulse'
            }`}
          >
            <span>/</span>
            {gradedPhonemes}
            <span>/</span>
          </div>
        </div>
        <div className="flex items-center justify-center">
          {/* <p className="text-lg opacity-80">
            {formatTimestamp(Number(_creationTime))}
          </p> */}
        </div>
      </div>
      <div className="mt-[18px] grid h-fit w-full grid-cols-1 gap-4 py-[19px] ">
        <p className="text-lg">Your soundtrack:</p>
        {audioFileUrl && (
          <div className="mb-6 flex justify-start ">
            <AudioPlayer src={audioFileUrl} />
          </div>
        )}

        {/* <div
          className={cn(
            'flex w-full items-center justify-center gap-[50px] lg:gap-[70px]',
            // 'border-r',
          )}
        >
          <div className="flex items-center gap-4">
            <button
              className={`text-xl leading-[114.3%] tracking-[-0.6px] text-dark lg:text-2xl ${
                originalIsOpen ? 'opacity-100' : 'opacity-40'
              } transition-all duration-300`}
            >
              Transcript
            </button>
            <div
              onClick={() => setOriginalIsOpen(!originalIsOpen)}
              className="flex h-[20px] w-[36px] cursor-pointer items-center rounded-full bg-dark px-[1px]"
            >
              <div
                className={`h-[18px] w-4 rounded-[50%] bg-light ${
                  originalIsOpen ? 'translate-x-0' : 'translate-x-[18px]'
                } transition-all duration-300`}
              />
            </div>
            <button
              className={`text-xl leading-[114.3%] tracking-[-0.6px] text-dark lg:text-2xl ${
                !originalIsOpen ? 'opacity-100' : 'opacity-40'
              } transition-all duration-300`}
            >
              Summary
            </button>
          </div>
        </div> */}
      </div>
      <div>
        <Link
          className={buttonVariants({ variant: 'default', size: 'lg' })}
          href={routes.record}
        >
          Try again
        </Link>
      </div>
      {/* <div className="grid h-full w-full grid-cols-1 px-[30px] lg:px-[45px]">
        <div
          className={cn(
            'relative w-full px-5 py-3 text-justify text-xl font-[300] leading-[114.3%] tracking-[-0.6px] lg:text-2xl',
            // 'border-r ',
          )}
        >
          {transcription ? (
            <div className="">{originalIsOpen ? transcription : summary}</div>
          ) : (
            // Loading state for transcript
            <ul className="animate-pulse space-y-3">
              <li className="h-6 w-full rounded-full bg-gray-200 dark:bg-gray-700"></li>
              <li className="h-6 w-full rounded-full bg-gray-200 dark:bg-gray-700"></li>
              <li className="h-6 w-full rounded-full bg-gray-200 dark:bg-gray-700"></li>
              <li className="h-6 w-full rounded-full bg-gray-200 dark:bg-gray-700"></li>
              <li className="h-6 w-full rounded-full bg-gray-200 dark:bg-gray-700"></li>
            </ul>
          )}
        </div>
      </div> */}
    </div>
  );
}
