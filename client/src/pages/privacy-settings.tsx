import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { consentManager, ConsentState } from "@/services/consentManager";
import { analytics } from "@/services/analytics";

export default function PrivacySettingsPage() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = consentManager.getState();
    setConsent(state);
    
    const unsubscribe = consentManager.subscribe((newState) => {
      setConsent(newState);
    });

    return unsubscribe;
  }, []);

  const updateConsent = async (updates: Partial<ConsentState>) => {
    setLoading(true);
    try {
      consentManager.setConsent(updates);
      
      // Track consent changes
      analytics.track('privacy_settings_updated', {
        analytics: updates.analytics,
        marketing: updates.marketing,
        functional: updates.functional,
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = () => {
    if (confirm('This will clear all non-essential data and reset your preferences. Continue?')) {
      consentManager.clearNonEssentialData();
      consentManager.setConsent({
        analytics: false,
        marketing: false,
        functional: false,
      });
    }
  };

  if (!consent) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-8">
            <p className="text-foreground/60">Loading privacy settings...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Privacy Settings</h1>
          <p className="text-foreground/70">Control how your data is collected and used</p>
        </div>

        <Card className="glass-pane rounded-2xl">
          <CardHeader>
            <CardTitle>Cookie Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-foreground/5">
              <div>
                <h3 className="font-medium">Essential Cookies</h3>
                <p className="text-sm text-foreground/60">Required for basic site functionality</p>
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Always Active
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-foreground/5">
              <div>
                <h3 className="font-medium">Analytics Cookies</h3>
                <p className="text-sm text-foreground/60">Help us understand how you use our site (PostHog, Plausible)</p>
              </div>
              <Switch
                checked={consent.analytics}
                onCheckedChange={(checked) => updateConsent({ analytics: checked })}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-foreground/5">
              <div>
                <h3 className="font-medium">Marketing Cookies</h3>
                <p className="text-sm text-foreground/60">Used to deliver relevant ads and content</p>
              </div>
              <Switch
                checked={consent.marketing}
                onCheckedChange={(checked) => updateConsent({ marketing: checked })}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-foreground/5">
              <div>
                <h3 className="font-medium">Functional Cookies</h3>
                <p className="text-sm text-foreground/60">Remember your preferences and settings</p>
              </div>
              <Switch
                checked={consent.functional}
                onCheckedChange={(checked) => updateConsent({ functional: checked })}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-pane rounded-2xl">
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-foreground/5">
              <h3 className="font-medium mb-2">Clear All Data</h3>
              <p className="text-sm text-foreground/60 mb-4">
                Remove all non-essential cookies and local storage data. This will reset your preferences.
              </p>
              <Button
                variant="outline"
                onClick={clearAllData}
                className="text-red-400 border-red-400/30 hover:bg-red-400/10"
              >
                Clear All Data
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-foreground/5">
              <h3 className="font-medium mb-2">Consent Information</h3>
              <div className="text-sm text-foreground/60 space-y-1">
                <p>Last updated: {new Date(consent.timestamp).toLocaleString()}</p>
                <p>Version: {consent.version}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-pane rounded-2xl">
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-foreground/80">
              <p>• <strong>Access:</strong> You can view your current privacy settings on this page</p>
              <p>• <strong>Control:</strong> You can enable/disable different types of data collection</p>
              <p>• <strong>Delete:</strong> You can clear all non-essential data at any time</p>
              <p>• <strong>Portability:</strong> Contact us to request a copy of your data</p>
              <p>• <strong>Withdraw:</strong> You can change your consent preferences at any time</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
