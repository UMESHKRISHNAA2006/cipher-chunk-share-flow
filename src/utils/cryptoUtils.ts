
/**
 * Utilities for handling encryption, decryption, and hashing
 */

// Function to hash a password with SHA-256
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to hex string
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate a key from password for AES-256
export async function generateKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Use PBKDF2 to derive a key
  const salt = encoder.encode('cipher-chunk-share-flow-salt');
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt a chunk of data
export async function encryptChunk(
  chunk: ArrayBuffer,
  key: CryptoKey
): Promise<ArrayBuffer> {
  // Generate a random IV (Initialization Vector)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt the chunk
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    chunk
  );
  
  // Prepend IV to the encrypted data
  const result = new Uint8Array(iv.length + encryptedData.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(encryptedData), iv.length);
  
  return result;
}

// Decrypt a chunk of data
export async function decryptChunk(
  encryptedChunk: ArrayBuffer,
  key: CryptoKey
): Promise<ArrayBuffer> {
  // Extract IV from the beginning of the encrypted data
  const iv = new Uint8Array(encryptedChunk.slice(0, 12));
  const encryptedData = new Uint8Array(encryptedChunk.slice(12));
  
  // Decrypt the chunk
  return crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    encryptedData
  );
}
