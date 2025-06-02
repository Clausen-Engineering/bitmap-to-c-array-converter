class SafeStorage {
  private static isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
    try {
      const storage = window[type];
      const test = '__storage_test__';
      storage.setItem(test, test);
      storage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  static getItem(key: string, fallback: string | null = null): string | null {
    try {
      if (this.isStorageAvailable('localStorage')) {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('localStorage access failed:', e);
    }
    return fallback;
  }

  static setItem(key: string, value: string): boolean {
    try {
      if (this.isStorageAvailable('localStorage')) {
        localStorage.setItem(key, value);
        return true;
      }
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }
    return false;
  }

  static removeItem(key: string): boolean {
    try {
      if (this.isStorageAvailable('localStorage')) {
        localStorage.removeItem(key);
        return true;
      }
    } catch (e) {
      console.warn('localStorage remove failed:', e);
    }
    return false;
  }
}

// Polyfill for environments where localStorage might not be available
if (typeof window !== 'undefined' && !window.localStorage) {
  // Create a dummy localStorage implementation
  const dummyStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null
  };
  
  try {
    Object.defineProperty(window, 'localStorage', {
      value: dummyStorage,
      writable: false
    });
  } catch (e) {
    // Silently fail if we can't define localStorage
  }
}

export default SafeStorage;