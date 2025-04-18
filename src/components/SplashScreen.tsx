
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
        src="/lovable-uploads/8bb3dfca-a832-49ca-892b-d332c429129c.png" 
        alt="QuantumX Logo" 
        className="splash-logo"
        style={{ width: '400px', height: '400px' }} // Made significantly larger
      />
      <h1 className="splash-title text-gray-300">QuantumX</h1>
    </div>
  );
}
