import axios from 'axios';
import NodeCache from 'node-cache';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

interface YouTubeVideoDetails {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

interface YouTubeSearchResult {
  items: YouTubeVideoDetails[];
  nextPageToken?: string;
  totalResults: number;
}

export class YouTubeService {
  private static instance: YouTubeService;
  private readonly apiKey: string = 'AIzaSyDwuEImMc8yqZPZSvsr9-7RB05z_AZc4Z4';
  private readonly cache: NodeCache;
  private readonly apiBaseUrl = 'https://www.googleapis.com/youtube/v3';
  
  // Rate limiting configuration
  private requestCount: number = 0;
  private readonly dailyQuota: number = 10000; // YouTube API daily quota
  private readonly resetTime: Date = new Date();

  private constructor() {
    this.cache = new NodeCache({
      stdTTL: 3600, // 1 hour default TTL
      checkperiod: 600, // Check for expired keys every 10 minutes
      useClones: false
    });

    // Reset quota counter daily
    setInterval(() => {
      const now = new Date();
      if (now.getDate() !== this.resetTime.getDate()) {
        this.requestCount = 0;
        this.resetTime.setTime(now.getTime());
      }
    }, 3600000); // Check every hour
  }

  public static getInstance(): YouTubeService {
    if (!YouTubeService.instance) {
      YouTubeService.instance = new YouTubeService();
    }
    return YouTubeService.instance;
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string>): Promise<T> {
    if (this.requestCount >= this.dailyQuota) {
      throw new Error('Daily API quota exceeded');
    }

    const url = `${this.apiBaseUrl}/${endpoint}`;
    const fullParams = {
      ...params,
      key: this.apiKey
    };

    try {
      const response = await axios.get<T>(url, { params: fullParams });
      this.requestCount++;
      return response.data;
    } catch (error) {
      logger.error('YouTube API error:', error);
      throw new Error('Failed to fetch data from YouTube API');
    }
  }

  public async getVideoDetails(videoId: string): Promise<YouTubeVideoDetails> {
    const cacheKey = `video:${videoId}`;
    const cached = this.cache.get<YouTubeVideoDetails>(cacheKey);

    if (cached) {
      return cached;
    }

    const response = await this.makeRequest<any>('videos', {
      part: 'snippet,contentDetails',
      id: videoId
    });

    if (!response.items || response.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = response.items[0];
    const details: YouTubeVideoDetails = {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      duration: video.contentDetails.duration,
      thumbnail: video.snippet.thumbnails.high.url,
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt
    };

    this.cache.set(cacheKey, details);
    return details;
  }

  public async searchVideos(
    query: string,
    pageToken?: string,
    maxResults: number = 10
  ): Promise<YouTubeSearchResult> {
    const cacheKey = `search:${query}:${pageToken}:${maxResults}`;
    const cached = this.cache.get<YouTubeSearchResult>(cacheKey);

    if (cached) {
      return cached;
    }

    const params: Record<string, string> = {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: maxResults.toString(),
      videoEmbeddable: 'true'
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    const response = await this.makeRequest<any>('search', params);

    const result: YouTubeSearchResult = {
      items: response.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        duration: '' // Duration requires separate video details API call
      })),
      nextPageToken: response.nextPageToken,
      totalResults: response.pageInfo.totalResults
    };

    // Cache for a shorter time since it's a search result
    this.cache.set(cacheKey, result, 1800); // 30 minutes
    return result;
  }

  public async getVideoQueue(videoIds: string[]): Promise<YouTubeVideoDetails[]> {
    const uniqueIds = [...new Set(videoIds)];
    const results: YouTubeVideoDetails[] = [];
    const uncachedIds: string[] = [];

    // Check cache first
    for (const id of uniqueIds) {
      const cached = this.cache.get<YouTubeVideoDetails>(`video:${id}`);
      if (cached) {
        results.push(cached);
      } else {
        uncachedIds.push(id);
      }
    }

    // Fetch uncached videos in batches of 50 (API limit)
    if (uncachedIds.length > 0) {
      for (let i = 0; i < uncachedIds.length; i += 50) {
        const batch = uncachedIds.slice(i, i + 50);
        const response = await this.makeRequest<any>('videos', {
          part: 'snippet,contentDetails',
          id: batch.join(',')
        });

        for (const video of response.items) {
          const details: YouTubeVideoDetails = {
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            duration: video.contentDetails.duration,
            thumbnail: video.snippet.thumbnails.high.url,
            channelTitle: video.snippet.channelTitle,
            publishedAt: video.snippet.publishedAt
          };

          this.cache.set(`video:${video.id}`, details);
          results.push(details);
        }
      }
    }

    // Return in original order
    return videoIds.map(id => 
      results.find(video => video.id === id)!
    );
  }

  // Rate limiter middleware
  public static createRateLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: {
        status: 'error',
        message: 'Too many requests, please try again later'
      }
    });
  }
} 