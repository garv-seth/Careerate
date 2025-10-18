import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

const AZURE_AUTH_ENABLED = !!(process.env.AZURE_TENANT_ID && process.env.AZURE_CLIENT_ID);

if (!AZURE_AUTH_ENABLED) {
  console.warn("⚠️  Azure AD authentication is disabled - AZURE_TENANT_ID or AZURE_CLIENT_ID not provided");
  console.warn("   App will run in development mode without Azure AD authentication");
}

interface UserPayload {
  sub?: string;
  oid?: string;
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
}

export function getSession() {
  const sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 days
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    // Ensure the sessions table is created automatically in new environments
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || 'dev-fallback-secret-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    proxy: true, // CRITICAL: Trust reverse proxy (Azure Container Apps)
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for OAuth in production
    },
  });
}

export async function upsertUser(payload: UserPayload) {
  try {
    console.log('Upserting user with payload:', payload);
    const fullName = payload.name || [payload.given_name, payload.family_name].filter(Boolean).join(' ') || (payload.preferred_username || payload.email || '');

    const userToUpsert = {
      id: payload.sub || payload.oid || '',
      email: payload.preferred_username || payload.email || '',
      name: fullName,
      metadata: {
        authProvider: payload.oid ? 'azure-ad' : (payload.sub?.startsWith('github-') ? 'github' : 'oauth'),
        given_name: payload.given_name,
        family_name: payload.family_name,
        preferred_username: payload.preferred_username,
      }
    };

    console.log('User object to upsert:', userToUpsert);
    const dbUser = await storage.upsertUser(userToUpsert as any);
    console.log('User upserted successfully:', dbUser);
    return dbUser;
  } catch (error) {
    console.error('Error upserting user:', error);
    throw error;
  }
}

