import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Eye, Zap, Bot } from 'lucide-react';

interface AutonomyLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: 'supervised' | 'semi-autonomous' | 'fully-autonomous';
  onSelect: (level: 'supervised' | 'semi-autonomous' | 'fully-autonomous') => void;
}

export function AutonomyLevelModal({
  isOpen,
  onClose,
  currentLevel,
  onSelect
}: AutonomyLevelModalProps) {
  const [selectedLevel, setSelectedLevel] = useState(currentLevel);
  const [acceptedRisk, setAcceptedRisk] = useState(false);

  const handleConfirm = () => {
    if (selectedLevel === 'fully-autonomous' && !acceptedRisk) {
      return; // Don't allow fully autonomous without risk acceptance
    }
    onSelect(selectedLevel);
    setAcceptedRisk(false); // Reset for next time
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col glass-pane border-foreground/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Choose Agent Autonomy Level
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Control how much independence the AI agent has when deploying your applications.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto pr-2 -mr-2 flex-1">
          <RadioGroup
            value={selectedLevel}
            onValueChange={(value: any) => {
              setSelectedLevel(value);
              if (value !== 'fully-autonomous') {
                setAcceptedRisk(false);
              }
            }}
            className="mt-4 grid gap-4 md:grid-cols-2"
          >
          {/* Supervised */}
          <Label
            htmlFor="supervised"
            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedLevel === 'supervised'
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-foreground/10 hover:border-foreground/30'
            }`}
          >
            <RadioGroupItem value="supervised" id="supervised" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-foreground">Supervised (Recommended)</span>
                <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full font-medium">
                  Safest
                </span>
              </div>
              <p className="text-sm text-foreground/70 mb-2">
                Agent asks permission for <strong>every action</strong>. You review and approve each step before execution.
              </p>
              <div className="text-xs text-foreground/60">
                <p>✓ Review deployment plans before execution</p>
                <p>✓ Approve each cloud resource creation</p>
                <p>✓ See cost estimates before spending</p>
                <p>✓ No surprises on your cloud bill</p>
              </div>
            </div>
          </Label>

          {/* Semi-Autonomous */}
          <Label
            htmlFor="semi-autonomous"
            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedLevel === 'semi-autonomous'
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-foreground/10 hover:border-foreground/30'
            }`}
          >
            <RadioGroupItem value="semi-autonomous" id="semi-autonomous" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-purple-500" />
                <span className="font-semibold text-foreground">Semi-Autonomous</span>
                <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-1 rounded-full font-medium">
                  Balanced
                </span>
              </div>
              <p className="text-sm text-foreground/70 mb-2">
                Agent auto-executes <strong>low-risk actions</strong>, but asks for approval on high-risk operations.
              </p>
              <div className="text-xs text-foreground/60 space-y-1">
                <p><strong>Auto-approved:</strong></p>
                <p className="ml-4">• Creating S3 buckets, storage</p>
                <p className="ml-4">• Small compute instances (&lt; $50/month)</p>
                <p className="ml-4">• Environment variables, configs</p>
                <p><strong>Requires approval:</strong></p>
                <p className="ml-4">• Database provisioning</p>
                <p className="ml-4">• Large instances (&gt; $50/month)</p>
                <p className="ml-4">• Production deployments</p>
              </div>
            </div>
          </Label>

          {/* Fully Autonomous */}
          <Label
            htmlFor="fully-autonomous"
            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedLevel === 'fully-autonomous'
                ? 'border-red-500 bg-red-500/10'
                : 'border-foreground/10 hover:border-foreground/30'
            }`}
          >
            <RadioGroupItem value="fully-autonomous" id="fully-autonomous" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Bot className="w-5 h-5 text-red-500" />
                <span className="font-semibold text-foreground">Fully Autonomous</span>
                <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded-full font-medium">
                  Use at Your Own Risk
                </span>
              </div>
              <p className="text-sm text-foreground/70 mb-2">
                Agent executes <strong>all actions without asking</strong>. Notifies you after completion.
              </p>
              
              {/* Warning Box */}
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-red-500 space-y-1">
                    <p className="font-semibold">⚠️ IMPORTANT - READ CAREFULLY</p>
                    <p>
                      AI agents, while powerful, can make mistakes. By using Fully Autonomous mode, you acknowledge:
                    </p>
                  </div>
                </div>
                <ul className="text-xs text-red-500/90 ml-7 space-y-1 list-disc">
                  <li><strong>Careerate is NOT liable</strong> for agent errors, unexpected cloud costs, data loss, or service outages</li>
                  <li><strong>YOU are responsible</strong> for monitoring your cloud accounts and bills</li>
                  <li>Agents may create expensive resources without asking</li>
                  <li>Agents may misconfigure security settings</li>
                  <li>You MUST set budget limits on your cloud accounts</li>
                </ul>
              </div>

              {/* Acceptance Checkbox */}
              {selectedLevel === 'fully-autonomous' && (
                <div className="mt-3 flex items-start gap-2">
                  <Checkbox
                    id="accept-risk"
                    checked={acceptedRisk}
                    onCheckedChange={(checked) => setAcceptedRisk(checked === true)}
                    className="mt-1"
                  />
                  <Label
                    htmlFor="accept-risk"
                    className="text-sm text-foreground cursor-pointer"
                  >
                    I understand the risks and accept full responsibility for all cloud costs and agent actions. I have set budget limits on my cloud accounts.
                  </Label>
                </div>
              )}
            </div>
          </Label>
          </RadioGroup>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-foreground/10 flex-shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedLevel === 'fully-autonomous' && !acceptedRisk}
            className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
          >
            Confirm Selection
          </Button>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-foreground/50 text-center mt-2 flex-shrink-0">
          You can change this setting anytime in Settings or before each deployment.
        </p>
      </DialogContent>
    </Dialog>
  );
}

