import { ConfidentialClientApplication, Configuration } from "@azure/msal-node";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/environment";
import { storage } from "../storage";

// Azure B2C Configuration
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
      logLevel: env.NODE_ENV === 'development' ? 3 : 1, // Verbose in dev, Error in prod
    }
  }
};

const pca = new ConfidentialClientApplication(msalConfig);

// Supported OAuth providers for B2C
export const SUPPORTED_PROVIDERS = {
  microsoft: {
    name: "Microsoft",
    scope: ["openid", "profile", "email"],
    icon: "microsoft",
    enabled: true
  },
  github: {
    name: "GitHub", 
    scope: ["openid", "profile", "email"],
    icon: "github",
    enabled: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET)
  },
  google: {
    name: "Google",
    scope: ["openid", "profile", "email"], 
    icon: "google",
    enabled: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
  },
  gitlab: {
    name: "GitLab",
    scope: ["openid", "profile", "email"],
    icon: "gitlab", 
    enabled: !!(env.GITLAB_CLIENT_ID && env.GITLAB_CLIENT_SECRET)
  }
};

// User tier management
export const USER_TIERS = {
  free: {
    name: "Free",
    monthlyTokenLimit: 10000, // 10K tokens/month
    features: [
      "Basic repository analysis",
      "Simple deployment plans", 
      "Community support",
      "Ministral-3B AI model",
      "Limited cloud integrations"
    ],
    price: 0,
    limitations: [
      "Limited to 10K AI tokens per month",
      "Basic AI model (Ministral-3B)",
      "No advanced optimizations",
      "Community support only"
    ]
  },
  pro: {
    name: "Pro",
    monthlyTokenLimit: 1000000, // 1M tokens/month  
    features: [
      "Advanced repository analysis with Phi-4",
      "Comprehensive deployment strategies",
      "Multi-cloud infrastructure optimization", 
      "Priority support",
      "Full cloud provider integrations",
      "Cost optimization insights",
      "Advanced monitoring & alerts"
    ],
    price: 29,
    benefits: [
      "45x more AI tokens (1M vs 10K)",
      "Phi-4 reasoning model (vs Ministral-3B)",
      "Advanced multi-cloud strategies",
      "Priority email support",
      "Cost optimization analysis"
    ]
  },
  enterprise: {
    name: "Enterprise",
    monthlyTokenLimit: 10000000, // 10M tokens/month
    features: [
      "Everything in Pro",
      "Custom AI model fine-tuning",
      "Dedicated infrastructure",
      "24/7 phone support",
      "Custom integrations",
      "SLA guarantees",
      "Team collaboration features"
    ],
    price: 299,
    benefits: [
      "10x Pro token limits",
      "Custom AI model training",
      "Dedicated support engineer",
      "99.9% uptime SLA",
      "Custom integrations"
    ]
  }
};

