/**
 * Web Audio API synthesizer for reminder alerts.
 * Generates clear, high-fidelity chimes without needing external audio files.
 */
export function playReminderChime() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    const playTone = (freq: number, startTime: number, duration: number, volume = 0.25) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Smooth attack and decay envelope
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    // Pleasant dual-chime harmonic: D5 -> F#5 -> A5 (D major triad)
    playTone(587.33, now, 0.35, 0.2);
    playTone(739.99, now + 0.12, 0.35, 0.25);
    playTone(880.00, now + 0.25, 0.65, 0.3);
    
    // Repeat for urgency after 700ms
    setTimeout(() => {
      try {
        const now2 = ctx.currentTime;
        playTone(587.33, now2, 0.35, 0.2);
        playTone(739.99, now2 + 0.12, 0.35, 0.25);
        playTone(880.00, now2 + 0.25, 0.75, 0.35);
      } catch {}
    }, 700);

  } catch (err) {
    console.warn('Unable to play reminder audio chime:', err);
  }
}

/**
 * Request browser push notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    try {
      const res = await Notification.requestPermission();
      return res === 'granted';
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Dispatch desktop / mobile browser system notification
 */
export function sendDesktopNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: '/globe.svg',
        tag: 'medicine-reminder',
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (err) {
      console.warn('Failed to dispatch system notification:', err);
    }
  }
}
