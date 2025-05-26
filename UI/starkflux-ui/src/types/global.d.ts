// Global type declarations for JSON imports
declare module "*.json" {
  const value: any;
  export default value;
}
 
// Specific type for ABI JSON files
declare module "*.abi.json" {
  const abi: any[];
  export default abi;
}

// Global type declarations for the StarkFlux UI

declare module 'react' {
  interface InputHTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Add support for webkitdirectory attribute
    webkitdirectory?: string;
  }
}

// Extend the global Window interface for wallet providers
declare global {
  interface Window {
    starknet?: any;
    argentX?: any;
    braavos?: any;
  }
}

// Vite environment variables
interface ImportMetaEnv {
  readonly VITE_PINATA_JWT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 