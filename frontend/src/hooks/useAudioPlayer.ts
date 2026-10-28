import { useState, useRef, useCallback, useEffect } from 'react';

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(16).fill(0));
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      audioContextRef.current = ctx;
      analyserRef.current = analyser;
    }
  };

  const playAudioBase64 = useCallback((base64String: string, onEnded?: () => void) => {
    try {
      initAudioContext();
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }

      // Stop any existing playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(base64String);
      audioRef.current = audio;

      // Connect to analyser if supported
      try {
        if (audioContextRef.current && analyserRef.current) {
          const source = audioContextRef.current.createMediaElementSource(audio);
          source.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
        }
      } catch (e) {
        // Source already connected or CORS
      }

      audio.onplay = () => {
        setIsPlaying(true);
        startVisualizer();
      };

      audio.onended = () => {
        setIsPlaying(false);
        stopVisualizer();
        if (onEnded) onEnded();
      };

      audio.onerror = (e) => {
        console.warn('Audio playback error:', e);
        setIsPlaying(false);
        stopVisualizer();
        if (onEnded) onEnded();
      };

      audio.play().catch((err) => {
        console.warn('Autoplay blocked or playback interrupted:', err);
        setIsPlaying(false);
      });
    } catch (err) {
      console.error('Audio init error:', err);
      setIsPlaying(false);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      stopVisualizer();
    }
  }, []);

  const startVisualizer = () => {
    const update = () => {
      if (analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Sample down to 16 bars
        const step = Math.floor(bufferLength / 16) || 1;
        const sampled = [];
        for (let i = 0; i < 16; i++) {
          sampled.push((dataArray[i * step] || 0) / 255);
        }
        setFrequencyData(sampled);
      }
      animFrameRef.current = requestAnimationFrame(update);
    };
    animFrameRef.current = requestAnimationFrame(update);
  };

  const stopVisualizer = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setFrequencyData(new Array(16).fill(0));
  };

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [stopAudio]);

  return {
    isPlaying,
    frequencyData,
    playAudioBase64,
    stopAudio,
  };
}
