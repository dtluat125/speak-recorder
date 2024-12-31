export function mp3ToBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Ensure the file type is MP3
    if (file.type !== 'audio/mpeg') {
      reject(new Error('Invalid file type. Please upload an MP3 file.'));
      return;
    }

    // Read the file as a Blob
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result) {
        // Create a Blob from the file data
        const blob = new Blob([reader.result], { type: 'audio/mpeg' });
        resolve(blob);
      } else {
        reject(new Error('Failed to read the file.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading the file.'));
    };

    reader.readAsArrayBuffer(file);
  });
}
