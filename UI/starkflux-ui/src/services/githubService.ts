/**
 * GitHub API service for fetching repository data
 */

/**
 * Repository data interface
 */
export interface RepositoryData {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
}

/**
 * File structure entry interface
 */
export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  url: string;
  html_url: string;
  download_url?: string | null;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Service for interacting with the GitHub API
 */
class GitHubService {
  private baseUrl = 'https://api.github.com';
  
  /**
   * Get cached data or fetch fresh data
   */
  private async getCachedOrFetch<T>(
    cacheKey: string, 
    fetchFunction: () => Promise<T>
  ): Promise<T> {
    const now = Date.now();
    const cachedItem = cache.get(cacheKey);
    
    if (cachedItem && now - cachedItem.timestamp < CACHE_TTL) {
      return cachedItem.data as T;
    }
    
    const data = await fetchFunction();
    cache.set(cacheKey, { data, timestamp: now });
    return data;
  }
  
  /**
   * Fetch repository metadata
   */
  async fetchRepositoryData(owner: string, repo: string): Promise<RepositoryData> {
    const cacheKey = `repo:${owner}/${repo}`;
    
    return this.getCachedOrFetch(cacheKey, async () => {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repository not found');
        } else if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
          throw new Error('GitHub API rate limit exceeded');
        } else {
          throw new Error(`GitHub API error: ${response.statusText}`);
        }
      }
      
      return response.json();
    });
  }

  /**
   * Fetch repository file structure
   */
  async fetchFileStructure(owner: string, repo: string, path: string = ''): Promise<FileEntry[]> {
    const cacheKey = `files:${owner}/${repo}/${path}`;
    
    return this.getCachedOrFetch(cacheKey, async () => {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Path not found');
        } else if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
          throw new Error('GitHub API rate limit exceeded');
        } else {
          throw new Error(`GitHub API error: ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
      // Sort files and directories (directories first, then files, both alphabetically)
      return Array.isArray(data) ? data.sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        return a.type === 'dir' ? -1 : 1;
      }) : [data];
    });
  }

  /**
   * Fetch README content
   */
  async fetchReadmeContent(owner: string, repo: string): Promise<string> {
    const cacheKey = `readme:${owner}/${repo}`;
    
    return this.getCachedOrFetch(cacheKey, async () => {
      try {
        const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/readme`);
        
        if (!response.ok) {
          return ''; // Return empty string if README not found
        }
        
        const data = await response.json();
        
        // Decode base64 content
        if (data.content && data.encoding === 'base64') {
          return atob(data.content.replace(/\n/g, ''));
        }
        
        return '';
      } catch (err) {
        console.error("Error fetching README:", err);
        return '';
      }
    });
  }
}

// Export a singleton instance
export const githubService = new GitHubService(); 