
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  animate?: boolean;
}

export function ProgressBar({
  progress,
  className,
  showPercentage = true,
  animate = true,
}: ProgressBarProps) {
  const [displayedProgress, setDisplayedProgress] = useState(0);
  
  useEffect(() => {
    if (!animate) {
      setDisplayedProgress(progress);
      return;
    }
    
    // Animate progress smoothly
    if (progress > displayedProgress) {
      const timeout = setTimeout(() => {
        // Increase by smaller increments as we approach the target
        const increment = Math.max(0.5, (progress - displayedProgress) / 10);
        setDisplayedProgress(prev => Math.min(prev + increment, progress));
      }, 20);
      
      return () => clearTimeout(timeout);
    }
  }, [progress, displayedProgress, animate]);
  
  return (
    <div className={cn("w-full space-y-1", className)}>
      <Progress 
        value={displayedProgress} 
        className="h-2 transition-all" 
      />
      {showPercentage && (
        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground">
            {Math.round(displayedProgress)}%
          </span>
        </div>
      )}
    </div>
  );
}
