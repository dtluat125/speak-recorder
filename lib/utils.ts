import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
