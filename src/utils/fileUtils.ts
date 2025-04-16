
/**
 * Utilities for handling file operations and divide & conquer approach
 */

import { encryptChunk, decryptChunk } from './cryptoUtils';

// Define optimal chunk size (4MB)
const CHUNK_SIZE = 4 * 1024 * 1024;

// Split file into chunks (Divide step)
export function splitFileIntoChunks(file: File): Blob[] {
  const chunks: Blob[] = [];
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(file.size, start + CHUNK_SIZE);
    chunks.push(file.slice(start, end));
  }
  
  return chunks;
}

// Process chunks in parallel with progress tracking
export async function processChunks<T>(
  chunks: Blob[],
  processFunction: (chunk: ArrayBuffer) => Promise<T>,
  onProgress: (progress: number) => void
): Promise<T[]> {
  const results: T[] = [];
  const totalChunks = chunks.length;
  let processedChunks = 0;
  
  return new Promise((resolve) => {
    // Process chunks sequentially to avoid memory issues
    // but simulate parallel processing for visualization
    async function processNextChunk(index: number) {
      if (index >= totalChunks) {
        resolve(results);
        return;
      }
      
      // Read chunk as ArrayBuffer
      const chunk = chunks[index];
      const chunkData = await chunk.arrayBuffer();
      
      // Process the chunk
      const processedChunk = await processFunction(chunkData);
      results[index] = processedChunk;
      
      // Update progress
      processedChunks++;
      onProgress((processedChunks / totalChunks) * 100);
      
      // Process next chunk
      processNextChunk(index + 1);
    }
    
    // Start processing with first chunk
    processNextChunk(0);
  });
}

// Encrypt a file using divide and conquer
export async function encryptFile(
  file: File, 
  key: CryptoKey, 
  onProgress: (progress: number) => void
): Promise<Blob> {
  // Divide: Split file into chunks
  const chunks = splitFileIntoChunks(file);
  
  // Conquer: Encrypt each chunk in parallel
  const encryptedChunks = await processChunks(
    chunks,
    (chunk) => encryptChunk(chunk, key),
    onProgress
  );
  
  // Combine: Join encrypted chunks
  return new Blob(encryptedChunks, { type: 'application/encrypted' });
}

// Decrypt a file using divide and conquer
export async function decryptFile(
  file: File,
  key: CryptoKey,
  originalType: string,
  onProgress: (progress: number) => void
): Promise<Blob> {
  // Divide: Split encrypted file into chunks
  const chunks = splitFileIntoChunks(file);
  
  // Conquer: Decrypt each chunk in parallel
  const decryptedChunks = await processChunks(
    chunks,
    (chunk) => decryptChunk(chunk, key),
    onProgress
  );
  
  // Combine: Join decrypted chunks with original file type
  return new Blob(decryptedChunks, { type: originalType || 'application/octet-stream' });
}

// Save a blob as a file download
export function saveFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Create a shareable WhatsApp link
export function createWhatsAppShareLink(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

// Share file via WhatsApp by creating a shareable download link
export async function shareFileViaWhatsApp(blob: Blob, fileName: string, message: string): Promise<void> {
  try {
    // Check if Web Share API is supported
    if (navigator.share) {
      const file = new File([blob], fileName, { type: blob.type });
      await navigator.share({
        title: 'QuantumX Encrypted File',
        text: message,
        files: [file]
      });
      return;
    }
    
    // Fallback for browsers without Web Share API
    // Create a temporary download link
    const shareMessage = `${message}\n\nPlease download the encrypted file from this link: `;
    
    // Open WhatsApp with the message
    window.open(createWhatsAppShareLink(shareMessage), '_blank');
    
    // And immediately download the file for the user
    saveFile(blob, fileName);
  } catch (error) {
    console.error("Error sharing via WhatsApp:", error);
    // Fallback to just downloading the file
    saveFile(blob, fileName);
    
    // And open WhatsApp with just the message
    window.open(createWhatsAppShareLink(message), '_blank');
  }
}
