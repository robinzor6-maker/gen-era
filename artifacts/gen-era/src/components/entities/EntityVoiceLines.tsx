import { useEffect, useRef } from 'react';

interface EntityVoiceLinesProps {
  src?: string;
  play: boolean;
  volume?: number;
  fadeInMs?: number;
  fadeOutMs?: number;
}

export function useEntityAudio({
  src,
  play,
  volume = 0.55,
  fadeInMs = 900,
  fadeOutMs = 600,
}: EntityVoiceLinesProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!src) return;
    const audio = new Audio(src);
    audio.loop  = true;
    audio.volume = 0;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeRef.current) clearInterval(fadeRef.current);

    if (play) {
      audio.play().catch(() => {});
      const target = volume;
      const step   = target / (fadeInMs / 50);
      fadeRef.current = setInterval(() => {
        if (!audioRef.current) return;
        const next = Math.min(audioRef.current.volume + step, target);
        audioRef.current.volume = next;
        if (next >= target) { clearInterval(fadeRef.current!); fadeRef.current = null; }
      }, 50);
    } else {
      const step = (audio.volume || 0.01) / (fadeOutMs / 50);
      fadeRef.current = setInterval(() => {
        if (!audioRef.current) return;
        const next = Math.max(audioRef.current.volume - step, 0);
        audioRef.current.volume = next;
        if (next <= 0) {
          audioRef.current.pause();
          clearInterval(fadeRef.current!);
          fadeRef.current = null;
        }
      }, 50);
    }

    return () => { if (fadeRef.current) clearInterval(fadeRef.current); };
  }, [play, volume, fadeInMs, fadeOutMs]);
}

export default function EntityVoiceLines(props: EntityVoiceLinesProps) {
  useEntityAudio(props);
  return null;
}