// Initialize B2C authentication routes
export const setupAzureB2CAuth = (app: any) => {
  // Login initiation
  app.get('/auth/login', async (req: Request, res: Response) => {
    try {
      const authCodeUrlParameters = {
        scopes: ["openid", "profile", "email"],
        redirectUri: env.AZURE_B2C_REDIRECT_URI,
      };

      const response = await pca.getAuthCodeUrl(authCodeUrlParameters);
      res.redirect(response);
    } catch (error) {
      console.error('B2C login initiation failed:', error);
      res.status(500).json({ error: 'Authentication initiation failed' });
    }
  });

  // OAuth callback handler
  app.get('/auth/callback', async (req: Request, res: Response) => {
    try {
      const tokenRequest = {
        code: req.query.code as string,
        scopes: ["openid", "profile", "email"],
        redirectUri: env.AZURE_B2C_REDIRECT_URI,
      };

      const response = await pca.acquireTokenByCode(tokenRequest);
      const userClaims = response.account?.idTokenClaims as any;

      if (!userClaims) {
        throw new Error('No user claims received');
      }

      // Extract user information
      const userData = {
        id: userClaims.sub || userClaims.oid,
        email: userClaims.email || userClaims.preferred_username,
        firstName: userClaims.given_name || '',
        lastName: userClaims.family_name || '',
        profileImageUrl: userClaims.picture || null,
        provider: userClaims.idp || 'microsoft'
      };

      // Create or update user with free tier as default
      const user = await storage.upsertUser({
        ...userData,
        tier: 'free', // All new users start on free tier
        monthlyTokenUsage: 0,
        lastTokenReset: new Date()
      });

      // Store in session
      req.session = req.session || {};
      (req.session as any).user = { ...user, provider: userData.provider };
      (req.session as any).isAuthenticated = true;

      // Redirect based on user tier
      const redirectUrl = user.tier === 'free' ? '/dashboard?welcome=true&tier=free' : '/dashboard';
      res.redirect(redirectUrl);

    } catch (error) {
      console.error('B2C callback failed:', error);
      res.redirect('/auth/error?message=authentication_failed');
    }
  });

  // Logout
  app.post('/auth/logout', (req: Request, res: Response) => {
    req.session?.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      
      // Redirect to B2C logout endpoint
      const logoutUrl = `https://${env.AZURE_B2C_TENANT_NAME}.b2clogin.com/${env.AZURE_B2C_TENANT_NAME}.onmicrosoft.com/${env.AZURE_B2C_POLICY_NAME}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(env.AZURE_B2C_POST_LOGOUT_REDIRECT_URI)}`;
      res.json({ logoutUrl });
    });
  });

  // User info endpoint with tier information
  app.get('/api/auth/user', async (req: Request, res: Response) => {
    try {
      const session = req.session as any;
      if (!session?.isAuthenticated || !session?.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get fresh user data with usage info
      const user = await storage.getUser(session.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Calculate usage percentage
      const tierLimits = USER_TIERS[user.tier as keyof typeof USER_TIERS];
      const usagePercentage = Math.round((user.monthlyTokenUsage || 0) / tierLimits.monthlyTokenLimit * 100);
      
      res.json({
        ...user,
        tierInfo: tierLimits,
        usagePercentage,
        tokensRemaining: tierLimits.monthlyTokenLimit - (user.monthlyTokenUsage || 0),
        needsUpgrade: usagePercentage > 80
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user information' });
    }
  });

  console.log('✅ Azure B2C authentication configured');
};

// Middleware to check authentication and user tier
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as any;
  if (!session?.isAuthenticated) {
    return res.status(401).json({ 
      error: 'Authentication required',
      loginUrl: '/auth/login' 
    });
  }
  next();
};

// Middleware to check token usage limits
export const checkTokenUsage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as any;
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await storage.getUser(session.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const tierLimits = USER_TIERS[user.tier as keyof typeof USER_TIERS];
    const currentUsage = user.monthlyTokenUsage || 0;

    if (currentUsage >= tierLimits.monthlyTokenLimit) {
      return res.status(429).json({
        error: 'Monthly token limit exceeded',
        currentUsage,
        limit: tierLimits.monthlyTokenLimit,
        upgradeUrl: '/pricing',
        message: `You've reached your ${tierLimits.name} tier limit of ${tierLimits.monthlyTokenLimit.toLocaleString()} tokens. Upgrade to continue using advanced features.`
      });
    }

    // Add user tier info to request for AI model selection
    (req as any).userTier = user.tier;
    (req as any).userId = user.id;
    
    next();
  } catch (error) {
    console.error('Token usage check failed:', error);
    res.status(500).json({ error: 'Usage validation failed' });
  }
};

// Track token usage for billing
export const trackTokenUsage = async (userId: string, tokensUsed: number) => {
  try {
    await storage.updateUserTokenUsage(userId, tokensUsed);
    console.log(`📊 Tracked ${tokensUsed} tokens for user ${userId}`);
  } catch (error) {
    console.error('Failed to track token usage:', error);
  }
};