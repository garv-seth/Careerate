import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Smartphone, Download } from 'lucide-react';
import { canShowInstallPrompt, showInstallPrompt, isAppInstalled } from '@/lib/pwa';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isAppInstalled()) {
      return;
    }

    // Check if user previously dismissed (expires after 7 days)
    const dismissedAt = localStorage.getItem('pwa-install-dismissed');
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setDismissed(true);
        return;
      }
    }

    // Show prompt after 30 seconds if available
    const timer = setTimeout(() => {
      if (canShowInstallPrompt()) {
        setShowPrompt(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleInstall = async () => {
    const accepted = await showInstallPrompt();
    if (accepted) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (dismissed || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3, type: 'spring' }}
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="glass-pane rounded-2xl p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Install Careerate</h3>
                <p className="text-xs text-foreground/70 mb-3">
                  Get instant access, offline support, and push notifications for deployment updates.
                </p>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstall}
                    size="sm"
                    className="flex-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Install App
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                  >
                    Not Now
                  </Button>
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="text-foreground/50 hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

