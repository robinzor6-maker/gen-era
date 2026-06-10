import { createContext, useContext, useRef, useState, useCallback, useEffect, ReactNode } from "react";

interface AudioContextValue {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  startAmbient: () => void;
  stopAmbient: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
  playUISound: (type: "click" | "hover" | "open") => void;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const acRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const droneOsc2Ref = useRef<OscillatorNode | null>(null);
  const portalOscRef = useRef<OscillatorNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.35);

  const getAC = useCallback(() => {
    if (!acRef.current) {
      acRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (acRef.current.state === "suspended") {
      acRef.current.resume();
    }
    return acRef.current;
  }, []);

  const startAmbient = useCallback(() => {
    if (isPlaying) return;
    const ac = getAC();

    const master = ac.createGain();
    master.gain.setValueAtTime(isMuted ? 0 : volume, ac.currentTime);
    master.connect(ac.destination);
    gainRef.current = master;

    const droneGain = ac.createGain();
    droneGain.gain.setValueAtTime(0.18, ac.currentTime);
    droneGain.connect(master);
    droneGainRef.current = droneGain;

    const drone = ac.createOscillator();
    drone.type = "sine";
    drone.frequency.setValueAtTime(55, ac.currentTime);
    drone.connect(droneGain);
    drone.start();
    droneOscRef.current = drone;

    const drone2 = ac.createOscillator();
    drone2.type = "triangle";
    drone2.frequency.setValueAtTime(82.4, ac.currentTime);
    const drone2Gain = ac.createGain();
    drone2Gain.gain.setValueAtTime(0.06, ac.currentTime);
    drone2.connect(drone2Gain);
    drone2Gain.connect(master);
    droneOsc2Ref.current = drone2;
    drone2.start();

    const portal = ac.createOscillator();
    portal.type = "sine";
    portal.frequency.setValueAtTime(110, ac.currentTime);
    const portalGain = ac.createGain();
    portalGain.gain.setValueAtTime(0, ac.currentTime);
    const lfo = ac.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.08, ac.currentTime);
    const lfoGain = ac.createGain();
    lfoGain.gain.setValueAtTime(0.04, ac.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(portalGain.gain);
    portalGain.gain.setValueAtTime(0.05, ac.currentTime);
    portal.connect(portalGain);
    portalGain.connect(master);
    lfo.start();
    portal.start();
    portalOscRef.current = portal;

    setIsPlaying(true);
  }, [isPlaying, isMuted, volume, getAC]);

  const stopAmbient = useCallback(() => {
    droneOscRef.current?.stop();
    droneOsc2Ref.current?.stop();
    portalOscRef.current?.stop();
    droneOscRef.current = null;
    droneOsc2Ref.current = null;
    portalOscRef.current = null;
    setIsPlaying(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(m => {
      const next = !m;
      if (gainRef.current && acRef.current) {
        gainRef.current.gain.setTargetAtTime(next ? 0 : volume, acRef.current.currentTime, 0.05);
      }
      return next;
    });
  }, [volume]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (gainRef.current && acRef.current && !isMuted) {
      gainRef.current.gain.setTargetAtTime(v, acRef.current.currentTime, 0.05);
    }
  }, [isMuted]);

  const playUISound = useCallback((type: "click" | "hover" | "open") => {
    if (isMuted) return;
    const ac = getAC();
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.connect(g);
    g.connect(ac.destination);
    if (type === "click") {
      osc.frequency.setValueAtTime(880, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ac.currentTime + 0.1);
      g.gain.setValueAtTime(0.08, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
      osc.start();
      osc.stop(ac.currentTime + 0.12);
    } else if (type === "hover") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(660, ac.currentTime);
      g.gain.setValueAtTime(0.03, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.06);
      osc.start();
      osc.stop(ac.currentTime + 0.06);
    } else {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(330, ac.currentTime);
      osc.frequency.linearRampToValueAtTime(660, ac.currentTime + 0.15);
      g.gain.setValueAtTime(0.06, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);
      osc.start();
      osc.stop(ac.currentTime + 0.2);
    }
  }, [isMuted, getAC]);

  useEffect(() => {
    return () => { stopAmbient(); };
  }, [stopAmbient]);

  return (
    <AudioCtx.Provider value={{ isPlaying, isMuted, volume, startAmbient, stopAmbient, toggleMute, setVolume, playUISound }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used inside AudioProvider");
  return ctx;
}
