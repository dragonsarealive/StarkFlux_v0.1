import React, { createContext, type ReactNode, useContext } from 'react'
import { extendTheme } from '@chakra-ui/react'
import colors from '../utils/colors'

// Define the theme
const theme = extendTheme({
  colors: {
    red: {
      700: colors.primary
    }
  },
  fonts: {
    heading: 'system-ui, sans-serif',
    body: 'system-ui, sans-serif'
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false
  },
  styles: {
    global: {
      body: {
        bg: colors.bgPrimary,
        color: colors.textPrimary
      }
    }
  }
})

// Create theme context
const ThemeContext = createContext(theme)

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode
}

// Theme provider component
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook to use theme
export const useTheme = () => useContext(ThemeContext)

// Export the theme directly as well
export default theme 