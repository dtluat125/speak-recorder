'use client';

import AudioPlayer from '@/components/pages/recording/AudioPlayer';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { cn, formatTimestamp, getAudioFromIndexedDB } from '@/lib/utils';
import { useMutation } from 'convex/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

export default function RecordingDesktop({
  note,
  actionItems,
}: {
  note: Doc<'notes'>;
  actionItems: Doc<'actionItems'>[];
}) {
  const {
    generatingActionItems,
    generatingTitle,
    summary,
    transcription,
    title,
    _creationTime,
  } = note;
  const [originalIsOpen, setOriginalIsOpen] = useState<boolean>(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mutateActionItems = useMutation(api.notes.removeActionItem);
  const hasActionItems = actionItems?.length > 0;

  function removeActionItem(actionId: any) {
    // Trigger a mutation to remove the item from the list
    mutateActionItems({ id: actionId });
  }

  useEffect(() => {
    // Fetch audio from IndexedDB when the component mounts
    const fetchAudio = async () => {
      try {
        const audioFileId = localStorage.getItem('audioFileId');
        const audioBlob = await getAudioFromIndexedDB(audioFileId || ''); // Replace with the actual audio file ID
        if (audioBlob) {
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
        }
      } catch (error) {
        console.error('Error fetching audio from IndexedDB:', error);
      }
    };

    fetchAudio();
  }, []);

  return (
    <div className="hidden md:block">
      <div className="max-width mt-5 flex items-center justify-between">
        <div />
        <h1
          className={`leading text-center text-xl font-medium leading-[114.3%] tracking-[-0.75px] text-dark md:text-[35px] lg:text-[43px] ${
            generatingTitle && 'animate-pulse'
          }`}
        >
          {generatingTitle ? 'Generating Title...' : title ?? 'Your Note'}
        </h1>
        <div className="flex items-center justify-center">
          {/* <p className="text-lg opacity-80">
            {formatTimestamp(Number(_creationTime))}
          </p> */}
        </div>
      </div>
      <div className="mt-[18px] grid h-fit w-full grid-cols-1 px-[30px] py-[19px] lg:px-[45px]">
        {audioUrl && (
          <div className="mb-6 flex justify-center">
            <AudioPlayer src={audioUrl} />
          </div>
        )}

        <div
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
        </div>
        {hasActionItems && (
          <div className="text-center">
            <h1 className="text-xl leading-[114.3%] tracking-[-0.75px] text-dark lg:text-2xl xl:text-[30px]">
              Action Items
            </h1>
          </div>
        )}
      </div>
      <div className="grid h-full w-full grid-cols-1 px-[30px] lg:px-[45px]">
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
        {hasActionItems && (
          <div className="relative mx-auto mt-[27px] w-full max-w-[900px] px-5 md:mt-[45px]">
            {generatingActionItems
              ? [0, 1, 3].map((item: any, idx: number) => (
                  <div
                    className="animate-pulse border-[#00000033] py-1 md:border-t-[1px] md:py-2"
                    key={idx}
                  >
                    <div className="flex w-full justify-center">
                      <div className="group w-full items-center rounded p-2 text-lg font-[300] text-dark transition-colors duration-300 checked:text-gray-300 hover:bg-gray-100 md:text-2xl">
                        <div className="flex items-center">
                          <input
                            disabled
                            type="checkbox"
                            checked={false}
                            className="mr-4 h-5 w-5 cursor-pointer rounded-sm border-2 border-gray-300"
                          />
                          <label className="h-5 w-full rounded-full bg-gray-200" />
                        </div>
                        <div className="flex justify-between md:mt-2">
                          <p className="ml-9 text-[15px] font-[300] leading-[249%] tracking-[-0.6px] text-dark opacity-60 md:inline-block md:text-xl lg:text-xl">
                            {new Date(
                              Number(_creationTime),
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              : actionItems?.map((item: any, idx: number) => (
                  <div
                    className="border-[#00000033] py-1 md:border-t-[1px] md:py-2"
                    key={idx}
                  >
                    <div className="flex w-full justify-center">
                      <div className="group w-full items-center rounded p-2 text-lg font-[300] text-dark transition-colors duration-300 checked:text-gray-300 hover:bg-gray-100 md:text-2xl">
                        <div className="flex items-center">
                          <input
                            onChange={(e) => {
                              if (e.target.checked) {
                                removeActionItem(item._id);
                                toast.success('1 task completed.');
                              }
                            }}
                            type="checkbox"
                            checked={false}
                            className="mr-4 h-5 w-5 cursor-pointer rounded-sm border-2 border-gray-300"
                          />
                          <label className="">{item?.task}</label>
                        </div>
                        <div className="flex justify-between md:mt-2">
                          <p className="ml-9 text-[15px] font-[300] leading-[249%] tracking-[-0.6px] text-dark opacity-60 md:inline-block md:text-xl lg:text-xl">
                            {new Date(
                              Number(_creationTime),
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center justify-center">
              <Link
                className="rounded-[7px] bg-dark px-5 py-[15px] text-[17px] leading-[79%] tracking-[-0.75px] text-light md:text-xl lg:px-[37px]"
                style={{ boxShadow: ' 0px 4px 4px 0px rgba(0, 0, 0, 0.25)' }}
                href="/dashboard/action-items"
              >
                View All Action Items
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
