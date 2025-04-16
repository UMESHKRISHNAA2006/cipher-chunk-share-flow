
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface FileChunkVisualizerProps {
  totalChunks: number;
  processedChunks: number;
  className?: string;
  isProcessing: boolean;
  isEncryption: boolean;
}

export function FileChunkVisualizer({
  totalChunks,
  processedChunks,
  className,
  isProcessing,
  isEncryption
}: FileChunkVisualizerProps) {
  const [chunks, setChunks] = useState<Array<{ id: number, status: 'pending' | 'processing' | 'completed' }>>([]);
  
  // Generate chunks representation
  useEffect(() => {
    const newChunks = Array.from({ length: totalChunks }, (_, i) => ({
      id: i,
      status: 'pending' as const
    }));
    setChunks(newChunks);
  }, [totalChunks]);
  
  // Update chunk status based on progress
  useEffect(() => {
    if (isProcessing) {
      const updatedChunks = chunks.map((chunk, index) => {
        if (index < processedChunks) {
          return { ...chunk, status: 'completed' as const };
        } else if (index === processedChunks) {
          return { ...chunk, status: 'processing' as const };
        }
        return chunk;
      });
      
      setChunks(updatedChunks);
    }
  }, [processedChunks, isProcessing, chunks]);
  
  return (
    <div className={cn("w-full py-6", className)}>
      <div className="text-sm font-medium mb-3">
        {isProcessing ? (
          <span>
            {isEncryption ? 'Encrypting' : 'Decrypting'} chunks with divide & conquer: {processedChunks}/{totalChunks}
          </span>
        ) : (
          <span>File will be split into {totalChunks} chunks</span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {chunks.map((chunk) => (
          <motion.div
            key={chunk.id}
            className={cn(
              "h-6 w-12 rounded transition-colors",
              chunk.status === 'pending' && "bg-muted",
              chunk.status === 'processing' && "bg-amber-500",
              chunk.status === 'completed' && (isEncryption ? "bg-blue-500" : "bg-green-500")
            )}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ 
              scale: chunk.status === 'processing' ? 1.1 : 1,
              opacity: chunk.status === 'pending' ? 0.5 : 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 10
            }}
          />
        ))}
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>Divide</span>
        <span>Process</span>
        <span>Combine</span>
      </div>
      
      {isProcessing && (
        <motion.div 
          className="h-0.5 bg-primary mt-2"
          initial={{ width: '0%' }}
          animate={{ width: `${(processedChunks / totalChunks) * 100}%` }}
          transition={{ ease: 'easeOut' }}
        />
      )}
    </div>
  );
}