export async function setupAuth(app: Express) {
  console.log('=== Setting up Authentication ===');
  console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    AZURE_TENANT_ID: process.env.AZURE_TENANT_ID ? 'set' : 'missing',
    AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID ? 'set' : 'missing',
    AZURE_CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET ? 'set' : 'missing',
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? 'set' : 'missing',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? 'set' : 'missing',
    DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'missing',
    SESSION_SECRET: process.env.SESSION_SECRET ? 'set' : 'missing'
  });

  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Auth status endpoint for debugging
  app.get('/api/auth/status', (req, res) => {
    res.json({
      isAuthenticated: req.isAuthenticated(),
      user: req.user || null,
      session: {
        id: req.sessionID,
        exists: !!req.session
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        AZURE_TENANT_ID: process.env.AZURE_TENANT_ID ? 'configured' : 'missing',
        AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID ? 'configured' : 'missing',
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? 'configured' : 'missing'
      }
    });
  });

  // Microsoft OAuth login redirect (using Azure AD)
  app.get("/api/login", (req, res) => {
    const clientId = process.env.AZURE_CLIENT_ID;
    const baseUrl = (process.env.BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, "");
    const redirectUri = encodeURIComponent(`${baseUrl}/api/callback`);

    console.log('Microsoft OAuth Login attempt (personal accounts enabled):', { clientId: clientId ? 'set' : 'missing', redirectUri });

    if (!clientId) {
      console.error("Azure AD client ID missing. Expected AZURE_CLIENT_ID");
      return res.status(500).json({
        error: "Microsoft authentication is temporarily unavailable",
        details: "Azure AD configuration incomplete"
      });
    }

    // Use "common" endpoint to allow BOTH personal and work/school accounts
    // NOT using specific tenantId to avoid restricting to organizational accounts only
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${redirectUri}&` +
      `response_mode=query&` +
      `scope=openid%20profile%20email%20offline_access&` +
      `state=12345`;

    console.log('Azure AD Auth URL (allows personal accounts):', authUrl);
    res.redirect(authUrl);
  });

  // Microsoft OAuth login redirect (alias for /api/login)
  app.get("/api/login/microsoft", (req, res) => {
    const clientId = process.env.AZURE_CLIENT_ID;
    const baseUrl = (process.env.BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, "");
    const redirectUri = encodeURIComponent(`${baseUrl}/api/callback`);

    console.log('Microsoft OAuth Login attempt (personal accounts enabled):', { clientId: clientId ? 'set' : 'missing', redirectUri });

    if (!clientId) {
      console.error("Azure AD client ID missing. Expected AZURE_CLIENT_ID");
      return res.status(500).json({
        error: "Microsoft authentication is temporarily unavailable",
        details: "Azure AD configuration incomplete"
      });
    }

    // Use "common" endpoint to allow BOTH personal and work/school accounts
    // NOT using specific tenantId to avoid restricting to organizational accounts only
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${redirectUri}&` +
      `response_mode=query&` +
      `scope=openid%20profile%20email%20offline_access&` +
      `state=12345`;

    console.log('Azure AD Auth URL (allows personal accounts):', authUrl);
    res.redirect(authUrl);
  });

  // Microsoft OAuth callback (Azure AD)
  app.get("/api/callback", async (req, res) => {
    console.log('=== Microsoft OAuth Callback ===');
    console.log('Full request URL:', req.url);
    console.log('Query params:', req.query);
    console.log('Headers host:', req.get('host'));
    console.log('Protocol:', req.protocol);

    const { code, state, error, error_description } = req.query;

    // Check for OAuth errors first
    if (error) {
      console.error('OAuth error received:', { error, error_description });
      return res.status(400).json({
        error: 'OAuth error',
        details: { error, error_description }
      });
    }

    if (!code) {
      console.error('No authorization code received');
      return res.status(400).json({ error: "Authorization code not received" });
    }

    console.log('Authorization code received:', code ? 'YES' : 'NO');

    try {
      // Exchange code for tokens using Azure AD (use "common" to support personal accounts)
      const tokenUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/token`;
      const baseUrl = (process.env.BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, "");
      const redirectUri = `${baseUrl}/api/callback`;

      const tokenParams = new URLSearchParams({
        client_id: process.env.AZURE_CLIENT_ID!,
        client_secret: process.env.AZURE_CLIENT_SECRET!,
        scope: 'openid profile email offline_access',
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      });

      console.log('Token exchange attempt:', {
        tokenUrl,
        redirectUri,
        clientId: process.env.AZURE_CLIENT_ID ? 'set' : 'missing',
        clientSecret: process.env.AZURE_CLIENT_SECRET ? 'set' : 'missing',
        tenantId: process.env.AZURE_TENANT_ID
      });

      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: tokenParams
      });

      console.log('Token response status:', tokenResponse.status);
      console.log('Token response headers:', Object.fromEntries(tokenResponse.headers.entries()));

      const tokens = await tokenResponse.json();
      console.log('Token response body:', tokens);

      if (tokens.error) {
        console.error('Token exchange error:', tokens);
        return res.status(400).json({
          error: 'Token exchange failed',
          details: tokens
        });
      }

      // Decode the ID token to get user info
      const idToken = tokens.id_token;
      if (!idToken) {
        console.error('No ID token received in response');
        return res.status(400).json({ error: 'No ID token received' });
      }

      console.log('ID token received:', idToken ? 'YES' : 'NO');

      const payload: UserPayload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
      console.log('Decoded user payload:', payload);

      console.log('Upserting user...');
      let dbUser;
      try {
        dbUser = await upsertUser(payload);
        console.log('User upserted successfully:', dbUser);
      } catch (upsertError) {
        console.error('Microsoft user upsert failed:', upsertError);

        // Try to find existing user by email as fallback
        try {
          const existingUser = await storage.getUserByEmail(payload.preferred_username || payload.email || '');
          if (existingUser) {
            console.log('Found existing user by email, using that instead:', existingUser);
            dbUser = existingUser;
          } else {
            throw upsertError;
          }
        } catch (fallbackError) {
          console.error('Fallback user lookup failed:', fallbackError);
          throw upsertError;
        }
      }

      // Store user in session (use the database user object, not the OAuth payload)
      console.log('Attempting session login...');
      req.login(dbUser, (err) => {
        if (err) {
          console.error('Session login error:', err);
          return res.status(500).json({ error: 'Login failed', details: err.message });
        }
      console.log('Session login successful, ensuring identity integration...');
      (async () => {
        try {
          const userId = (dbUser as any).id;
          // Upsert identity integration for Microsoft
          const existing = await storage.getUserIntegrations(userId).then(list => list.find(i => i.type === 'identity' && i.service === 'microsoft'));
        if (!existing) {
          await storage.createIntegration({
            userId,
            projectId: null,
            name: 'Microsoft Account',
            type: 'identity',
            service: 'microsoft',
            category: 'identity',
            connectionType: 'oauth',
            status: 'active',
            configuration: {
              upn: payload.preferred_username || payload.email,
              name: payload.name,
            },
            endpoints: {},
            permissions: [],
            rateLimits: {},
            healthCheck: { enabled: false, interval: 0, timeout: 0, retries: 0 },
            isEnabled: true,
            autoRotate: false,
            metadata: {}
          } as any);
        }
        } catch (e) {
          console.warn('Failed to upsert Microsoft identity integration (non-fatal):', e);
        }
      })(); // Execute async IIFE immediately but don't wait
      console.log('Redirecting to /dashboard');
      res.redirect('/dashboard');
      });

    } catch (error) {
      console.error('=== Microsoft OAuth Error ===');
      console.error('Error:', error);
      console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({
        error: 'Authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Logout endpoint (handles both Azure AD and GitHub OAuth)
  app.get("/api/logout", (req, res) => {
    const baseUrl = (process.env.BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, "");

    // Check if user is logged in via Azure AD
    const isAzureUser = req.user && (req.user as any).oid;

    req.logout(() => {
      // Clear session
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error('Session destruction error:', err);
          }
        });
      }

      // If Azure AD user, redirect through Azure logout
      if (isAzureUser && process.env.AZURE_TENANT_ID) {
        const logoutUrl = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/logout?` +
          `post_logout_redirect_uri=${encodeURIComponent(baseUrl)}`;
        return res.redirect(logoutUrl);
      }

      // For GitHub users or unauthenticated, redirect directly to landing page
      res.redirect("/");
    });
  });

  // GitHub OAuth login
  app.get("/api/login/github", (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return res.status(500).send("GitHub auth not configured");
    }

    // Use the configured redirect URI from environment or fallback to request host
    const configuredRedirectUri = process.env.GITHUB_REDIRECT_URI;
    const redirectUri = configuredRedirectUri || `${req.protocol}://${req.get('host')}/api/callback/github`;

    console.log('GitHub OAuth redirect URI:', redirectUri);
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user user:email`;
    res.redirect(authUrl);
  });

  // GitHub OAuth callback is defined in server/routes.ts.
  // This duplicate route caused session/login inconsistencies and 401s after GitHub connect.
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  next();
};