
/**
 * Utilities for handling file operations and divide & conquer approach
 */

import { encryptChunk, decryptChunk } from './cryptoUtils';

// Define optimal chunk size (4MB)
const CHUNK_SIZE = 4 * 1024 * 1024;

// Define metadata separator (using a more unique and reliable separator)
export const METADATA_SEPARATOR = "---QUANTUMX-METADATA-SEPARATOR---";

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

// Share file via WhatsApp by creating a download link
export async function shareFileViaWhatsApp(blob: Blob, fileName: string, message: string): Promise<void> {
  try {
    // Check if Web Share API is supported and can share files
    if (navigator.share && navigator.canShare && blob.size <= 100 * 1024 * 1024) {
      const file = new File([blob], fileName, { type: blob.type });
      const shareData = {
        title: 'QuantumX Encrypted File',
        text: message,
        files: [file]
      };
      
      // Check if the data is shareable
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
    }
    
    // Fallback when Web Share API isn't supported or can't share files
    // First, save the file locally
    saveFile(blob, fileName);
    
    // Then open WhatsApp with the message
    const shareMessage = `${message}\n\nI've shared an encrypted file with you using QuantumX. Please download it from the link I'll send separately.`;
    window.open(createWhatsAppShareLink(shareMessage), '_blank');
    
  } catch (error) {
    console.error("Error sharing via WhatsApp:", error);
    
    // Ultimate fallback - just download and open WhatsApp
    saveFile(blob, fileName);
    const fallbackMessage = `${message}\n\nI've shared an encrypted file with you using QuantumX. Please check it.`;
    window.open(createWhatsAppShareLink(fallbackMessage), '_blank');
  }
}
