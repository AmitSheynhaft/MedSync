import { useRef, useState, useEffect } from 'react';

export function useCameraStream() {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraMode,  setCameraMode]  = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraMode(false);
    setCameraError(null);
  };

  useEffect(() => {
    if (!cameraMode) return;
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(stream => {
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      })
      .catch(() => {
        if (!cancelled) setCameraError('Camera access denied. Please allow camera permissions.');
      });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setCameraMode(false);
      setCameraError(null);
    };
  }, [cameraMode]);

  const capture = (onFile: (file: File) => void) => {
    if (!videoRef.current || !canvasRef.current) return;
    const { videoWidth: w, videoHeight: h } = videoRef.current;
    canvasRef.current.width  = w;
    canvasRef.current.height = h;
    canvasRef.current.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    stopCamera();
    canvasRef.current.toBlob(blob => {
      if (!blob) return;
      onFile(new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.92);
  };

  return { videoRef, canvasRef, cameraMode, setCameraMode, cameraError, stopCamera, capture };
}
