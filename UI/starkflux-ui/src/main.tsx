import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App'
import './index.css'
import theme from './context/ThemeContext'

const root = document.getElementById('root')

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ChakraProvider theme={theme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      </ChakraProvider>
    </React.StrictMode>
  )
}
