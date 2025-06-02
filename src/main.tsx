import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import storage safety first to ensure localStorage polyfill is loaded
import './utils/storage.ts'

// Additional safety check for storage context
try {
  // Test if we can access localStorage without throwing
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.getItem('__test__');
  }
} catch (error) {
  console.warn('Storage access limited in this context:', error);
  
  // Create minimal storage fallback if needed
  if (typeof window !== 'undefined' && !window.localStorage) {
    const memoryStorage = new Map<string, string>();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => memoryStorage.get(key) || null,
        setItem: (key: string, value: string) => memoryStorage.set(key, value),
        removeItem: (key: string) => memoryStorage.delete(key),
        clear: () => memoryStorage.clear(),
        get length() { return memoryStorage.size; },
        key: (index: number) => Array.from(memoryStorage.keys())[index] || null
      },
      writable: false
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);