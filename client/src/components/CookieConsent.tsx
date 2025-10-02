import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { consentManager } from "@/services/consentManager";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = consentManager.getState();
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    consentManager.setConsent({
      analytics: true,
      marketing: true,
      functional: true,
    });
    setIsVisible(false);
  };

  const handleDeclineAll = () => {
    consentManager.setConsent({
      analytics: false,
      marketing: false,
      functional: false,
    });
    setIsVisible(false);
  };

  const handleCustomize = () => {
    setShowDetails(true);
  };

  if (showDetails) {
    return <CookieConsentDetails onClose={() => setShowDetails(false)} />;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[90vw] max-w-4xl z-50"
        >
          <div className="glass-pane rounded-2xl p-4 sm:p-6 shadow-2xl shadow-black/20">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="flex-grow text-sm text-foreground/80 text-center sm:text-left">
                We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve user experience. By clicking "Accept", you agree to our cookie use. You can view our
                <Link href="/privacy">
                  <a className="underline hover:text-primary transition-colors mx-1">Privacy Policy</a>
                </Link>
                for more details.
              </p>
              <div className="flex-shrink-0 flex items-center gap-2">
                <Button
                  variant="outline"
                  className="rounded-full border-border text-foreground hover:bg-primary/10"
                  onClick={handleDeclineAll}
                >
                  Decline All
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-border text-foreground hover:bg-primary/10"
                  onClick={handleCustomize}
                >
                  Customize
                </Button>
                <Button
                  className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/25"
                  onClick={handleAcceptAll}
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CookieConsentDetails({ onClose }: { onClose: () => void }) {
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false,
    functional: false,
  });

  const handleSave = () => {
    consentManager.setConsent(preferences);
    onClose();
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-pane rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <h2 className="text-xl font-bold mb-4">Cookie Preferences</h2>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-foreground/5">
            <div>
              <h3 className="font-medium">Essential Cookies</h3>
              <p className="text-sm text-foreground/60">Required for basic site functionality</p>
            </div>
            <div className="text-sm text-foreground/60">Always Active</div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-foreground/5">
            <div>
              <h3 className="font-medium">Analytics Cookies</h3>
              <p className="text-sm text-foreground/60">Help us understand how you use our site</p>
            </div>
            <Button
              variant={preferences.analytics ? "default" : "outline"}
              size="sm"
              onClick={() => togglePreference('analytics')}
            >
              {preferences.analytics ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-foreground/5">
            <div>
              <h3 className="font-medium">Marketing Cookies</h3>
              <p className="text-sm text-foreground/60">Used to deliver relevant ads and content</p>
            </div>
            <Button
              variant={preferences.marketing ? "default" : "outline"}
              size="sm"
              onClick={() => togglePreference('marketing')}
            >
              {preferences.marketing ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-foreground/5">
            <div>
              <h3 className="font-medium">Functional Cookies</h3>
              <p className="text-sm text-foreground/60">Remember your preferences and settings</p>
            </div>
            <Button
              variant={preferences.functional ? "default" : "outline"}
              size="sm"
              onClick={() => togglePreference('functional')}
            >
              {preferences.functional ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
            Save Preferences
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}