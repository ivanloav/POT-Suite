/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_GESPACK_URL?: string;
  readonly VITE_APP_IT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
