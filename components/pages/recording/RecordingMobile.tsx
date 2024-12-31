import AudioPlayer from '@/components/pages/recording/AudioPlayer';
import { buttonVariants } from '@/components/ui/button';
import { routes } from '@/features/common/constants';
import { Note, PredictResponse } from '@/features/recording/types';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Toaster } from 'react-hot-toast';

export default function RecordingMobile({ note }: { note: Note }) {
  const { summary, transcription, title, _creationTime, audioFileUrl, result } =
    note || {};
  const [transcriptOpen, setTranscriptOpen] = useState<boolean>(true);
  const [summaryOpen, setSummaryOpen] = useState<boolean>(false);

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

  return (
    <div className="md:hidden">
      <div className="my-5 flex flex-col justify-center gap-4">
        <h2 className="leading text-[24px] font-medium leading-[114.3%] tracking-[-0.75px] text-dark md:text-[35px] lg:text-[43px]">
          {gradedTitle ?? 'Your Note'}
        </h2>
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
