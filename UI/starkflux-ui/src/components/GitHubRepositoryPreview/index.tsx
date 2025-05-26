import React, { useState, useEffect } from 'react';
import { Box, Flex, Image, Text, Link, Spinner, Alert, AlertIcon, Button, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from '@chakra-ui/react';
import { githubService, type RepositoryData, type FileEntry } from '../../services/githubService';
import ReactMarkdown from 'react-markdown';
import './styles.css';

interface GitHubRepositoryPreviewProps {
  owner: string;
  repo: string;
}

// File icon mapping based on file extension
const getFileIcon = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const iconMap: {[key: string]: string} = {
    js: '📄 JS',
    jsx: '📄 JSX',
    ts: '📄 TS',
    tsx: '📄 TSX',
    py: '🐍 PY',
    rb: '💎 RB',
    json: '📋 JSON',
    md: '📝 MD',
    txt: '📄 TXT',
    css: '🎨 CSS',
    scss: '🎨 SCSS',
    html: '🌐 HTML',
    svg: '🖼️ SVG',
    png: '🖼️ PNG',
    jpg: '🖼️ JPG',
    jpeg: '🖼️ JPG',
    gif: '🖼️ GIF',
    pdf: '📑 PDF',
    go: '🐹 GO',
    rs: '🦀 RS',
    c: '📄 C',
    cpp: '📄 C++',
    h: '📄 H',
    hpp: '📄 HPP',
    java: '☕ JAVA',
    kt: '📄 KT',
    scala: '📄 SCALA',
    php: '🐘 PHP',
    sh: '📜 SH',
    bat: '📜 BAT',
    yml: '⚙️ YML',
    yaml: '⚙️ YAML',
    toml: '⚙️ TOML',
    cairo: '🔺 CAIRO',
  };
  
  return extension && iconMap[extension] ? iconMap[extension] : '📄';
};

/**
 * Component to display a preview of a GitHub repository
 */
