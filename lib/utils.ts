import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as lamejs from '@breezystack/lamejs';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCurrentFormattedDate(): string {
  const currentDate = new Date();
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };
  return new Intl.DateTimeFormat('en-US', options).format(currentDate);
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const dateString = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `${dateString} at ${timeString}`;
}

const DB_NAME = 'audioDB';
const STORE_NAME = 'audioFiles';
const DB_VERSION = 1;

export function saveAudioToIndexedDB(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Check if the object store exists
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        return reject(
          new Error(`Object store "${STORE_NAME}" does not exist.`),
        );
      }

      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // Clear the object store to ensure there's only one item
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        const fileId = 'audioFile'; // Use a fixed ID since there's only one item
        const putRequest = store.put({ id: fileId, file: blob });

        putRequest.onsuccess = () => resolve(fileId);
        putRequest.onerror = (error) =>
          reject(`Error saving audio: ${putRequest.error}`);
      };

      clearRequest.onerror = (error) =>
        reject(`Error clearing object store: ${clearRequest.error}`);
    };

    request.onerror = (error) => reject(`Error opening IndexedDB: ${error}`);
  });
}

export function getAudioFromIndexedDB(fileId: string): Promise<Blob | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Check if the object store exists
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        return reject(
          new Error(`Object store "${STORE_NAME}" does not exist.`),
        );
      }

      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const query = store.get(fileId);

      query.onsuccess = () => resolve(query.result?.file || null);

      query.onerror = (error) =>
        reject(`Error retrieving audio: ${query.error}`);
    };

    request.onerror = (error) => reject(`Error opening IndexedDB: ${error}`);
  });
}

// Save the audio file
export function saveAudio(blob: Blob, fileName = 'audio.mp3') {
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);

  // Create an <a> element
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName; // Set the default file name

  // Append the <a> element to the document body and trigger the download
  document.body.appendChild(a);
  a.click();

  // Clean up: Remove the <a> element and revoke the object URL
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function convertWebMToMP3(webmBlob: Blob): Promise<Blob> {
  const audioContext = new AudioContext();

  // Decode the WebM audio data
  const arrayBuffer = await webmBlob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const mp3Encoder = new lamejs.Mp3Encoder(
    audioBuffer.numberOfChannels, // Number of channels (e.g., 1 for mono, 2 for stereo)
    audioBuffer.sampleRate, // Sample rate (e.g., 44100 Hz)
    128, // Bitrate in kbps
  );

  const mp3Data: Uint8Array[] = [];
  const sampleBlockSize = 1152; // Samples per MP3 frame

  // Loop through the audio buffer to encode each chunk
  for (let i = 0; i < audioBuffer.length; i += sampleBlockSize) {
    const leftSamples = audioBuffer
      .getChannelData(0)
      .subarray(i, i + sampleBlockSize);
    const rightSamples =
      audioBuffer.numberOfChannels > 1
        ? audioBuffer.getChannelData(1).subarray(i, i + sampleBlockSize)
        : undefined;

    const mp3Chunk = mp3Encoder.encodeBuffer(
      convertFloat32ToInt16(leftSamples),
      rightSamples ? convertFloat32ToInt16(rightSamples) : undefined,
    );
    mp3Data.push(mp3Chunk);
  }

  // Flush remaining MP3 data
  mp3Data.push(mp3Encoder.flush());

  // Combine all MP3 chunks into a single Blob
  return new Blob(mp3Data, { type: 'audio/mp3' });
}

function convertFloat32ToInt16(buffer: Float32Array): Int16Array {
  const int16Array = new Int16Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    const s = Math.max(-1, Math.min(1, buffer[i])); // Clamp to [-1, 1]
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16Array;
}

export function getAudioMetadata() {
  let audioMetadata;

  const isMimeTypeSupported = (mimeType: string) => {
    return (
      typeof MediaRecorder !== 'undefined' &&
      MediaRecorder.isTypeSupported(mimeType)
    );
  };

  switch (process.env.NEXT_PUBLIC_AUDIO_MIME_TYPE) {
    case 'audio/mp4':
      if (isMimeTypeSupported('audio/mp4')) {
        audioMetadata = {
          mimeType: 'audio/mp4',
          extension: 'm4a',
        };
      } else {
        console.warn(
          'audio/mp4 is not supported in this browser. Falling back to audio/webm.',
        );
        audioMetadata = {
          mimeType: 'audio/webm',
          extension: 'webm',
        };
      }
      break;
    case 'audio/mp3':
      if (isMimeTypeSupported('audio/mp3')) {
        audioMetadata = {
          mimeType: 'audio/mp3',
          extension: 'mp3',
        };
      } else {
        console.warn(
          'audio/mp3 is not supported in this browser. Falling back to audio/webm.',
        );
        audioMetadata = {
          mimeType: 'audio/webm',
          extension: 'webm',
        };
      }
      break;
    default:
      if (isMimeTypeSupported('audio/webm')) {
        audioMetadata = {
          mimeType: 'audio/webm',
          extension: 'webm',
        };
      } else {
        console.warn(
          'audio/webm is not supported in this browser. Using default audio/mp3.',
        );
        audioMetadata = {
          mimeType: 'audio/mp3',
          extension: 'mp3',
        };
      }
  }

  return audioMetadata;
}
