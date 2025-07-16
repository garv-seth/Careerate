import { Router } from "express";
import { AuthService } from "./auth-providers";

const router = Router();
const authService = new AuthService();

// Azure AD OAuth2 Routes
router.get("/auth/azure", (req, res) => {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const redirectUri = process.env.AZURE_REDIRECT_URI;
  
  if (!tenantId || !clientId || !redirectUri) {
    return res.status(500).json({ error: "Azure authentication not configured" });
  }

  const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=openid profile email https://graph.microsoft.com/user.read&` +
    `state=${Date.now()}`;

  res.redirect(authUrl);
});

router.get("/auth/azure/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: "Authorization code not provided" });
    }

    const userInfo = await authService.authenticateAzure(code as string);
    
    // Store user session
    req.session = req.session || {};
    (req.session as any).user = userInfo;
    (req.session as any).isAuthenticated = true;

    res.redirect("/");
  } catch (error) {
    console.error("Azure authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// GitHub OAuth Routes
router.get("/auth/github", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  
  if (!clientId) {
    return res.status(500).json({ error: "GitHub authentication not configured" });
  }

  // Use the current domain for redirect URI
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.headers.host;
  const redirectUri = `${protocol}://${host}/api/auth/github/callback`;

  const authUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=repo user&` +
    `state=${Date.now()}`;

  res.redirect(authUrl);
});

router.get("/auth/github/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: "Authorization code not provided" });
    }

    const userInfo = await authService.authenticateGitHub(code as string);
    
    // Store user session
    req.session = req.session || {};
    (req.session as any).user = userInfo;
    (req.session as any).isAuthenticated = true;

    res.redirect("/");
  } catch (error) {
    console.error("GitHub authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// AWS OAuth Routes (using AWS Cognito)
router.get("/auth/aws", (req, res) => {
  const cognitoDomain = process.env.AWS_COGNITO_DOMAIN;
  const cognitoClientId = process.env.AWS_COGNITO_CLIENT_ID;
  const awsRegion = process.env.AWS_REGION || 'us-east-1';
  const redirectUri = process.env.AWS_REDIRECT_URI;
  
  if (!cognitoDomain || !cognitoClientId || !redirectUri) {
    return res.status(500).json({ error: "AWS authentication not configured" });
  }

  const authUrl = `https://${cognitoDomain}.auth.${awsRegion}.amazoncognito.com/oauth2/authorize?` +
    `client_id=${cognitoClientId}&` +
    `response_type=code&` +
    `scope=openid profile email&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `state=${Date.now()}`;

  res.redirect(authUrl);
});

router.get("/auth/aws/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: "Authorization code not provided" });
    }

    const cognitoDomain = process.env.AWS_COGNITO_DOMAIN;
    const cognitoClientId = process.env.AWS_COGNITO_CLIENT_ID;
    const cognitoClientSecret = process.env.AWS_COGNITO_CLIENT_SECRET;
    const awsRegion = process.env.AWS_REGION || 'us-east-1';
    const redirectUri = process.env.AWS_REDIRECT_URI;

    // Exchange code for tokens
    const tokenResponse = await fetch(`https://${cognitoDomain}.auth.${awsRegion}.amazoncognito.com/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: cognitoClientId!,
        client_secret: cognitoClientSecret!,
        code: code as string,
        redirect_uri: redirectUri!,
      }),
    });

    const tokens = await tokenResponse.json();
    
    // Get user info
    const userResponse = await fetch(`https://${cognitoDomain}.auth.${awsRegion}.amazoncognito.com/oauth2/userInfo`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const userInfo = await userResponse.json();
    
    const user = {
      id: userInfo.sub,
      username: userInfo.username || userInfo.email,
      name: userInfo.name || userInfo.username,
      email: userInfo.email,
      provider: 'aws',
      accessToken: tokens.access_token,
    };

    // Store user session
    req.session = req.session || {};
    (req.session as any).user = user;
    (req.session as any).isAuthenticated = true;

    res.redirect("/");
  } catch (error) {
    console.error("AWS authentication error:", error);
    res.status(500).json({ error: "AWS authentication failed" });
  }
});

// Google Cloud OAuth Routes
router.get("/auth/gcp", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: "Google Cloud authentication not configured" });
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=openid email profile https://www.googleapis.com/auth/cloud-platform&` +
    `access_type=offline&` +
    `prompt=consent&` +
    `state=${Date.now()}`;

  res.redirect(authUrl);
});

router.get("/auth/gcp/callback", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: "Authorization code not provided" });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId!,
        client_secret: clientSecret!,
        code: code as string,
        redirect_uri: redirectUri!,
      }),
    });

    const tokens = await tokenResponse.json();
    
    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const userInfo = await userResponse.json();
    
    const user = {
      id: userInfo.id,
      username: userInfo.email,
      name: userInfo.name,
      email: userInfo.email,
      avatar: userInfo.picture,
      provider: 'gcp',
      accessToken: tokens.access_token,
    };

    // Store user session
    req.session = req.session || {};
    (req.session as any).user = user;
    (req.session as any).isAuthenticated = true;

    res.redirect("/");
  } catch (error) {
    console.error("Google Cloud authentication error:", error);
    res.status(500).json({ error: "Google Cloud authentication failed" });
  }
});

// Get current user
router.get("/auth/user", (req, res) => {
  const session = req.session as any;
  if (session?.isAuthenticated && session?.user) {
    res.json(session.user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// Logout
router.post("/auth/logout", (req, res) => {
  req.session?.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

export default router;