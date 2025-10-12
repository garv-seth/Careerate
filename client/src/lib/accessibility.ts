/**
 * Accessibility Utilities
 * 
 * Helpers for improving accessibility across the application
 */

/**
 * Announce a message to screen readers via aria-live region
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  // Find or create the aria-live region
  let liveRegion = document.getElementById('a11y-live-region');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'a11y-live-region';
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('role', 'status');
    liveRegion.className = 'sr-only'; // Visually hidden but accessible to screen readers
    document.body.appendChild(liveRegion);
  }

  // Update the aria-live priority if needed
  liveRegion.setAttribute('aria-live', priority);
  
  // Clear previous message
  liveRegion.textContent = '';
  
  // Announce the new message (small delay ensures screen reader picks it up)
  setTimeout(() => {
    liveRegion!.textContent = message;
  }, 100);
  
  // Clear message after 5 seconds
  setTimeout(() => {
    if (liveRegion!.textContent === message) {
      liveRegion!.textContent = '';
    }
  }, 5000);
}

/**
 * Trap focus within a modal/dialog
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown);

  // Focus first element
  firstElement.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get safe animation duration based on user preferences
 */
export function getAnimationDuration(defaultDuration: number): number {
  return prefersReducedMotion() ? 0 : defaultDuration;
}

/**
 * Skip to main content helper
 */
export function skipToMain() {
  const main = document.querySelector('main');
  if (main) {
    main.setAttribute('tabindex', '-1');
    main.focus();
    setTimeout(() => {
      main.removeAttribute('tabindex');
    }, 1000);
  }
}

/**
 * Get descriptive label for keyboard shortcuts
 */
export function getKeyLabel(key: string): string {
  const labels: Record<string, string> = {
    ' ': 'Space',
    'Escape': 'Escape',
    'Enter': 'Enter',
    'ArrowUp': 'Arrow Up',
    'ArrowDown': 'Arrow Down',
    'ArrowLeft': 'Arrow Left',
    'ArrowRight': 'Arrow Right',
    'Tab': 'Tab',
    'Control': 'Ctrl',
    'Meta': navigator.platform.includes('Mac') ? 'Cmd' : 'Win',
    'Alt': 'Alt',
    'Shift': 'Shift',
  };
  
  return labels[key] || key.toUpperCase();
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(keys: string[]): string {
  return keys.map(getKeyLabel).join(' + ');
}

/**
 * Check if element is visible to screen readers
 */
export function isAccessible(element: HTMLElement): boolean {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  
  // Check if hidden via CSS
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }
  
  // Check if hidden via aria
  if (element.getAttribute('aria-hidden') === 'true') {
    return false;
  }
  
  // Check if hidden via inert
  if (element.hasAttribute('inert')) {
    return false;
  }
  
  return true;
}

/**
 * Generate unique ID for aria-describedby and aria-labelledby
 */
let idCounter = 0;
export function generateA11yId(prefix: string = 'a11y'): string {
  idCounter++;
  return `${prefix}-${idCounter}-${Date.now()}`;
}

/**
 * Color contrast ratio calculator (WCAG compliance)
 */
export function getContrastRatio(foreground: string, background: string): number {
  // This is a simplified version - for production, use a proper color library
  const getLuminance = (rgb: number[]) => {
    const [r, g, b] = rgb.map((val) => {
      const sRGB = val / 255;
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  // Parse hex colors (simplified)
  const parseHex = (hex: string): number[] => {
    const color = hex.replace('#', '');
    return [
      parseInt(color.substr(0, 2), 16),
      parseInt(color.substr(2, 2), 16),
      parseInt(color.substr(4, 2), 16),
    ];
  };

  const l1 = getLuminance(parseHex(foreground));
  const l2 = getLuminance(parseHex(background));
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color contrast meets WCAG AA standard
 */
export function meetsWCAG_AA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if color contrast meets WCAG AAA standard
 */
export function meetsWCAG_AAA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Create visually hidden but screen-reader accessible CSS class
 */
export const srOnlyClass = "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 clip-rect-0";

