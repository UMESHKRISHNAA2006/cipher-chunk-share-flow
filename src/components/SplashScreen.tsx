
import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);
  
  useEffect(() => {
    // After 4 seconds, start fade out
    const fadeOutTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4000);
    
    // After 5 seconds total, complete the splash screen
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5000);
    
    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);
  
  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''} bg-[#0A0A0A]`}>
      <img 
        src="/lovable-uploads/a0cf7b14-7a4d-42fb-bd18-cee670fb2dc3.png" 
        alt="QuantumX Logo" 
        className="splash-logo w-64 h-64 md:w-80 md:h-80" 
      />
      <h1 className="splash-title font-bold text-white text-4xl md:text-5xl">QuantumX</h1>
    </div>
  );
}
