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
  const redirectUri = process.env.GITHUB_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: "GitHub authentication not configured" });
  }

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