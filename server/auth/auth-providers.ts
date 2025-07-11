import { PublicClientApplication, Configuration } from "@azure/msal-browser";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

// Azure AD B2C Configuration
export interface OIDCConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export const azureConfig: OIDCConfig = {
  tenantId: process.env.AZURE_TENANT_ID!,
  clientId: process.env.AZURE_CLIENT_ID!,
  clientSecret: process.env.AZURE_CLIENT_SECRET!,
  redirectUri: `${process.env.APP_URL}/api/auth/callback/azure`,
  scopes: ["openid", "profile", "email", "offline_access"],
};

// Azure MSAL Configuration
const msalConfig: Configuration = {
  auth: {
    clientId: azureConfig.clientId,
    authority: `https://login.microsoftonline.com/${azureConfig.tenantId}`,
    redirectUri: azureConfig.redirectUri,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

// Server-side Azure client
export const azureServerClient = new ConfidentialClientApplication({
  auth: {
    clientId: azureConfig.clientId,
    clientSecret: azureConfig.clientSecret,
    authority: `https://login.microsoftonline.com/${azureConfig.tenantId}`,
  },
});

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

// GitHub OAuth Configuration
export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('repo');
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');

// Google OAuth Configuration  
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');

// GitLab OAuth Configuration
export interface GitLabConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
}

export const gitlabConfig: GitLabConfig = {
  clientId: process.env.GITLAB_CLIENT_ID!,
  clientSecret: process.env.GITLAB_CLIENT_SECRET!,
  redirectUri: `${process.env.APP_URL}/api/auth/callback/gitlab`,
  scope: 'read_user+read_repository+write_repository',
};

// Gmail API Configuration
export interface GmailConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export const gmailConfig: GmailConfig = {
  clientId: process.env.GMAIL_CLIENT_ID!,
  clientSecret: process.env.GMAIL_CLIENT_SECRET!,
  redirectUri: `${process.env.APP_URL}/api/auth/callback/gmail`,
  scopes: [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
};

// Authentication Service
export class AuthService {
  
  async authenticateGitHub(code: string): Promise<any> {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error("GitHub credentials not configured");
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(`GitHub OAuth error: ${tokenData.error_description}`);
    }

    // Get user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "Careerate-Platform",
      },
    });

    const userData = await userResponse.json();
    
    return {
      id: userData.id,
      username: userData.login,
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar_url,
      provider: "github",
      accessToken: tokenData.access_token,
    };
  }
  
  // Azure AD Authentication
  async authenticateAzure(code: string): Promise<any> {
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const redirectUri = process.env.AZURE_REDIRECT_URI;
    
    if (!tenantId || !clientId || !clientSecret || !redirectUri) {
      throw new Error("Azure credentials not configured");
    }

    // Exchange code for access token
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        scope: "openid profile email https://graph.microsoft.com/user.read",
        code: code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        client_secret: clientSecret,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(`Azure OAuth error: ${tokenData.error_description}`);
    }

    // Get user info from Microsoft Graph
    const userResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();
    
    return {
      id: userData.id,
      username: userData.userPrincipalName,
      name: userData.displayName,
      email: userData.mail || userData.userPrincipalName,
      avatar: userData.profilePicture || null,
      provider: "azure",
      accessToken: tokenData.access_token,
    };
  }

  // GitHub OAuth
  async authenticateGitHub(accessToken: string): Promise<any> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error('GitHub API request failed');
      }

      const userData = await response.json();
      
      // Get user repositories
      const reposResponse = await fetch('https://api.github.com/user/repos', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      const repositories = await reposResponse.json();

      return {
        user: userData,
        repositories,
        accessToken,
      };
    } catch (error) {
      console.error('GitHub authentication error:', error);
      throw new Error('GitHub authentication failed');
    }
  }

  // GitLab OAuth
  async authenticateGitLab(code: string): Promise<any> {
    try {
      const tokenResponse = await fetch('https://gitlab.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: gitlabConfig.clientId,
          client_secret: gitlabConfig.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: gitlabConfig.redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        throw new Error('Failed to obtain GitLab access token');
      }

      // Get user info
      const userResponse = await fetch('https://gitlab.com/api/v4/user', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      const userData = await userResponse.json();

      return {
        user: userData,
        accessToken: tokenData.access_token,
      };
    } catch (error) {
      console.error('GitLab authentication error:', error);
      throw new Error('GitLab authentication failed');
    }
  }

  // Gmail API Authentication
  async authenticateGmail(code: string): Promise<any> {
    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: gmailConfig.clientId,
          client_secret: gmailConfig.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: gmailConfig.redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        throw new Error('Failed to obtain Gmail access token');
      }

      return tokenData;
    } catch (error) {
      console.error('Gmail authentication error:', error);
      throw new Error('Gmail authentication failed');
    }
  }

  // Send email via Gmail API
  async sendEmail(accessToken: string, to: string, subject: string, body: string): Promise<void> {
    try {
      const emailContent = [
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        body,
      ].join('\n');

      const encodedMessage = Buffer.from(emailContent).toString('base64url');

      await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedMessage,
        }),
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Email sending failed');
    }
  }
}

export const authService = new AuthService();