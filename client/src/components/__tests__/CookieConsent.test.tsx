/**
 * Cookie Consent Tests
 * 
 * Test suite for CookieConsent component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CookieConsent } from '../CookieConsent';

describe('CookieConsent', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders the cookie consent banner when not accepted', () => {
    render(<CookieConsent />);
    
    expect(screen.getByText(/We use cookies/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Accept All/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reject All/i })).toBeInTheDocument();
  });

  it('does not render when cookies are already accepted', () => {
    localStorage.setItem('cookie-consent', 'accepted');
    
    const { container } = render(<CookieConsent />);
    
    expect(container.firstChild).toBeNull();
  });

  it('sets localStorage when Accept All is clicked', async () => {
    render(<CookieConsent />);
    
    const acceptButton = screen.getByRole('button', { name: /Accept All/i });
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(localStorage.getItem('cookie-consent')).toBe('accepted');
    });
  });

  it('sets localStorage when Reject All is clicked', async () => {
    render(<CookieConsent />);
    
    const rejectButton = screen.getByRole('button', { name: /Reject All/i });
    fireEvent.click(rejectButton);
    
    await waitFor(() => {
      expect(localStorage.getItem('cookie-consent')).toBe('rejected');
    });
  });

  it('hides banner after clicking Accept All', async () => {
    render(<CookieConsent />);
    
    const acceptButton = screen.getByRole('button', { name: /Accept All/i });
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(screen.queryByText(/We use cookies/i)).not.toBeInTheDocument();
    });
  });

  it('contains privacy policy link', () => {
    render(<CookieConsent />);
    
    const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });
});

