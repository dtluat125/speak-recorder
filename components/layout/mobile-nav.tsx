'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  MenuIcon,
  MicIcon,
  BarChartIcon,
  SettingsIcon,
  MessageSquareIcon,
  VolumeIcon,
  ActivityIcon,
  LanguagesIcon as GrammarIcon,
  BookOpenIcon,
  GlobeIcon,
  TrophyIcon,
  UsersIcon,
} from 'lucide-react';

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-background fixed bottom-0 left-0 right-0 border-t md:hidden">
      <div className="grid grid-cols-4">
        <Button
          variant="ghost"
          className="flex flex-col items-center py-2"
          asChild
        >
          <Link href="/practice">
            <MicIcon className="h-5 w-5" />
            <span className="text-xs">Practice</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center py-2"
          asChild
        >
          <Link href="/progress">
            <BarChartIcon className="h-5 w-5" />
            <span className="text-xs">Progress</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="flex flex-col items-center py-2"
          asChild
        >
          <Link href="/settings">
            <SettingsIcon className="h-5 w-5" />
            <span className="text-xs">Settings</span>
          </Link>
        </Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="flex flex-col items-center py-2">
              <MenuIcon className="h-5 w-5" />
              <span className="text-xs">More</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="grid gap-4 py-4">
              <Button
                variant="ghost"
                className="w-full justify-start"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href="/ai-conversation">
                  <MessageSquareIcon className="mr-2 h-4 w-4" />
                  AI Conversation
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href="/pronunciation">
                  <VolumeIcon className="mr-2 h-4 w-4" />
                  Pronunciation Coach
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href="/fluency">
                  <ActivityIcon className="mr-2 h-4 w-4" />
                  Fluency Analyzer
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href="/grammar">
                  <GrammarIcon className="mr-2 h-4 w-4" />
                  Grammar Guru
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href="/vocabulary">
                  <BookOpenIcon className="mr-2 h-4 w-4" />
                  Vocab Booster
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href="/ielts-topics">
                  <GlobeIcon className="mr-2 h-4 w-4" />
                  IELTS Topics
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href="/challenges">
                  <TrophyIcon className="mr-2 h-4 w-4" />
                  Speaking Challenges
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                asChild
                onClick={() => setOpen(false)}
              >
                <Link href="/community">
                  <UsersIcon className="mr-2 h-4 w-4" />
                  Community Practice
                </Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
