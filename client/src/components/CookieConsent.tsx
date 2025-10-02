import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (consent: 'accepted' | 'declined') => {
    localStorage.setItem('cookieConsent', consent);
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
    // Here you would add logic to initialize analytics etc. if accepted
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] md:w-[90vw] max-w-4xl z-50"
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
                  onClick={() => handleConsent('declined')}
                >
                  Decline
                </Button>
                <Button
                  className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/25"
                  onClick={() => handleConsent('accepted')}
                >
                  Accept
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}