export const GitHubRepositoryPreview: React.FC<GitHubRepositoryPreviewProps> = ({ 
  owner, 
  repo 
}) => {
  const [loading, setLoading] = useState(true);
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repoData, setRepoData] = useState<RepositoryData | null>(null);
  const [fileData, setFileData] = useState<FileEntry[]>([]);
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [showFiles, setShowFiles] = useState(false);
  
  // Add state for README expansion
  const [isReadmeExpanded, setIsReadmeExpanded] = useState(false);
  
  // Toggle README expansion
  const toggleReadmeExpansion = () => {
    setIsReadmeExpanded(!isReadmeExpanded);
  };
  
  // Fetch repository data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch repository metadata
        const data = await githubService.fetchRepositoryData(owner, repo);
        setRepoData(data);

        // Fetch README content
        const readme = await githubService.fetchReadmeContent(owner, repo);
        setReadmeContent(readme);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    if (owner && repo) {
      fetchData();
    }
  }, [owner, repo]);
  
  // Fetch file structure when "Show Files" is clicked
  const handleShowFiles = async () => {
    if (fileData.length > 0) {
      // Toggle display if already loaded
      setShowFiles(!showFiles);
      return;
    }
    
    try {
      setFileLoading(true);
      setError(null);
      
      // Fetch file structure
      const files = await githubService.fetchFileStructure(owner, repo);
      setFileData(files);
      setShowFiles(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setFileLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Box className="github-preview github-preview--loading">
        <Flex justifyContent="center" alignItems="center" p={4}>
          <Spinner size="md" color="blue.500" mr={2} />
          <Text>Loading repository...</Text>
        </Flex>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box className="github-preview github-preview--error">
        <Alert status="error" variant="left-accent">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }
  
  if (!repoData) {
    return null;
  }
  
  return (
    <Box className="github-preview">
      <Flex className="github-preview__header" justify="space-between" align="center" p={4} borderBottom="1px solid" borderColor="gray.600" bg="#1A202C">
        <Flex className="github-preview__title" align="center">
          <Image 
            src={repoData.owner.avatar_url} 
            alt={`${repoData.owner.login}'s avatar`} 
            className="github-preview__avatar"
            boxSize="24px"
            borderRadius="full"
            mr={2}
          />
          <Text fontWeight="bold">{repoData.full_name}</Text>
        </Flex>
        
        <Flex className="github-preview__stats" align="center">
          <Text fontSize="sm" mr={3}>
            ⭐ {repoData.stargazers_count.toLocaleString()}
          </Text>
          <Text fontSize="sm">
            🍴 {repoData.forks_count.toLocaleString()}
          </Text>
        </Flex>
      </Flex>
      
      {repoData.description && (
        <Box className="github-preview__description" p={4} borderBottom="1px solid" borderColor="gray.600" bg="#1A202C">
          <Text>{repoData.description}</Text>
        </Box>
      )}
      
      {repoData.language && (
        <Box p={4} borderBottom="1px solid" borderColor="gray.600" bg="#1A202C">
          <Text fontSize="sm">
            Primary language: <Text as="span" fontWeight="bold">{repoData.language}</Text>
          </Text>
        </Box>
      )}

      {/* File Structure Section */}
      <Box p={4} borderBottom="1px solid" borderColor="gray.600" bg="#1A202C">
        <Button
          onClick={handleShowFiles}
          size="sm"
          colorScheme="blue"
          variant="outline"
          isLoading={fileLoading}
          leftIcon={<Box as="span">{showFiles ? '📁' : '📂'}</Box>}
          mb={showFiles && fileData.length > 0 ? 4 : 0}
          width="100%"
        >
          {showFiles ? 'Hide Files' : 'Show Files'}
        </Button>
        
        {showFiles && fileData.length > 0 && (
          <Box className="github-preview__files" mt={2} bg="#2D3748">
            <Accordion allowMultiple>
              {fileData.map((file) => (
                <Box 
                  key={file.path}
                  className={`github-preview__file ${file.type === 'dir' ? 'github-preview__file--dir' : ''}`}
                  bg={file.type === 'dir' ? '#1A202C' : '#2D3748'}
                >
                  {file.type === 'dir' ? (
                    <AccordionItem border="0" bg="#1A202C">
                      <h2>
                        <AccordionButton px={2} py={1} _hover={{ bg: '#4A5568' }} bg="#1A202C">
                          <Box flex="1" textAlign="left" fontSize="sm">
                            📁 {file.name}
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={2} pl={4} bg="#1A202C">
                        <Text fontSize="xs" color="gray.400">
                          Directory contents not shown for preview simplicity
                        </Text>
                      </AccordionPanel>
                    </AccordionItem>
                  ) : (
                    <Flex 
                      px={2} 
                      py={1} 
                      alignItems="center" 
                      fontSize="sm"
                      _hover={{ bg: '#4A5568' }}
                    >
                      <Text>
                        {getFileIcon(file.name)} {file.name}
                      </Text>
                      {file.size !== undefined && (
                        <Text ml="auto" fontSize="xs" color="gray.500">
                          {file.size < 1024 ? `${file.size} B` : 
                           file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : 
                           `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                        </Text>
                      )}
                    </Flex>
                  )}
                </Box>
              ))}
            </Accordion>
          </Box>
        )}
      </Box>
      
      {/* README Preview */}
      {readmeContent && (
        <Box className="github-preview__readme" p={4} borderBottom="1px solid" borderColor="gray.600" bg="#1A202C">
          <Text fontWeight="bold" fontSize="sm" mb={2}>📖 README Preview:</Text>
          <Box 
            fontSize="xs" 
            color="gray.100" 
            maxHeight={isReadmeExpanded ? "400px" : "100px"} 
            overflow="auto" 
            position="relative"
            className="github-preview__readme-content"
            bg="#2D3748"
            borderColor="gray.600"
          >
            {isReadmeExpanded ? (
              <Box bg="#2D3748" p={2}>
                <ReactMarkdown>{readmeContent}</ReactMarkdown>
              </Box>
            ) : (
              <Box position="relative" bg="#2D3748" p={2}>
                <ReactMarkdown>{readmeContent.split('\n').slice(0, 10).join('\n')}</ReactMarkdown>
                {readmeContent.split('\n').length > 10 && (
                  <Box 
                    position="absolute" 
                    bottom="0" 
                    left="0" 
                    right="0" 
                    height="30px" 
                    bgGradient="linear(to-t, #2D3748, transparent)"
                    className="github-preview__readme-fade"
                  />
                )}
              </Box>
            )}
          </Box>
          <Button
            onClick={toggleReadmeExpansion}
            size="sm"
            colorScheme="blue"
            variant="outline"
            mt={2}
            width="100%"
          >
            {isReadmeExpanded ? 'Show Less' : 'Show More'}
          </Button>
        </Box>
      )}
      
      <Box p={4} textAlign="center" bg="#1A202C">
        <Link 
          href={repoData.html_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="github-preview__view-button"
          color="blue.300"
          fontWeight="semibold"
          _hover={{ textDecoration: 'underline' }}
        >
          View on GitHub
        </Link>
      </Box>
    </Box>
  );
}; 