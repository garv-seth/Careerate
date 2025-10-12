/**
 * PWA utilities for service worker registration and install prompts
 */

let deferredPrompt: any = null;

/**
 * Register service worker
 */
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('[PWA] Service worker registered:', registration.scope);
      
      // Check for updates every hour
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
      
      return registration;
    } catch (error) {
      console.error('[PWA] Service worker registration failed:', error);
      return null;
    }
  }
  return null;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    console.log('[PWA] Notification permission:', permission);
    return permission;
  }
  return 'denied';
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(registration: ServiceWorkerRegistration) {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
    });
    
    // Send subscription to backend
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(subscription)
    });
    
    console.log('[PWA] Push subscription created');
    return subscription;
  } catch (error) {
    console.error('[PWA] Push subscription failed:', error);
    return null;
  }
}

/**
 * Check if app is installed (standalone mode)
 */
export function isAppInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

/**
 * Capture install prompt event
 */
export function captureInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] Install prompt captured');
  });
}

/**
 * Show install prompt
 */
export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('[PWA] No install prompt available');
    return false;
  }
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log('[PWA] Install prompt outcome:', outcome);
  deferredPrompt = null;
  
  return outcome === 'accepted';
}

/**
 * Check if install prompt is available
 */
export function canShowInstallPrompt(): boolean {
  return deferredPrompt !== null;
}

/**
 * Get install instructions based on browser
 */
export function getInstallInstructions(): { browser: string; steps: string[] } {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
    return {
      browser: 'Chrome',
      steps: [
        'Tap the menu icon (⋮) in the top right',
        'Select "Install app" or "Add to Home screen"',
        'Confirm the installation'
      ]
    };
  } else if (userAgent.includes('safari')) {
    return {
      browser: 'Safari',
      steps: [
        'Tap the Share button (□↑) at the bottom',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" in the top right'
      ]
    };
  } else if (userAgent.includes('firefox')) {
    return {
      browser: 'Firefox',
      steps: [
        'Tap the menu icon (⋮) in the top right',
        'Select "Install" or "Add to Home screen"',
        'Confirm the installation'
      ]
    };
  } else if (userAgent.includes('edg')) {
    return {
      browser: 'Edge',
      steps: [
        'Tap the menu icon (⋯) in the bottom right',
        'Select "Add to phone"',
        'Confirm the installation'
      ]
    };
  }
  
  return {
    browser: 'Browser',
    steps: [
      'Look for an "Install" or "Add to Home Screen" option in your browser menu',
      'Follow the prompts to install the app'
    ]
  };
}

/**
 * Initialize PWA features
 */
export async function initializePWA() {
  // Register service worker
  const registration = await registerServiceWorker();
  
  // Capture install prompt
  captureInstallPrompt();
  
  // Request notification permission if app is installed
  if (isAppInstalled() && registration) {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      await subscribeToPushNotifications(registration);
    }
  }
  
  console.log('[PWA] Initialized');
}

