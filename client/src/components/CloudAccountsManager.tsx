/**
 * Cloud Accounts Manager Component
 * Allows users to connect their AWS, Azure, and GCP accounts via OAuth/CloudFormation
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Check, X, ExternalLink, Download, AlertCircle, Loader2, Link as LinkIcon, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IntegrationCardSkeleton } from './LoadingSkeleton';

interface CloudAccount {
  id: string;
  provider: 'aws' | 'azure' | 'gcp';
  name: string;
  accountId: string;
  status: 'active' | 'inactive';
  configuration: any;
}

export function CloudAccountsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [awsDialog, setAwsDialog] = useState(false);
  const [azureDialog, setAzureDialog] = useState(false);
  const [gcpDialog, setGcpDialog] = useState(false);
  const [gcpServiceAccountDialog, setGcpServiceAccountDialog] = useState(false);
  
  // AWS State
  const [awsAccountId, setAwsAccountId] = useState('');
  const [awsRoleARN, setAwsRoleARN] = useState('');
  const [awsExternalId, setAwsExternalId] = useState('');
  const [awsRegion, setAwsRegion] = useState('us-east-1');
  
  // GCP State
  const [gcpServiceAccount, setGcpServiceAccount] = useState('');

  // Fetch connected cloud accounts
  const { data: cloudAccounts = [], isLoading } = useQuery<CloudAccount[]>({
    queryKey: ['/api/integrations/cloud-providers'],
    retry: false,
    queryFn: async () => {
      try {
        const res = await fetch('/api/integrations/cloud-providers', { credentials: 'include' });
        if (res.status === 401) {
          return [];
        }
        if (!res.ok) {
          console.error('Failed to load cloud providers:', res.status, res.statusText);
          return [];
        }
        return res.json();
      } catch (error) {
        console.error('Cloud providers query error:', error);
        return [];
      }
    },
  });

  // AWS CloudFormation flow
  const awsInitiateMutation = useMutation({
    mutationFn: async (region: string) => {
      const res = await fetch('/api/cloud-oauth/aws/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region }),
        credentials: 'include'
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setAwsExternalId(data.externalId);
        // Open AWS Console in new tab
        window.open(data.url, '_blank');
        toast({
          title: 'AWS Console Opened',
          description: 'Complete the CloudFormation stack creation, then return here to finish setup.',
        });
      }
    },
  });

  const awsCompleteMutation = useMutation({
    mutationFn: async (params: { accountId: string; roleARN: string; externalId: string; region: string }) => {
      const res = await fetch('/api/cloud-oauth/aws/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        credentials: 'include'
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'AWS Connected',
          description: 'Your AWS account has been successfully connected!',
        });
        setAwsDialog(false);
        queryClient.invalidateQueries({ queryKey: ['/api/integrations/cloud-providers'] });
      } else {
        toast({
          title: 'Connection Failed',
          description: data.error || 'Failed to connect AWS account',
          variant: 'destructive',
        });
      }
    },
  });

  // Azure OAuth flow
  const azureInitiateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/cloud-oauth/azure/initiate', {
        method: 'POST',
        credentials: 'include'
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      }
    },
  });

  // GCP OAuth flow
  const gcpInitiateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/cloud-oauth/gcp/initiate', {
        method: 'POST',
        credentials: 'include'
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      }
    },
  });

  // GCP Service Account flow
  const gcpServiceAccountMutation = useMutation({
    mutationFn: async (serviceAccountJSON: string) => {
      const res = await fetch('/api/cloud-oauth/gcp/service-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceAccountJSON }),
        credentials: 'include'
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'GCP Connected',
          description: 'Your GCP account has been successfully connected!',
        });
        setGcpServiceAccountDialog(false);
        setGcpServiceAccount('');
        queryClient.invalidateQueries({ queryKey: ['/api/integrations/cloud-providers'] });
      } else {
        toast({
          title: 'Connection Failed',
          description: data.error || 'Failed to connect GCP account',
          variant: 'destructive',
        });
      }
    },
  });

  // Ejection state
  const [ejectDialog, setEjectDialog] = useState(false);
  const [ejectingAccount, setEjectingAccount] = useState<CloudAccount | null>(null);

  // Eject mutation (downloads IaC templates and disconnects)
  const ejectMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const res = await fetch(`/api/eject/${integrationId}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Ejection failed');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Account Ejected Successfully',
          description: data.message || 'Infrastructure templates downloaded. Your resources continue to run.',
        });
        
        // Download templates
        if (data.exportedTemplates && data.exportedTemplates.length > 0) {
          data.exportedTemplates.forEach((template: any) => {
            const blob = new Blob([JSON.stringify(template.template, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `careerate-${template.provider}-infrastructure.${template.format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          });
        }

        setEjectDialog(false);
        setEjectingAccount(null);
        queryClient.invalidateQueries({ queryKey: ['/api/integrations/cloud-providers'] });
      }
    },
    onError: (error) => {
      toast({
        title: 'Ejection Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async ({ provider, integrationId }: { provider: string; integrationId: string }) => {
      const res = await fetch(`/api/cloud-oauth/${provider}/${integrationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      return res.json();
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        toast({
          title: 'Account Disconnected',
          description: data.message || 'Cloud account disconnected successfully',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/integrations/cloud-providers'] });
      }
    },
  });

  const getConnectedAccount = (provider: string) => {
    return cloudAccounts.find(acc => acc.provider === provider);
  };

  const CloudProviderCard = ({ 
    provider, 
    icon, 
    name, 
    description, 
    color 
  }: { 
    provider: 'aws' | 'azure' | 'gcp'; 
    icon: string; 
    name: string; 
    description: string; 
    color: string;
  }) => {
    const account = getConnectedAccount(provider);
    const isConnected = !!account;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6 bg-gradient-to-br from-background to-muted/20 border-2 hover:border-primary/50 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-2xl`}>
                {icon}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{name}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            {isConnected && (
              <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
                <Check className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>

          {isConnected ? (
            <div className="space-y-3">
              <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Account ID</p>
                  <p className="font-mono text-sm">{account.configuration?.accountId || account.configuration?.subscriptionId || account.configuration?.projectId}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEjectingAccount(account);
                      setEjectDialog(true);
                    }}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Eject
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => disconnectMutation.mutate({ provider, integrationId: account.id })}
                    className="flex-1 text-destructive hover:text-destructive"
                  >
                    <Unlink className="w-4 h-4 mr-1" />
                    Disconnect
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => {
                if (provider === 'aws') setAwsDialog(true);
                else if (provider === 'azure') azureInitiateMutation.mutate();
                else if (provider === 'gcp') setGcpDialog(true);
              }}
              className="w-full"
              disabled={azureInitiateMutation.isPending || gcpInitiateMutation.isPending}
            >
              {(provider === 'azure' && azureInitiateMutation.isPending) || 
               (provider === 'gcp' && gcpInitiateMutation.isPending) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Connect {name}
                </>
              )}
            </Button>
          )}
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Cloud Accounts
        </h2>
        <p className="text-muted-foreground mt-1">
          Connect your cloud provider accounts to deploy infrastructure directly to your own cloud.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <IntegrationCardSkeleton />
          <IntegrationCardSkeleton />
          <IntegrationCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CloudProviderCard
            provider="aws"
            icon="☁️"
            name="Amazon Web Services"
            description="ECS, Lambda, RDS, S3"
            color="bg-gradient-to-br from-orange-500/20 to-orange-600/20"
          />
          <CloudProviderCard
            provider="azure"
            icon="⚡"
            name="Microsoft Azure"
            description="Container Apps, Functions"
            color="bg-gradient-to-br from-blue-500/20 to-blue-600/20"
          />
          <CloudProviderCard
            provider="gcp"
            icon="🔥"
            name="Google Cloud Platform"
            description="Cloud Run, Cloud Functions"
            color="bg-gradient-to-br from-green-500/20 to-green-600/20"
          />
        </div>
      )}

      {/* AWS CloudFormation Dialog */}
      <Dialog open={awsDialog} onOpenChange={setAwsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Connect AWS Account</DialogTitle>
            <DialogDescription>
              Deploy infrastructure to your AWS account via CloudFormation stack
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <p className="font-semibold mb-1">Porter-style Connection</p>
                  <p>Careerate will create a CloudFormation stack in your AWS account that grants us permission to deploy and manage your infrastructure.</p>
                </div>
              </div>
            </div>

            {!awsExternalId ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">AWS Region</label>
                  <Input
                    value={awsRegion}
                    onChange={(e) => setAwsRegion(e.target.value)}
                    placeholder="us-east-1"
                  />
                </div>

                <Button
                  onClick={() => awsInitiateMutation.mutate(awsRegion)}
                  className="w-full"
                  disabled={awsInitiateMutation.isPending}
                >
                  {awsInitiateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Stack...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open AWS Console to Create Stack
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm text-green-300">
                    ✓ CloudFormation template opened in AWS Console. Complete the stack creation, then enter the details below.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">AWS Account ID</label>
                  <Input
                    value={awsAccountId}
                    onChange={(e) => setAwsAccountId(e.target.value)}
                    placeholder="123456789012"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">IAM Role ARN</label>
                  <Input
                    value={awsRoleARN}
                    onChange={(e) => setAwsRoleARN(e.target.value)}
                    placeholder="arn:aws:iam::123456789012:role/Careerate-InfrastructureRole-..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">External ID</label>
                  <Input
                    value={awsExternalId}
                    onChange={(e) => setAwsExternalId(e.target.value)}
                    disabled
                  />
                </div>

                <Button
                  onClick={() => awsCompleteMutation.mutate({
                    accountId: awsAccountId,
                    roleARN: awsRoleARN,
                    externalId: awsExternalId,
                    region: awsRegion
                  })}
                  className="w-full"
                  disabled={!awsAccountId || !awsRoleARN || awsCompleteMutation.isPending}
                >
                  {awsCompleteMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Complete Connection
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* GCP Connection Method Dialog */}
      <Dialog open={gcpDialog} onOpenChange={setGcpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect GCP Account</DialogTitle>
            <DialogDescription>
              Choose your preferred connection method
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setGcpDialog(false);
                gcpInitiateMutation.mutate();
              }}
            >
              <Cloud className="w-4 h-4 mr-2" />
              Connect via Google OAuth (Recommended)
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setGcpDialog(false);
                setGcpServiceAccountDialog(true);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Upload Service Account JSON
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* GCP Service Account Dialog */}
      <Dialog open={gcpServiceAccountDialog} onOpenChange={setGcpServiceAccountDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload GCP Service Account</DialogTitle>
            <DialogDescription>
              Paste your service account JSON key file contents
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              value={gcpServiceAccount}
              onChange={(e) => setGcpServiceAccount(e.target.value)}
              placeholder='{\n  "type": "service_account",\n  "project_id": "your-project",\n  ...\n}'
              className="font-mono text-xs min-h-[200px]"
            />

            <Button
              onClick={() => gcpServiceAccountMutation.mutate(gcpServiceAccount)}
              className="w-full"
              disabled={!gcpServiceAccount || gcpServiceAccountMutation.isPending}
            >
              {gcpServiceAccountMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Connect GCP Account
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ejection Warning Dialog */}
      <Dialog open={ejectDialog} onOpenChange={setEjectDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              Eject {ejectingAccount?.provider.toUpperCase()} Account?
            </DialogTitle>
            <DialogDescription>
              This will remove Careerate's management access while preserving your infrastructure
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <p className="text-sm font-semibold text-orange-400 mb-2">⚠️ What Happens When You Eject:</p>
              <ul className="text-sm text-orange-300/90 space-y-1 ml-4 list-disc">
                <li>Careerate will <strong>download</strong> Infrastructure-as-Code templates for all your deployments</li>
                <li>We'll <strong>revoke our access</strong> to your cloud account (delete IAM role/service principal)</li>
                <li>Your infrastructure <strong>continues to run</strong> normally in your cloud account</li>
                <li>You <strong>lose access</strong> to Careerate's AI agents, monitoring, auto-scaling, and cost optimization</li>
                <li>You'll need to <strong>manually manage</strong> your infrastructure using the downloaded templates</li>
              </ul>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-400 mb-1">✓ What You'll Receive:</p>
              <ul className="text-sm text-blue-300/90 space-y-1 ml-4 list-disc">
                <li><strong>{ejectingAccount?.provider === 'aws' ? 'CloudFormation' : ejectingAccount?.provider === 'azure' ? 'ARM' : 'Terraform'} templates</strong> for all deployed resources</li>
                <li><strong>Management guide</strong> for running infrastructure without Careerate</li>
                <li>Your infrastructure remains <strong>100% yours</strong></li>
              </ul>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-400 mb-1">⚠️ Warning:</p>
              <p className="text-sm text-red-300/90">
                After ejection, monitoring alerts will stop, auto-scaling will be disabled, and cost optimization will cease. 
                Your cloud bills may increase without Careerate's AI managing them.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-foreground/10">
              <Button
                variant="outline"
                onClick={() => {
                  setEjectDialog(false);
                  setEjectingAccount(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (ejectingAccount) {
                    ejectMutation.mutate(ejectingAccount.id);
                  }
                }}
                disabled={ejectMutation.isPending}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                {ejectMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ejecting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Eject & Download Templates
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

