
import React, { useState } from 'react';
import { Unlock, Download, FileDigit } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { ProgressBar } from './ProgressBar';
import { FileChunkVisualizer } from './FileChunkVisualizer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { generateKey, hashPassword } from '@/utils/cryptoUtils';
import { decryptFile, saveFile, METADATA_SEPARATOR } from '@/utils/fileUtils';
import { useToast } from '@/components/ui/use-toast';

interface DecryptionFormProps {
  className?: string;
}

export function DecryptionForm({ className }: DecryptionFormProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [decryptedFile, setDecryptedFile] = useState<Blob | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const [totalChunks, setTotalChunks] = useState(0);
  const [processedChunks, setProcessedChunks] = useState(0);
  const [metadata, setMetadata] = useState<any>(null);
  const [fileContent, setFileContent] = useState<ArrayBuffer | null>(null);

  const handleFileSelected = async (selectedFile: File) => {
    setFile(selectedFile);
    
    // Estimate total chunks
    const chunkSize = 4 * 1024 * 1024; // 4MB
    setTotalChunks(Math.ceil(selectedFile.size / chunkSize));
    
    // Read file content
    try {
      const fileBuffer = await selectedFile.arrayBuffer();
      setFileContent(fileBuffer);
      
      // Convert to text to find metadata
      const fileReader = new FileReader();
      
      fileReader.onload = (e) => {
        if (e.target?.result) {
          const content = e.target.result.toString();
          
          // Look for our unique separator
          const separatorIndex = content.indexOf(METADATA_SEPARATOR);
          
          if (separatorIndex !== -1) {
            try {
              const metadataText = content.substring(0, separatorIndex);
              const parsedMetadata = JSON.parse(metadataText);
              
              console.log("Found metadata:", parsedMetadata);
              
              if (parsedMetadata.appIdentifier === "QuantumX-Encryption-v1" || 
                  parsedMetadata.fileName) {
                setMetadata(parsedMetadata);
                setOriginalFileName(parsedMetadata.fileName || 'decrypted-file');
              } else {
                console.error("Invalid file format: Missing QuantumX identifier");
              }
            } catch (e) {
              console.error("Error parsing metadata JSON:", e);
            }
          } else {
            console.log("Separator not found in file preview");
          }
        }
      };
      
      // Read just the first part of the file to find metadata
      const firstChunk = selectedFile.slice(0, 4096);
      fileReader.readAsText(firstChunk);
      
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleProgressUpdate = (currentProgress: number) => {
    setProgress(currentProgress);
    setProcessedChunks(Math.floor((currentProgress / 100) * totalChunks));
  };

  const handleDecrypt = async () => {
    if (!file || !fileContent) {
      toast({
        title: "No file selected",
        description: "Please select an encrypted file",
        variant: "destructive"
      });
      return;
    }

    if (!password) {
      toast({
        title: "Password required",
        description: "Please enter the decryption password",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Convert file content to text to look for metadata and separator
      const textDecoder = new TextDecoder('utf-8');
      const fileText = textDecoder.decode(fileContent.slice(0, 4096)); // Read the start of the file
      
      // Look for the separator
      const separatorIndex = fileText.indexOf(METADATA_SEPARATOR);
      
      if (separatorIndex === -1) {
        throw new Error('Invalid encrypted file format: Missing QuantumX separator');
      }
      
      // Extract and parse metadata
      const metadataText = fileText.substring(0, separatorIndex);
      let parsedMetadata;
      
      try {
        parsedMetadata = JSON.parse(metadataText);
      } catch (e) {
        throw new Error('Invalid metadata format in encrypted file');
      }
      
      // Check if this is a QuantumX encrypted file
      if (!parsedMetadata.fileName && !parsedMetadata.appIdentifier) {
        throw new Error('This file was not encrypted with QuantumX');
      }
      
      setMetadata(parsedMetadata);
      setOriginalFileName(parsedMetadata.fileName || 'decrypted-file');
      
      // Generate decryption key
      const key = await generateKey(password);
      
      // Verify password hash if available in metadata
      if (parsedMetadata && parsedMetadata.passwordHash) {
        const inputPasswordHash = await hashPassword(password);
        if (parsedMetadata.passwordHash !== inputPasswordHash) {
          toast({
            title: "Incorrect password",
            description: "The password you entered is incorrect",
            variant: "destructive"
          });
          setIsProcessing(false);
          return;
        }
      }
      
      // Extract the encrypted portion (skip metadata and separator)
      // Fix: Use TextEncoder to get the byte length, not to encode the text that's already encoded
      const textEncoder = new TextEncoder();
      const metadataBytes = textEncoder.encode(metadataText + METADATA_SEPARATOR);
      const metadataPlusDelimiter = metadataBytes.length;
      
      // Create a new file from the encrypted portion to handle it properly
      const encryptedPortion = file.slice(metadataPlusDelimiter);
      const encryptedFile = new File([encryptedPortion], 'encrypted-portion', { 
        type: 'application/octet-stream' 
      });
      
      // Decrypt the file
      const decrypted = await decryptFile(
        encryptedFile,
        key,
        parsedMetadata?.fileType || '',
        handleProgressUpdate
      );
      
      setDecryptedFile(decrypted);
      
      toast({
        title: "Decryption completed",
        description: "Your file has been decrypted successfully",
      });
    } catch (error) {
      console.error('Decryption error:', error);
      toast({
        title: "Decryption failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (decryptedFile) {
      saveFile(decryptedFile, originalFileName || 'decrypted-file');
    }
  };

  return (
    <motion.div
      className={cn("w-full", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card className="p-6">
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Decrypt File</h2>
            <p className="text-muted-foreground">
              Decrypt files that were encrypted with QuantumX using the correct password.
            </p>
          </div>
          
          <FileUpload 
            onFileSelected={handleFileSelected} 
            accept=".encrypted,application/encrypted"
            className="mt-2"
          />
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="decrypt-password">Password</Label>
            <Input
              id="decrypt-password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              disabled={isProcessing}
              placeholder="Enter decryption password"
            />
          </div>
          
          {metadata && (
            <div className="text-sm bg-secondary p-3 rounded-md">
              <p><strong>File Info:</strong> {metadata.fileName}</p>
              <p><strong>Size:</strong> {(metadata.fileSize / 1024).toFixed(1)} KB</p>
              <p><strong>Encrypted:</strong> {new Date(metadata.encryptionDate).toLocaleDateString()}</p>
            </div>
          )}
          
          {totalChunks > 0 && (
            <FileChunkVisualizer
              totalChunks={totalChunks}
              processedChunks={processedChunks}
              isProcessing={isProcessing}
              isEncryption={false}
            />
          )}
          
          {isProcessing && (
            <ProgressBar progress={progress} />
          )}
          
          <div className="flex flex-col md:flex-row gap-3">
            <Button 
              variant="secondary"
              onClick={handleDecrypt} 
              disabled={!file || !password || isProcessing}
              className="flex-1"
            >
              <Unlock className="mr-2 h-4 w-4" />
              {isProcessing ? 'Decrypting...' : 'Decrypt File'}
            </Button>
            
            {decryptedFile && (
              <Button 
                onClick={handleDownload} 
                className="flex-1 bg-black hover:bg-black/80"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Decrypted
              </Button>
            )}
          </div>
          
          {decryptedFile && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <FileDigit className="h-5 w-5 text-black dark:text-white" />
              <span className="text-sm">
                Original file: <strong>{originalFileName}</strong> is ready for download
              </span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
