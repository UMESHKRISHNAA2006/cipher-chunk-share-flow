
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUpload } from './FileUpload';
import { ProgressBar } from './ProgressBar';
import { FileChunkVisualizer } from './FileChunkVisualizer';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { generateKey, hashPassword } from '@/utils/cryptoUtils';
import { encryptFile, saveFile, shareFileViaWhatsApp, METADATA_SEPARATOR } from '@/utils/fileUtils';
import { useToast } from '@/components/ui/use-toast';
import { PasswordFields } from './encryption/PasswordFields';
import { EncryptionActions } from './encryption/EncryptionActions';

interface EncryptionFormProps {
  className?: string;
}

export function EncryptionForm({ className }: EncryptionFormProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [encryptedFile, setEncryptedFile] = useState<Blob | null>(null);
  const [totalChunks, setTotalChunks] = useState(0);
  const [processedChunks, setProcessedChunks] = useState(0);

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    const chunkSize = 4 * 1024 * 1024; // 4MB
    setTotalChunks(Math.ceil(selectedFile.size / chunkSize));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleProgressUpdate = (currentProgress: number) => {
    setProgress(currentProgress);
    setProcessedChunks(Math.floor((currentProgress / 100) * totalChunks));
  };

  const handleEncrypt = async () => {
    if (!file || !password || password !== confirmPassword) {
      toast({
        title: !file ? "No file selected" : "Password error",
        description: !file ? "Please select a file to encrypt" : "Please check your password",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      const passwordHash = await hashPassword(password);
      const key = await generateKey(password);
      const encrypted = await encryptFile(file, key, handleProgressUpdate);
      
      const metadata = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        passwordHash,
        encryptionDate: new Date().toISOString(),
        appIdentifier: "QuantumX-Encryption-v1"
      };
      
      const metadataString = JSON.stringify(metadata);
      const metadataBlob = new Blob([metadataString], { type: 'application/json' });
      const separatorBlob = new Blob([METADATA_SEPARATOR], { type: 'text/plain' });
      
      const finalBlob = new Blob([
        metadataBlob, 
        separatorBlob,
        encrypted
      ], { type: 'application/encrypted' });
      
      setEncryptedFile(finalBlob);
      
      toast({
        title: "Encryption completed",
        description: "Your file has been encrypted successfully",
      });
    } catch (error) {
      console.error('Encryption error:', error);
      toast({
        title: "Encryption failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (encryptedFile && file) {
      saveFile(encryptedFile, `${file.name}.encrypted`);
    }
  };

  const handleShare = async () => {
    if (!encryptedFile || !file) return;
    const message = `I've shared an encrypted file with you using QuantumX: ${file.name}. Please use QuantumX to decrypt it.`;
    
    try {
      await shareFileViaWhatsApp(encryptedFile, `${file.name}.encrypted`, message);
      toast({
        title: "Share initiated",
        description: "The encrypted file is being shared via WhatsApp",
      });
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Sharing failed",
        description: "Could not share the file. You can download it instead.",
        variant: "destructive"
      });
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
            <h2 className="text-2xl font-semibold">Encrypt File</h2>
            <p className="text-muted-foreground">
              Securely encrypt your files using AES-256 and divide & conquer algorithm.
            </p>
          </div>
          
          <FileUpload 
            onFileSelected={handleFileSelected} 
            className="mt-2"
          />
          
          <PasswordFields
            password={password}
            confirmPassword={confirmPassword}
            onPasswordChange={handlePasswordChange}
            onConfirmPasswordChange={handleConfirmPasswordChange}
            isProcessing={isProcessing}
          />
          
          {totalChunks > 0 && (
            <FileChunkVisualizer
              totalChunks={totalChunks}
              processedChunks={processedChunks}
              isProcessing={isProcessing}
              isEncryption={true}
            />
          )}
          
          {isProcessing && (
            <ProgressBar progress={progress} />
          )}
          
          <EncryptionActions
            onEncrypt={handleEncrypt}
            onDownload={handleDownload}
            onShare={handleShare}
            isProcessing={isProcessing}
            canEncrypt={!!file && !!password && password === confirmPassword}
            hasEncryptedFile={!!encryptedFile}
          />
        </div>
      </Card>
    </motion.div>
  );
}
