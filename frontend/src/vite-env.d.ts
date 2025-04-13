/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REACT_APP_AZURE_CLIENT_ID: string
  readonly VITE_REACT_APP_AZURE_AUTHORITY: string
  readonly VITE_REACT_APP_AZURE_REDIRECT_URI: string
  
  // Auth0 Configuration
  readonly VITE_AUTH0_DOMAIN: string
  readonly VITE_AUTH0_CLIENT_ID: string
  
  // API Configuration
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
