import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, RefreshCw, SwitchCamera } from 'lucide-react';
import Button from './Button';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Use a ref to track the stream for reliable cleanup independent of state updates
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setError('');

    const constraintsList = [
      // 1. Ideal constraints
      { 
        video: { 
          facingMode: facingMode, 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        } 
      },
      // 2. Fallback: Just facing mode (let browser decide res)
      { 
        video: { 
          facingMode: facingMode 
        } 
      },
      // 3. Fallback: Any video (ignore facing mode if specific one fails, mostly for desktop)
      { 
        video: true 
      }
    ];

    for (const constraints of constraintsList) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = mediaStream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Ensure video plays
          try {
            await videoRef.current.play();
          } catch (e) {
            console.warn("Video play failed (might need user interaction):", e);
          }
        }
        // If we got here, we succeeded
        return; 
      } catch (err: any) {
        console.warn(`Camera attempt failed with constraints:`, constraints, err);
        // Continue to next iteration/fallback
      }
    }

    // If we exit the loop, all attempts failed
    setError('Unable to access camera. Please check permissions or try a different device.');
    
  }, [facingMode, stopCamera]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode, startCamera, stopCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flip horizontally only if using user-facing camera for natural mirror feel
        // AND if we are likely using the front camera (default state)
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(base64);
        stopCamera(); 
      }
    }
  };

  const handleSwitchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 z-50 bg-dark flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-700 aspect-[9/16] md:aspect-video">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <div className="flex gap-4">
              <Button onClick={() => startCamera()} variant="primary">Retry</Button>
              <Button onClick={onCancel} variant="secondary">Close</Button>
            </div>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'transform scale-x-[-1]' : ''}`}
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute top-4 right-4 z-10">
               <button 
                onClick={onCancel}
                className="p-3 rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex justify-between items-center">
               <div className="w-12"></div>

              <button 
                onClick={handleCapture}
                className="p-1 rounded-full border-4 border-white transition-all active:scale-95 shadow-lg group"
              >
                <div className="w-16 h-16 rounded-full bg-white group-hover:bg-slate-200 transition-colors"></div>
              </button>

              <button 
                onClick={handleSwitchCamera}
                className="p-3 rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 transition flex items-center justify-center"
                title="Switch Camera"
              >
                <SwitchCamera size={24} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
