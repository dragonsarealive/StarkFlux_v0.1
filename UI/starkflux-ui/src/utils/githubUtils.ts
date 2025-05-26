/**
 * Utility functions for GitHub repository URL detection and parsing
 */

/**
 * Check if a URL is a valid GitHub repository URL
 */
export function isGitHubUrl(url: string): boolean {
  if (!url) return false;
  
  // GitHub URL patterns
  const patterns = [
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/,
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\.git\/?$/,
    /^git@github\.com:([^\/]+)\/([^\/]+)\.git\/?$/
  ];
  
  return patterns.some(pattern => pattern.test(url));
}

/**
 * Extract owner and repository name from GitHub URL
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  if (!url) return null;
  
  // GitHub URL patterns with capture groups for owner and repo
  const patterns = [
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/,
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\.git\/?$/,
    /^git@github\.com:([^\/]+)\/([^\/]+)\.git\/?$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1] && match[2]) {
      // Clean up the repo name (remove .git if present)
      const repo = match[2].replace(/\.git$/, '');
      return { owner: match[1], repo };
    }
  }
  
  return null;
} 