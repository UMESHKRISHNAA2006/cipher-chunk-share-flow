
import React, { useState } from 'react';
import { Lock, Share2, Download } from 'lucide-react';
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
import { encryptFile, saveFile, shareFileViaWhatsApp, METADATA_SEPARATOR } from '@/utils/fileUtils';
import { useToast } from '@/components/ui/use-toast';

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
    // Estimate total chunks
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
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to encrypt",
        variant: "destructive"
      });
      return;
    }

    if (!password) {
      toast({
        title: "Password required",
        description: "Please enter a password",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure passwords match",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Hash the password for verification later
      const passwordHash = await hashPassword(password);
      
      // Generate encryption key
      const key = await generateKey(password);
      
      // Encrypt the file
      const encrypted = await encryptFile(file, key, handleProgressUpdate);
      
      // Create metadata to store with the encrypted file
      const metadata = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        passwordHash,
        encryptionDate: new Date().toISOString(),
        appIdentifier: "QuantumX-Encryption-v1"
      };
      
      // Store metadata with the encrypted file
      const metadataString = JSON.stringify(metadata);
      const metadataBlob = new Blob([metadataString], { type: 'application/json' });
      
      // Add a clear separator that's easy to find
      const separatorBlob = new Blob([METADATA_SEPARATOR], { type: 'text/plain' });
      
      // Combine metadata, separator and encrypted file
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
    
    // Create a WhatsApp share message
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
          
          <div className="grid gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                disabled={isProcessing}
                placeholder="Enter a strong password"
              />
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                disabled={isProcessing}
                placeholder="Confirm your password"
              />
            </div>
          </div>
          
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
          
          <div className="flex flex-col md:flex-row gap-3">
            <Button 
              onClick={handleEncrypt} 
              disabled={!file || !password || password !== confirmPassword || isProcessing}
              className="flex-1 bg-black hover:bg-black/80"
            >
              <Lock className="mr-2 h-4 w-4" />
              {isProcessing ? 'Encrypting...' : 'Encrypt File'}
            </Button>
            
            {encryptedFile && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleDownload} 
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Encrypted
                </Button>
                
                <Button 
                  variant="secondary" 
                  onClick={handleShare} 
                  className="flex-1"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share via WhatsApp
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
