import { consentManager, ConsentState } from './consentManager';

// Analytics providers
class PostHogAnalytics {
  private initialized = false;

  async init() {
    if (this.initialized || !consentManager.hasConsent('analytics')) return;

    try {
      // Load PostHog script
      const script = document.createElement('script');
      script.src = 'https://app.posthog.com/static/array.js';
      script.async = true;
      document.head.appendChild(script);

      // Initialize PostHog
      script.onload = () => {
        (window as any).posthog.init(process.env.REACT_APP_POSTHOG_KEY || 'phc_demo_key', {
          api_host: 'https://app.posthog.com',
          loaded: (posthog: any) => {
            this.initialized = true;
            console.log('PostHog initialized');
          }
        });
      };
    } catch (error) {
      console.warn('Failed to initialize PostHog:', error);
    }
  }

  track(event: string, properties?: Record<string, any>) {
    if (!this.initialized || !consentManager.hasConsent('analytics')) return;
    
    try {
      (window as any).posthog?.capture(event, properties);
    } catch (error) {
      console.warn('Failed to track event:', error);
    }
  }

  identify(userId: string, properties?: Record<string, any>) {
    if (!this.initialized || !consentManager.hasConsent('analytics')) return;
    
    try {
      (window as any).posthog?.identify(userId, properties);
    } catch (error) {
      console.warn('Failed to identify user:', error);
    }
  }

  reset() {
    if (this.initialized) {
      try {
        (window as any).posthog?.reset();
        this.initialized = false;
      } catch (error) {
        console.warn('Failed to reset PostHog:', error);
      }
    }
  }
}

class PlausibleAnalytics {
  private initialized = false;

  async init() {
    if (this.initialized || !consentManager.hasConsent('analytics')) return;

    try {
      // Load Plausible script
      const script = document.createElement('script');
      script.src = 'https://plausible.io/js/script.js';
      script.setAttribute('data-domain', process.env.REACT_APP_PLAUSIBLE_DOMAIN || 'gocareerate.com');
      script.defer = true;
      document.head.appendChild(script);

      this.initialized = true;
      console.log('Plausible initialized');
    } catch (error) {
      console.warn('Failed to initialize Plausible:', error);
    }
  }

  track(event: string, properties?: Record<string, any>) {
    if (!this.initialized || !consentManager.hasConsent('analytics')) return;
    
    try {
      (window as any).plausible?.(event, { props: properties });
    } catch (error) {
      console.warn('Failed to track event:', error);
    }
  }

  reset() {
    // Plausible doesn't have a reset method, just mark as not initialized
    this.initialized = false;
  }
}

// Analytics manager
class AnalyticsManager {
  private posthog = new PostHogAnalytics();
  private plausible = new PlausibleAnalytics();
  private initialized = false;

  async init() {
    if (this.initialized) return;

    // Listen for consent changes
    consentManager.subscribe((state: ConsentState) => {
      if (state.analytics) {
        this.posthog.init();
        this.plausible.init();
      } else {
        this.posthog.reset();
        this.plausible.reset();
        consentManager.clearNonEssentialData();
      }
    });

    // Initialize if consent already given
    if (consentManager.hasConsent('analytics')) {
      await this.posthog.init();
      await this.plausible.init();
    }

    this.initialized = true;
  }

  track(event: string, properties?: Record<string, any>) {
    this.posthog.track(event, properties);
    this.plausible.track(event, properties);
  }

  identify(userId: string, properties?: Record<string, any>) {
    this.posthog.identify(userId, properties);
  }

  pageView(path: string) {
    this.track('page_view', { path });
  }
}

export const analytics = new AnalyticsManager();

// Initialize analytics on app start
if (typeof window !== 'undefined') {
  analytics.init();
}
