// Audio files will be stored in the public/sounds directory
const SOUNDS = {
  incomingCall: '/sounds/incoming-call.mp3',
  newMessage: '/sounds/new-message.mp3'
};

class SoundManager {
  constructor() {
    this.sounds = {};
    this.isMuted = false;
    this.isDevelopment = process.env.NODE_ENV === 'development';
    
    // Only log in development
    if (this.isDevelopment) {
      console.log('Initializing SoundManager with sounds:', SOUNDS);
    }
    this.loadSounds();
  }

  async loadSound(name, path) {
    try {
      const audio = new Audio(path);
      // Wait for the audio to be loaded
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true });
        audio.addEventListener('error', reject, { once: true });
        audio.load();
      });
      
      this.sounds[name] = audio;
      
      if (this.isDevelopment) {
        console.log(`Sound loaded: ${name}`);
      }
    } catch (error) {
      // Only log errors in development
      if (this.isDevelopment) {
        console.error(`Failed to load sound ${name}:`, error);
      }
      // Re-throw the error for proper handling
      throw error;
    }
  }

  async loadSounds() {
    // Preload all sounds
    for (const [key, path] of Object.entries(SOUNDS)) {
      if (this.isDevelopment) {
        console.log(`Loading sound: ${key} from ${path}`);
      }
      await this.loadSound(key, path);
      
      // Set volume (0.0 to 1.0)
      this.sounds[key].volume = 0.5;
    }
  }

  play(name) {
    try {
      const sound = this.sounds[name];
      if (!sound) {
        if (this.isDevelopment) {
          console.warn(`Sound ${name} not found`);
        }
        return null;
      }

      console.log(`Attempting to play sound: ${name}`);
      console.log('Current mute status:', this.isMuted);
      console.log('Available sounds:', Object.keys(this.sounds));
      
      if (this.isMuted) {
        console.log('Sounds are muted, not playing');
        return null;
      }

      // Clone the audio to allow multiple instances
      const soundInstance = sound.cloneNode();
      
      // For incoming calls, loop the sound
      if (name === 'incomingCall') {
        soundInstance.loop = true;
        if (this.isDevelopment) {
          console.log('Setting call sound to loop');
        }
      }

      // Add event listeners to the cloned sound
      soundInstance.addEventListener('playing', () => {
        if (this.isDevelopment) {
          console.log(`Sound started playing: ${name}`);
        }
      });

      soundInstance.addEventListener('ended', () => {
        if (this.isDevelopment) {
          console.log(`Sound ended: ${name}`);
        }
      });

      soundInstance.addEventListener('error', (e) => {
        if (this.isDevelopment) {
          console.error(`Error playing sound ${name}:`, e);
        }
      });

      // Play the sound
      const playPromise = soundInstance.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (this.isDevelopment) {
              console.log(`Sound playing successfully: ${name}`);
            }
          })
          .catch(error => {
            if (this.isDevelopment) {
              console.error(`Error playing sound ${name}:`, error);
            }
          });
      }

      return soundInstance;
    } catch (error) {
      if (this.isDevelopment) {
        console.error(`Error in play(${name}):`, error);
      }
      return null;
    }
  }

  stop(soundInstance) {
    try {
      if (soundInstance) {
        console.log('Stopping sound');
        soundInstance.pause();
        soundInstance.currentTime = 0;
      }
    } catch (error) {
      if (this.isDevelopment) {
        console.error('Error stopping sound:', error);
      }
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    console.log('Mute toggled:', this.isMuted);
    return this.isMuted;
  }

  setVolume(volume) {
    // Ensure volume is between 0 and 1
    const safeVolume = Math.max(0, Math.min(1, volume));
    console.log('Setting volume to:', safeVolume);
    Object.entries(this.sounds).forEach(([key, sound]) => {
      sound.volume = safeVolume;
      console.log(`Volume set for ${key}:`, sound.volume);
    });
  }
}

// Create a singleton instance
const soundManager = new SoundManager();

export default soundManager; 