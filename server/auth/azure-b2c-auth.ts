import { ConfidentialClientApplication, Configuration } from "@azure/msal-node";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/environment";
import { storage } from "../storage";

let setupAzureB2CAuth: (app: any) => void;
let requireAuth: (req: Request, res: Response, next: NextFunction) => void;
let checkTokenUsage: (req: Request, res: Response, next: NextFunction) => void;
let trackTokenUsage: (userId: string, tokensUsed: number) => Promise<void>;
let SUPPORTED_PROVIDERS: any;
let USER_TIERS: any;

// Validate required B2C environment variables
if (!env.AZURE_B2C_CLIENT_ID || !env.AZURE_B2C_CLIENT_SECRET || !env.AZURE_B2C_TENANT_NAME) {
  console.warn("⚠️ Azure B2C environment variables not fully configured. B2C auth will be disabled.");

  // Export mock/no-op functions if B2C is not configured
  setupAzureB2CAuth = () => {};
  requireAuth = (req: Request, res: Response, next: NextFunction) => next();
  checkTokenUsage = (req: Request, res: Response, next: NextFunction) => next();
  trackTokenUsage = async (userId: string, tokensUsed: number) => {};
  SUPPORTED_PROVIDERS = {};
  USER_TIERS = {};

} else {
  // Azure B2C Configuration is valid, proceed with setup
  const msalConfig: Configuration = {
    auth: {
      clientId: env.AZURE_B2C_CLIENT_ID,
      clientSecret: env.AZURE_B2C_CLIENT_SECRET,
      authority: `https://${env.AZURE_B2C_TENANT_NAME}.b2clogin.com/${env.AZURE_B2C_TENANT_NAME}.onmicrosoft.com/${env.AZURE_B2C_POLICY_NAME}`,
    },
    system: {
      loggerOptions: {
        loggerCallback(loglevel: any, message: string) {
          if (env.NODE_ENV === 'development') {
            console.log(`[Azure B2C] ${message}`);
          }
        },
        piiLoggingEnabled: false,
        logLevel: env.NODE_ENV === 'development' ? 3 : 1,
      }
    }
  };

  const pca = new ConfidentialClientApplication(msalConfig);

  SUPPORTED_PROVIDERS = {
    microsoft: { name: "Microsoft", scope: ["openid", "profile", "email"], icon: "microsoft", enabled: true },
    github: { name: "GitHub", scope: ["openid", "profile", "email"], icon: "github", enabled: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) },
    google: { name: "Google", scope: ["openid", "profile", "email"], icon: "google", enabled: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) },
    gitlab: { name: "GitLab", scope: ["openid", "profile", "email"], icon: "gitlab", enabled: !!(env.GITLAB_CLIENT_ID && env.GITLAB_CLIENT_SECRET) }
  };

  USER_TIERS = {
    free: { name: "Free", monthlyTokenLimit: 10000, features: ["Basic analysis", "Simple deployments"], price: 0 },
    pro: { name: "Pro", monthlyTokenLimit: 1000000, features: ["Advanced analysis", "Complex deployments"], price: 29 },
    enterprise: { name: "Enterprise", monthlyTokenLimit: 10000000, features: ["Custom models", "Dedicated support"], price: 299 }
  };

  setupAzureB2CAuth = (app: any) => {
    app.get('/auth/login', async (req: Request, res: Response) => {
      if (!env.AZURE_B2C_REDIRECT_URI) return res.status(500).json({ error: "Redirect URI not configured." });
      const authCodeUrlParameters = { scopes: ["openid", "profile", "email"], redirectUri: env.AZURE_B2C_REDIRECT_URI };
      try {
        const response = await pca.getAuthCodeUrl(authCodeUrlParameters);
        res.redirect(response);
      } catch (error) {
        res.status(500).json({ error: 'Authentication failed' });
      }
    });

    app.get('/auth/callback', async (req: Request, res: Response) => {
      if (!env.AZURE_B2C_REDIRECT_URI) return res.status(500).json({ error: "Redirect URI not configured." });
      const tokenRequest = { code: req.query.code as string, scopes: ["openid", "profile", "email"], redirectUri: env.AZURE_B2C_REDIRECT_URI };
      try {
        const response = await pca.acquireTokenByCode(tokenRequest);
        const userClaims = response.account?.idTokenClaims as any;
        const userData = {
          id: userClaims.sub || userClaims.oid,
          email: userClaims.email || userClaims.preferred_username,
          firstName: userClaims.given_name || '',
          lastName: userClaims.family_name || '',
          profileImageUrl: userClaims.picture || null,
          provider: userClaims.idp || 'microsoft'
        };
        const user = await storage.upsertUser({ ...userData, tier: 'free', monthlyTokenUsage: 0, lastTokenReset: new Date() });
        (req.session as any) = { user, isAuthenticated: true };
        res.redirect('/dashboard');
      } catch (error) {
        res.redirect('/auth/error');
      }
    });

    app.post('/auth/logout', (req: Request, res: Response) => {
      req.session?.destroy(() => {
        if (!env.AZURE_B2C_POST_LOGOUT_REDIRECT_URI) return res.status(500).json({ error: "Logout redirect URI not configured." });
        const logoutUrl = `https://${env.AZURE_B2C_TENANT_NAME}.b2clogin.com/${env.AZURE_B2C_TENANT_NAME}.onmicrosoft.com/${env.AZURE_B2C_POLICY_NAME}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(env.AZURE_B2C_POST_LOGOUT_REDIRECT_URI)}`;
        res.json({ logoutUrl });
      });
    });

    app.get('/api/auth/user', async (req: Request, res: Response) => {
      const session = req.session as any;
      if (!session?.isAuthenticated || !session?.user) return res.status(401).json({ error: 'Not authenticated' });
      const user = await storage.getUser(session.user.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const tierLimits = USER_TIERS[user.tier as keyof typeof USER_TIERS];
      const usagePercentage = Math.round(((user.monthlyTokenUsage || 0) / tierLimits.monthlyTokenLimit) * 100);
      res.json({ ...user, usagePercentage, tokensRemaining: tierLimits.monthlyTokenLimit - (user.monthlyTokenUsage || 0) });
    });

    console.log('✅ Azure B2C authentication configured');
  };

  requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!(req.session as any)?.isAuthenticated) return res.status(401).json({ error: 'Authentication required' });
    next();
  };

  checkTokenUsage = async (req: Request, res: Response, next: NextFunction) => {
    const session = req.session as any;
    if (!session?.user?.id) return res.status(401).json({ error: 'Authentication required' });
    const user = await storage.getUser(session.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const tierLimits = USER_TIERS[user.tier as keyof typeof USER_TIERS];
    if ((user.monthlyTokenUsage || 0) >= tierLimits.monthlyTokenLimit) return res.status(429).json({ error: 'Token limit exceeded' });
    (req as any).userTier = user.tier;
    next();
  };

  trackTokenUsage = async (userId: string, tokensUsed: number) => {
    await storage.updateUserTokenUsage(userId, tokensUsed);
  };
}

export {
  setupAzureB2CAuth,
  requireAuth,
  checkTokenUsage,
  trackTokenUsage,
  SUPPORTED_PROVIDERS,
  USER_TIERS,
};