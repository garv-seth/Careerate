import { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Check, Download, Bell, Zap, Globe } from 'lucide-react';
import { getInstallInstructions, isAppInstalled, showInstallPrompt, canShowInstallPrompt } from '@/lib/pwa';

export default function InstallPage() {
  const [installed, setInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [instructions, setInstructions] = useState(getInstallInstructions());

  useEffect(() => {
    setInstalled(isAppInstalled());
    setCanInstall(canShowInstallPrompt());
  }, []);

  const handleInstall = async () => {
    const accepted = await showInstallPrompt();
    if (accepted) {
      setInstalled(true);
      setCanInstall(false);
    }
  };

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Install Careerate
          </h1>
          
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Get the full app experience with offline support, instant access, and push notifications for your deployments.
          </p>
          
          {installed && (
            <Badge className="mt-4 bg-green-500/20 text-green-500 border-green-500/30">
              <Check className="w-3 h-3 mr-1" />
              Already Installed
            </Badge>
          )}
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card className="glass-pane rounded-2xl border-0">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Instant Access</h3>
              <p className="text-sm text-foreground/60">
                Launch from your home screen like a native app
              </p>
            </CardContent>
          </Card>

          <Card className="glass-pane rounded-2xl border-0">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Offline Support</h3>
              <p className="text-sm text-foreground/60">
                View deployments and dashboards even without internet
              </p>
            </CardContent>
          </Card>

          <Card className="glass-pane rounded-2xl border-0">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Bell className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Push Notifications</h3>
              <p className="text-sm text-foreground/60">
                Get instant alerts when deployments complete or fail
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Install Button */}
        {canInstall && !installed && (
          <div className="mb-12 text-center">
            <Button
              onClick={handleInstall}
              size="lg"
              className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/25 px-8"
            >
              <Download className="w-5 h-5 mr-2" />
              Install Now
            </Button>
          </div>
        )}

        {/* Manual Instructions */}
        <Card className="glass-pane rounded-2xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Smartphone className="w-5 h-5" />
              Installation Guide for {instructions.browser}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {instructions.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <p className="text-foreground/80 flex-1">{step}</p>
                </li>
              ))}
            </ol>

            <div className="mt-6 pt-6 border-t border-foreground/10">
              <p className="text-sm text-foreground/60">
                <strong>Note:</strong> PWA installation requires HTTPS and may not be available in all browsers or on desktop. 
                For the best experience, use Chrome, Safari, or Edge on mobile devices.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Already Installed Message */}
        {installed && (
          <div className="mt-8 text-center">
            <div className="glass-pane rounded-2xl p-6 inline-block">
              <Check className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p className="font-semibold text-foreground mb-1">You're all set!</p>
              <p className="text-sm text-foreground/60">
                Careerate is installed on your device. You can launch it from your home screen anytime.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

