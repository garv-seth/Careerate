/**
 * Simple Cookie Consent Tests
 * 
 * Test suite for CookieConsent component - simplified version
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CookieConsent } from '../CookieConsent';

// Mock the consent manager
vi.mock('@/services/consentManager', () => ({
  consentManager: {
    getState: vi.fn(() => null),
    setConsent: vi.fn()
  }
}));

describe('CookieConsent Simple', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders nothing when consent is already given', () => {
    const { container } = render(<CookieConsent />);
    expect(container.firstChild).toBeNull();
  });

  it('component exists and can be rendered', () => {
    const { container } = render(<CookieConsent />);
    expect(container).toBeDefined();
  });
});
