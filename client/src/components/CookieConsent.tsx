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
    <>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl"
        >
          <div className="glass-pane rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="flex-1 text-xs sm:text-sm text-foreground/85 leading-relaxed">
                We use essential cookies to make our site work. With your consent, we may also use non‑essential cookies to improve your experience. See our{" "}
                <Link href="/privacy">
                  <a className="underline hover:text-primary transition-colors">Privacy Policy</a>
                </Link>
                {" "}for details.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-border text-foreground hover:bg-primary/10 text-xs flex-1 sm:flex-none"
                  onClick={handleDeclineAll}
                >
                  Decline
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-border text-foreground hover:bg-primary/10 text-xs flex-1 sm:flex-none"
                  onClick={handleCustomize}
                >
                  Customize
                </Button>
                <Button
                  size="sm"
                  className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/25 text-xs whitespace-nowrap flex-1 sm:flex-none"
                  onClick={handleAcceptAll}
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
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
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
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
              <p className="text-sm text-foreground/60">Used to deliver relevant content</p>
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