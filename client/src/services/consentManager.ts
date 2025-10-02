export type ConsentType = 'essential' | 'analytics' | 'marketing' | 'functional';

export type ConsentState = {
  essential: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: string;
  version: string;
};

const CONSENT_VERSION = '1.0';
const STORAGE_KEY = 'careerate_consent';

export class ConsentManager {
  private state: ConsentState | null = null;
  private listeners: ((state: ConsentState) => void)[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.version === CONSENT_VERSION) {
          this.state = parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load consent state:', error);
    }
  }

  private saveState() {
    if (this.state) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (error) {
        console.warn('Failed to save consent state:', error);
      }
    }
  }

  getState(): ConsentState | null {
    return this.state;
  }

  hasConsent(type: ConsentType): boolean {
    if (type === 'essential') return true;
    return this.state?.[type] ?? false;
  }

  setConsent(consent: Partial<ConsentState>) {
    this.state = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
      ...consent,
    };
    this.saveState();
    this.notifyListeners();
  }

  subscribe(listener: (state: ConsentState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    if (this.state) {
      this.listeners.forEach(listener => listener(this.state!));
    }
  }

  // Clear all non-essential data when consent is withdrawn
  clearNonEssentialData() {
    // Clear analytics cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name.startsWith('_') || name.includes('analytics') || name.includes('tracking')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    });

    // Clear analytics localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('analytics') || key.includes('tracking') || key.includes('posthog') || key.includes('plausible')) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const consentManager = new ConsentManager();
