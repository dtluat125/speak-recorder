'use client';

import Container from '@/components/ui/Container';
import { api } from '@/convex/_generated/api';
import { Preloaded, useAction } from 'convex/react';
import { FunctionReturnType } from 'convex/server';
import Link from 'next/link';
import { useState } from 'react';

export default function DashboardHomePage({
  preloadedNotes,
}: {
  preloadedNotes?: Preloaded<typeof api.notes.getNotes>;
}) {
  // const allNotes = usePreloadedQueryWithAuth(preloadedNotes) || [];
  // const allNotes = [] as any;

  // const [searchQuery, setSearchQuery] = useState('');
  // const [relevantNotes, setRelevantNotes] =
  //   useState<FunctionReturnType<typeof api.notes.getNotes>>();

  // const performMyAction = useAction(api.together.similarNotes);

  // const handleSearch = async (e: any) => {
  //   e.preventDefault();

  //   console.log({ searchQuery });
  //   if (searchQuery === '') {
  //     setRelevantNotes(undefined);
  //   } else {
  //     const scores = await performMyAction({ searchQuery: searchQuery });
  //     const scoreMap: Map<string, number> = new Map();
  //     for (const s of scores) {
  //       scoreMap.set(s.id, s.score);
  //     }
  //     const filteredResults = allNotes.filter(
  //       (note: any) => (scoreMap.get(note._id) ?? 0) > 0.6,
  //     );
  //     setRelevantNotes(filteredResults);
  //   }
  // };

  // const finalNotes = relevantNotes ?? allNotes;

  return (
    <Container
      suppressHydrationWarning={true}
      className="mt-5 min-h-[calc(100vh-240px)] w-full"
    >
      <div className=" w-full py-[23px] md:py-4 lg:py-[25px]">
        <h1 className="text-center text-2xl font-medium text-dark md:text-4xl">
          Practice your pronunciation with TalkieeAI
        </h1>
      </div>
      {/* search bar */}
      {/* <div className="mx-auto mb-10 mt-4 flex h-fit w-[90%] items-center gap-[17px] rounded border border-black bg-white px-[11px] py-[10px] sm:px-[15px] md:mb-[42px] md:w-[623px] md:px-[40px] md:py-[10px]">
        <Image
          src="/icons/search.svg"
          width={27}
          height={26}
          alt="search"
          className="h-5 w-5 md:h-6 md:w-6"
        />
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
            className="w-full text-[16px] outline-none md:text-xl"
          />
        </form>
      </div> */}
      {/* recorded items */}
      {/* <div className="h-fit w-full max-w-[1360px] md:px-5 xl:mx-auto">
        {finalNotes &&
          finalNotes.map((item, index) => (
            <RecordedfileItemCard {...item} key={index} />
          ))}
        {finalNotes.length === 0 && (
          <div className="flex h-[50vh] w-full items-center justify-center">
            <p className="text-center text-2xl text-dark">
              You currently have no <br /> recordings.
            </p>
          </div>
        )}
      </div> */}
      {/* actions button container */}
      <div className="mx-auto mt-[20px] flex h-fit w-full flex-col items-center px-5 pb-10 md:mt-[50px] lg:pb-5">
        <div className="mt-10 flex flex-col gap-6 ">
          <Link
            className="rounded-[7px] bg-dark px-[37px] py-[15px] text-[17px] leading-[79%] tracking-[-0.75px] text-light md:text-2xl"
            style={{ boxShadow: ' 0px 4px 4px 0px rgba(0, 0, 0, 0.25)' }}
            href="/record"
          >
            Pronunciation Coach
          </Link>

          <Link
            className="rounded-[7px] bg-dark px-[37px] py-[15px] text-[17px] leading-[79%] tracking-[-0.75px] text-light md:text-2xl"
            style={{ boxShadow: ' 0px 4px 4px 0px rgba(0, 0, 0, 0.25)' }}
            href="/speaking-topics"
          >
            IELTS Speaking Topics
          </Link>
          {/* {allNotes && (
            <Link
              className="rounded-[7px] px-[37px] py-[15px] text-[17px] leading-[79%] tracking-[-0.75px] md:text-2xl"
              style={{ boxShadow: ' 0px 4px 4px 0px rgba(0, 0, 0, 0.25)' }}
              href="/dashboard/action-items"
            >
              View Action Items
            </Link>
          )} */}
        </div>
      </div>
    </Container>
  );
}
