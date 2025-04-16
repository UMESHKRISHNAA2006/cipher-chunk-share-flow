
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
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <img 
        src="/lovable-uploads/b45c9e7d-b017-4e9f-9f67-8b2e60edc127.png" 
        alt="QuantumX Logo" 
        className="splash-logo"
        style={{ width: '280px', height: '280px' }} // Increased size for more prominence
      />
      <h1 className="splash-title">QuantumX</h1>
    </div>
  );
}
