/// <reference types="vite/client" />

// Declares the shape of import.meta.env so VITE_API_BASE_URL (read in
// src/composables/useApiTasks.ts) is type-checked instead of `any`. Vite
// only exposes environment variables prefixed with VITE_ to client code —
// see .env in the repository root and docs/05_API_INTEGRATION.md.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
