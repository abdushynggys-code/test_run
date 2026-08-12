/// <reference types="vite/client" />

interface ViewTransition {
  finished: Promise<void>;
}

interface Document {
  startViewTransition?: (update: () => void) => ViewTransition;
}
