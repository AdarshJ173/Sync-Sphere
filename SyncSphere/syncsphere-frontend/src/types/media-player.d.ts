declare module 'media-player-types' {
  export interface SpotifyPlayer {
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

  export interface SpotifySDK {
    Player: {
      new (config: {
        name: string;
        getOAuthToken(cb: (token: string) => void): void;
      }): SpotifyPlayer;
    };
  }

  export interface MediaQuality {
    label: string;
    value: string;
  }

  export interface BufferingState {
    buffering: boolean;
    buffered: number[];
    loaded: number;
  }

  export interface MediaError {
    code: number;
    message: string;
  }

  export interface PlatformState {
    url?: string;
    title?: string;
    embedUrl?: string;
    timestamp: number;
    type?: string;
    id?: string;
    progress?: number;
    volume?: number;
    isPlaying?: boolean;
    time?: number;
  }
} 