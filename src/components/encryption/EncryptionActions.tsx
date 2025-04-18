
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Share2, Download } from 'lucide-react';

interface EncryptionActionsProps {
  onEncrypt: () => void;
  onDownload: () => void;
  onShare: () => void;
  isProcessing: boolean;
  canEncrypt: boolean;
  hasEncryptedFile: boolean;
}

export function EncryptionActions({
  onEncrypt,
  onDownload,
  onShare,
  isProcessing,
  canEncrypt,
  hasEncryptedFile
}: EncryptionActionsProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3">
      <Button 
        onClick={onEncrypt} 
        disabled={!canEncrypt || isProcessing}
        className="flex-1 bg-black hover:bg-black/80"
      >
        <Lock className="mr-2 h-4 w-4" />
        {isProcessing ? 'Encrypting...' : 'Encrypt File'}
      </Button>
      
      {hasEncryptedFile && (
        <>
          <Button 
            variant="outline" 
            onClick={onDownload} 
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Encrypted
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={onShare} 
            className="flex-1"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share via WhatsApp
          </Button>
        </>
      )}
    </div>
  );
}
