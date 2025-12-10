import { Howl } from 'howler';
import { useAppStore } from './store';

let currentHowl: Howl | null = null;
let currentSrc: string | null = null;

export const audioManager = {
  load(src: string) {
    // Skip if same source already loaded
    if (currentSrc === src && currentHowl) {
      return;
    }

    // Cleanup previous
    if (currentHowl) {
      currentHowl.unload();
    }

    const store = useAppStore.getState();
    
    currentSrc = src;
    currentHowl = new Howl({
      src: [src],
      html5: true, // Enable HTML5 Audio for streaming (avoids full download)
      autoplay: true,
      volume: store.volume,
      onplay: () => useAppStore.getState().setPlaybackState(true),
      onpause: () => useAppStore.getState().setPlaybackState(false),
      onend: () => {
        useAppStore.getState().setPlaybackState(false);
        useAppStore.getState().setCurrentTime(0);
      },
      onload: () => {
        const dur = currentHowl?.duration() || 0;
        useAppStore.getState().setDuration(dur);
      },
      onloaderror: (id, err) => {
        console.error("Audio Load Error:", err);
        useAppStore.getState().setPlaybackState(false);
      }
    });
  },

  play() {
    currentHowl?.play();
  },

  pause() {
    currentHowl?.pause();
  },

  toggle() {
    if (!currentHowl) return;
    if (currentHowl.playing()) {
      currentHowl.pause();
    } else {
      currentHowl.play();
    }
  },

  seek(time: number) {
    currentHowl?.seek(time);
    useAppStore.getState().setCurrentTime(time);
  },

  setVolume(vol: number) {
    currentHowl?.volume(vol);
    useAppStore.getState().setVolume(vol);
  },

  getCurrentTime(): number {
    if (!currentHowl) return 0;
    const time = currentHowl.seek();
    return typeof time === 'number' ? time : 0;
  },

  getDuration(): number {
    return currentHowl?.duration() || 0;
  },

  isPlaying(): boolean {
    return currentHowl?.playing() || false;
  },

  isLoaded(): boolean {
    return currentHowl !== null && currentSrc !== null;
  },

  unload() {
    currentHowl?.unload();
    currentHowl = null;
    currentSrc = null;
  }
};

// Time update loop
let animationFrame: number | null = null;

export function startTimeUpdater() {
  const update = () => {
    if (currentHowl?.playing()) {
      const time = currentHowl.seek();
      if (typeof time === 'number') {
        useAppStore.getState().setCurrentTime(time);
      }
    }
    animationFrame = requestAnimationFrame(update);
  };
  
  if (!animationFrame) {
    animationFrame = requestAnimationFrame(update);
  }
}

export function stopTimeUpdater() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}

// Auto-start updater
startTimeUpdater();