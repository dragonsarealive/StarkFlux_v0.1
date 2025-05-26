import React, { useState, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Tag,
  TagLabel,
  TagCloseButton,
  Button,
  Wrap,
  WrapItem,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  useToast
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

interface SkillsSelectorProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
  maxSkills?: number;
  placeholder?: string;
}

// Common developer skills for suggestions
const SUGGESTED_SKILLS = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Rust', 'Cairo',
  'Solidity', 'Smart Contracts', 'Web3', 'Blockchain', 'DeFi', 'NFTs',
  'Frontend Development', 'Backend Development', 'Full Stack', 'DevOps',
  'UI/UX Design', 'Mobile Development', 'API Development', 'Database Design',
  'Git', 'Docker', 'AWS', 'GraphQL', 'REST APIs', 'Testing', 'Agile',
  'Starknet', 'Ethereum', 'Bitcoin', 'Cryptocurrency', 'DApps'
];

export const SkillsSelector: React.FC<SkillsSelectorProps> = ({
  skills,
  onSkillsChange,
  maxSkills = 20,
  placeholder = "Add a skill..."
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Filter suggestions based on input and exclude already selected skills
  const filteredSuggestions = SUGGESTED_SKILLS.filter(skill =>
    skill.toLowerCase().includes(inputValue.toLowerCase()) &&
    !skills.includes(skill)
  ).slice(0, 8); // Limit to 8 suggestions

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    
    if (!trimmedSkill) return;
    
    if (skills.length >= maxSkills) {
      toast({
        title: "Maximum Skills Reached",
        description: `You can only add up to ${maxSkills} skills.`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (skills.includes(trimmedSkill)) {
      toast({
        title: "Skill Already Added",
        description: "This skill is already in your list.",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    
    onSkillsChange([...skills, trimmedSkill]);
    setInputValue('');
    setShowSuggestions(false);
    
    // Focus back to input for easy multiple additions
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const removeSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter(skill => skill !== skillToRemove));
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(inputValue);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.length > 0);
  };

  return (
    <FormControl>
      <FormLabel color="gray.300">Skills & Technologies</FormLabel>
      <VStack spacing={4} align="stretch">
        {/* Skills Input */}
        <Box position="relative">
          <InputGroup>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyPress}
              onFocus={() => setShowSuggestions(inputValue.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={placeholder}
              bg="gray.700"
              borderColor="gray.600"
              color="white"
              _placeholder={{ color: 'gray.400' }}
              _focus={{
                borderColor: "blue.400",
                boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)"
              }}
            />
            <InputRightElement>
              <Button
                size="sm"
                onClick={() => addSkill(inputValue)}
                isDisabled={!inputValue.trim() || skills.length >= maxSkills}
                bg="blue.500"
                color="white"
                _hover={{ bg: "blue.600" }}
                _disabled={{ bg: "gray.600", color: "gray.400" }}
              >
                <AddIcon boxSize={3} />
              </Button>
            </InputRightElement>
          </InputGroup>

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <Box
              position="absolute"
              top="100%"
              left="0"
              right="0"
              zIndex="10"
              bg="gray.700"
              border="1px solid"
              borderColor="gray.600"
              borderRadius="md"
              mt={1}
              maxHeight="200px"
              overflowY="auto"
              boxShadow="lg"
            >
              {filteredSuggestions.map((skill) => (
                <Box
                  key={skill}
                  px={3}
                  py={2}
                  cursor="pointer"
                  color="white"
                  _hover={{
                    bg: "gray.600"
                  }}
                  onClick={() => addSkill(skill)}
                >
                  <Text fontSize="sm">{skill}</Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Skills Display */}
        {skills.length > 0 && (
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text color="gray.400" fontSize="sm">
                Selected Skills ({skills.length}/{maxSkills})
              </Text>
              {skills.length > 0 && (
                <Button
                  size="xs"
                  variant="ghost"
                  color="red.400"
                  onClick={() => onSkillsChange([])}
                  _hover={{ bg: "red.900", color: "red.300" }}
                >
                  Clear All
                </Button>
              )}
            </HStack>
            
            <Wrap spacing={2}>
              {skills.map((skill) => (
                <WrapItem key={skill}>
                  <Tag
                    size="md"
                    bg="blue.500"
                    color="white"
                    borderRadius="full"
                    _hover={{
                      bg: "blue.600",
                      transform: "scale(1.05)"
                    }}
                    transition="all 0.2s ease"
                  >
                    <TagLabel>{skill}</TagLabel>
                    <TagCloseButton
                      onClick={() => removeSkill(skill)}
                      _hover={{
                        bg: "red.500"
                      }}
                    />
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          </Box>
        )}

        {/* Helper Text */}
        <Text color="gray.500" fontSize="xs">
          {skills.length === 0 
            ? "Start typing to see suggestions or add your own skills"
            : `${maxSkills - skills.length} more skills can be added`
          }
        </Text>
      </VStack>
    </FormControl>
  );
};

export default SkillsSelector; 