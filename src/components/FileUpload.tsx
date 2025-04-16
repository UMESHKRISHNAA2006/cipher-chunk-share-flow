
import React, { useRef, useState } from 'react';
import { Upload, FileUp, File as FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  className?: string;
}

export function FileUpload({
  onFileSelected,
  accept = '*/*',
  className
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      onFileSelected(droppedFile);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      onFileSelected(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center w-full p-6 rounded-xl border-2 border-dashed transition-all duration-300',
        isDragging ? 'border-primary bg-secondary/50' : 'border-gray-300',
        file ? 'bg-secondary/30' : 'bg-transparent',
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleFileDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />
      
      {!file ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-2">
            <Upload strokeWidth={1.5} className="h-8 w-8 text-primary animate-bounce" />
          </div>
          <h3 className="text-lg font-medium">Drag & Drop File</h3>
          <p className="text-sm text-muted-foreground mb-2">or</p>
          <Button 
            onClick={handleButtonClick}
            className="group flex items-center gap-2"
          >
            <FileUp size={18} className="transition-transform group-hover:-translate-y-1" />
            Browse Files
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3 py-2 px-3 w-full">
          <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
            <FileIcon size={24} className="text-primary" />
          </div>
          <div className="flex-1 truncate">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleButtonClick}
          >
            Change
          </Button>
        </div>
      )}
    </div>
  );
}
