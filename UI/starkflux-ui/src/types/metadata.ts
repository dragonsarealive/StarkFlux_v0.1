/**
 * Component metadata structure for public IPFS storage
 * This metadata is unencrypted and publicly accessible
 */

export interface ComponentAuthor {
  address: string;
  name?: string;
  github?: string;
  twitter?: string;
}

export interface ComponentMetadata {
  version: string; // Metadata version for future compatibility
  component: {
    title: string;
    description: string;
    shortDescription?: string; // Brief one-liner for cards
    author: ComponentAuthor;
    tags: string[];
    category: string;
    screenshots?: string[]; // IPFS CIDs for screenshot images
    documentation?: string; // IPFS CID for README or docs
    repository?: string; // GitHub or other repo URL
    license: string;
    version: string; // Component version
    dependencies?: Record<string, string>;
    features?: string[]; // Key features list
    requirements?: string[]; // System requirements
  };
  encrypted: {
    contentCID: string; // CID of the encrypted component files
    fileCount: number;
    totalSize: string; // Human readable size
    totalSizeBytes: number; // Size in bytes for sorting
  };
  created: string; // ISO timestamp
  updated: string; // ISO timestamp
}

/**
 * Create a new component metadata object
 */
export function createComponentMetadata(
  title: string,
  description: string,
  author: string,
  contentCID: string,
  fileCount: number,
  totalSizeBytes: number,
  additionalData?: Partial<ComponentMetadata['component']>
): ComponentMetadata {
  const now = new Date().toISOString();
  
  return {
    version: '1.0',
    component: {
      title,
      description,
      shortDescription: description.substring(0, 100) + (description.length > 100 ? '...' : ''),
      author: {
        address: author,
        name: additionalData?.author?.name
      },
      tags: additionalData?.tags || [],
      category: additionalData?.category || 'Uncategorized',
      screenshots: additionalData?.screenshots || [],
      documentation: additionalData?.documentation,
      repository: additionalData?.repository,
      license: additionalData?.license || 'MIT',
      version: additionalData?.version || '1.0.0',
      dependencies: additionalData?.dependencies,
      features: additionalData?.features,
      requirements: additionalData?.requirements
    },
    encrypted: {
      contentCID,
      fileCount,
      totalSize: formatFileSize(totalSizeBytes),
      totalSizeBytes
    },
    created: now,
    updated: now
  };
}

/**
 * Format bytes to human readable size
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 