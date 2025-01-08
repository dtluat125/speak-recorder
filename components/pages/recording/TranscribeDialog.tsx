import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn, getAudioFromIndexedDB } from '@/lib/utils';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { TranscribeResponse, useTranscribe } from '@/hooks/use-transcribe';
import { Loader2 } from 'lucide-react';
import { debounce } from 'lodash';

interface TranscribeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTranscribingConfirm: (transcript: string) => void;
  loading?: boolean | null;
  error?: string | null;
  result?: TranscribeResponse | null;
}

export default function TranscribeDialog({
  open,
  onOpenChange,
  onTranscribingConfirm,
  loading,
  error,
  result,
}: TranscribeDialogProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const onSubmit = (transcript: string) => {
    onTranscribingConfirm(transcript);
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Transcript</DialogTitle>
            <DialogDescription>
              Confirm the transcript before continuing.
            </DialogDescription>
          </DialogHeader>
          <UpdateTranscription
            handleSubmit={onSubmit}
            loading={loading}
            error={error}
            result={result}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Transcript</DrawerTitle>
          <DrawerDescription>
            Confirm the transcript before continuing.
          </DrawerDescription>
        </DrawerHeader>
        <UpdateTranscription
          className="px-4"
          handleSubmit={onSubmit}
          loading={loading}
          error={error}
          result={result}
        />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Try again</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function UpdateTranscription({
  className,
  loading: transcribeLoading,
  error: transcribeError,
  result: transcribeResult,
  handleSubmit,
}: React.ComponentProps<'form'> & {
  result?: TranscribeResponse | null;
  loading?: boolean | null;
  error?: string | null;
  handleSubmit?: (transcription: string) => void;
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [transcription, setTranscription] = React.useState('');

  React.useEffect(() => {
    if (!transcribeResult) return;
    setTranscription(transcribeResult.transcript);
  }, [transcribeResult]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit?.(transcription);
      }}
      className={cn('grid items-start gap-4', className)}
    >
      {transcribeLoading ? (
        <div className="flex animate-pulse gap-2">
          Your audio is being transcribed...
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-12 items-center gap-2">
          <div className="col-span-9">
            {isEditing ? (
              <Input
                type="text"
                id="transcription"
                defaultValue="shadcn@example.com"
                value={transcription}
                onChange={(event) => setTranscription(event.target.value)}
              />
            ) : (
              <div className="flex-1">
                {transcription ? (
                  <span className="break-all">"{transcription}"</span>
                ) : (
                  <div className="flex items-center gap-2 text-red-500">
                    <ExclamationTriangleIcon />
                    <span className="">
                      {transcribeError || 'Transcript not available'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="col-span-3">
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                if (isEditing) {
                  setTranscription(transcribeResult?.transcript || '');
                }
                setIsEditing((prev) => !prev);
              }}
            >
              {isEditing ? 'Cancel' : 'Update'}
            </Button>
          </div>
        </div>
      )}
      <Button type="submit" disabled={!transcription}>
        Confirm
      </Button>
    </form>
  );
}
