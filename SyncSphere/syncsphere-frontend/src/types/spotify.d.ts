declare namespace Spotify {
  interface Player {
    connect(): Promise<boolean>;
    disconnect(): void;
    addListener(event: string, callback: (state: any) => void): void;
    removeListener(event: string): void;
    getCurrentState(): Promise<any>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    seek(position_ms: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
  }

  interface PlayerConstructor {
    new (options: {
      name: string;
      getOAuthToken(cb: (token: string) => void): void;
    }): Player;
  }
}

interface Window {
  Spotify: {
    Player: Spotify.PlayerConstructor;
  };
  onSpotifyWebPlaybackSDKReady: () => void;
} 