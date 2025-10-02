# Privacy & Consent

We use a real consent system that gates non-essential analytics.

- Consent types: essential (always on), analytics, marketing, functional
- Storage: localStorage key `careerate_consent` with timestamp and version
- Analytics providers (behind consent): PostHog, Plausible
- Withdrawal: clearing or disabling consent resets analytics and removes non-essential data

User controls
- Cookie banner: Decline All, Customize, Accept All
- Privacy Settings page: granular toggles, Clear All Data

Implementation
- `client/src/services/consentManager.ts`
- `client/src/services/analytics.ts`
- `client/src/components/CookieConsent.tsx`
- `client/src/pages/privacy-settings.tsx`
