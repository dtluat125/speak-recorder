'use client';

import RecordingDesktop from '@/components/pages/recording/RecordingDesktop';
import RecordingMobile from '@/components/pages/recording/RecordingMobile';
import { api } from '@/convex/_generated/api';
import { usePreloadedQueryWithAuth } from '@/lib/hooks';
import { Preloaded } from 'convex/react';

export default function RecordingPage({
  preloadedNote,
}: {
  preloadedNote?: Preloaded<typeof api.notes.getNote>;
}) {
  // const currentNote = usePreloadedQueryWithAuth(preloadedNote);
  const currentNote = {
    note: {
      _id: '1',
      userId: '1',
      audioFileId: '1',
      audioFileUrl: 'https://www.google.com',
      generatingTranscript: false,
      generatingTitle: false,
      generatingActionItems: false,
      transcription: 'This is a test transcription',
      summary: 'This is a test summary',
      _creationTime: 1,
    },
    actionItems: [],
  } as any;
  return (
    <div className="mx-auto max-w-[1500px]">
      {currentNote.note === null ? (
        <div className="mt-10 text-center">
          <h1 className="text-4xl">Note not found</h1>
        </div>
      ) : (
        <>
          <RecordingDesktop {...currentNote} />
          <RecordingMobile {...currentNote} />
        </>
      )}
    </div>
  );
}
