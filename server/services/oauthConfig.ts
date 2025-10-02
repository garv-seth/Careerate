import type { Request } from 'express';
import { getSecret } from './keyVault';

async function getFirstSecret(names: string[]): Promise<string | undefined> {
  for (const name of names) {
    try {
      const v = await getSecret(name);
      if (v) return v;
    } catch {}
  }
  return undefined;
}

export async function getGitHubOAuthConfig(req: Request) {
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  // Prefer env, fallback to Key Vault secret aliases
  const clientId = process.env.GITHUB_CLIENT_ID || await getFirstSecret([
    'GITHUB-CLIENT-ID', 'github-client-id', 'GITHUB_CLIENT_ID'
  ]);
  const clientSecret = process.env.GITHUB_CLIENT_SECRET || await getFirstSecret([
    'GITHUB-CLIENT-SECRET', 'github-client-secret', 'GITHUB_CLIENT_SECRET'
  ]);
  const redirectUri = `${baseUrl}/api/callback/github`;
  const scopes = ['repo','read:org','user:email'];
  return { clientId, clientSecret, redirectUri, scopes };
}


