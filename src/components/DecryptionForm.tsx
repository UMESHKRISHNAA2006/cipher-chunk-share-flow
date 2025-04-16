
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
import { decryptFile, saveFile } from '@/utils/fileUtils';
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

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    // Estimate total chunks
    const chunkSize = 4 * 1024 * 1024; // 4MB
    setTotalChunks(Math.ceil(selectedFile.size / chunkSize));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleProgressUpdate = (currentProgress: number) => {
    setProgress(currentProgress);
    setProcessedChunks(Math.floor((currentProgress / 100) * totalChunks));
  };

  const handleDecrypt = async () => {
    if (!file) {
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
      
      // Read the first part of the file to extract metadata
      const metadataChunk = await file.slice(0, 1024).text();
      const separatorIndex = metadataChunk.indexOf('[0,0,0,0]');
      
      if (separatorIndex === -1) {
        throw new Error('Invalid encrypted file format');
      }
      
      // Parse metadata
      const metadataJson = metadataChunk.substring(0, separatorIndex);
      const metadata = JSON.parse(metadataJson);
      setOriginalFileName(metadata.fileName || 'decrypted-file');
      
      // Verify password hash
      const inputPasswordHash = await hashPassword(password);
      if (metadata.passwordHash && metadata.passwordHash !== inputPasswordHash) {
        toast({
          title: "Incorrect password",
          description: "The password you entered is incorrect",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      // Extract the encrypted portion (skip metadata and separator)
      const dataStartIndex = metadataJson.length + 8; // 8 for separator bytes
      const encryptedPortion = file.slice(dataStartIndex);
      
      // Generate decryption key
      const key = await generateKey(password);
      
      // Decrypt the file
      const decrypted = await decryptFile(
        encryptedPortion as File,
        key,
        metadata.fileType || '',
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
              Decrypt files that were encrypted with our tool using the correct password.
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
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Decrypted
              </Button>
            )}
          </div>
          
          {decryptedFile && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <FileDigit className="h-5 w-5 text-primary" />
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
