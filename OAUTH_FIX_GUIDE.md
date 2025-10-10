# OAuth Configuration Fix Guide

## Issues Found

### 1. GitHub OAuth - "GitHub auth not configured"
**Problem:** Missing `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` environment variables

**Solution:** Add to Azure Container App environment

### 2. Microsoft OAuth - Redirect URI Mismatch
**Problem:** Azure AD expects redirect URI but `https://gocareerate.com/api/callback` is not in allowed list

**Current Error:**
```
AADSTS50011: The redirect URI 'https://gocareerate.com/api/callback' specified in the request does not match the redirect URIs configured for the application 'e8b1c661-2139-4583-a4ca-ce0c1cb946b1'.
```

**Solution:** Add redirect URI to Azure AD App Registration

---

## Fix Steps

### Step 1: Add GitHub OAuth to Azure AD App Registration

1. Go to https://portal.azure.com
2. Navigate to: Azure Active Directory → App registrations
3. Find app: `e8b1c661-2139-4583-a4ca-ce0c1cb946b1`
4. Go to "Certificates & secrets"
5. Create new client secret for GitHub OAuth
6. Go to GitHub OAuth Apps: https://github.com/settings/developers
7. Create new OAuth App:
   - Application name: Careerate Production
   - Homepage URL: https://gocareerate.com
   - Authorization callback URL: https://gocareerate.com/api/callback/github
8. Copy Client ID and Client Secret

### Step 2: Add Microsoft Redirect URI

1. Still in Azure AD App Registration (`e8b1c661-2139-4583-a4ca-ce0c1cb946b1`)
2. Go to "Authentication"
3. Click "Add a platform" → "Web"
4. Add redirect URI: `https://gocareerate.com/api/callback`
5. Enable "ID tokens" and "Access tokens"
6. Save

### Step 3: Update Container App Environment Variables

Run these commands:

```bash
# Add GitHub OAuth credentials
az containerapp update \
  --name careerate-web \
  --resource-group Careerate \
  --set-env-vars \
    GITHUB_CLIENT_ID="<your-github-client-id>" \
    GITHUB_CLIENT_SECRET="<your-github-client-secret>"

# Verify
az containerapp show --name careerate-web --resource-group Careerate --query "properties.template.containers[0].env" -o table
```

---

## Quick Fix Commands

After getting GitHub OAuth credentials from https://github.com/settings/developers:

```bash
# Replace with actual values
export GITHUB_CLIENT_ID="your_github_client_id_here"
export GITHUB_CLIENT_SECRET="your_github_secret_here"

az containerapp update \
  --name careerate-web \
  --resource-group Careerate \
  --set-env-vars \
    GITHUB_CLIENT_ID="$GITHUB_CLIENT_ID" \
    GITHUB_CLIENT_SECRET="$GITHUB_CLIENT_SECRET"
```

---

## Alternative: Store in Azure Key Vault

```bash
# Store GitHub credentials in Key Vault
az keyvault secret set \
  --vault-name CareeerateSecretsVault \
  --name GITHUB-CLIENT-ID \
  --value "<your-github-client-id>"

az keyvault secret set \
  --vault-name CareeerateSecretsVault \
  --name GITHUB-CLIENT-SECRET \
  --value "<your-github-client-secret>"

# The app will load from Key Vault on next restart
az containerapp revision restart \
  --name careerate-web \
  --resource-group Careerate
```

---

## Testing After Fix

### Test GitHub OAuth
```bash
curl -I https://gocareerate.com/api/login/github
# Should redirect to github.com
```

### Test Microsoft OAuth
```bash
curl -I https://gocareerate.com/api/login
# Should redirect to login.microsoftonline.com
```

### Test in Browser
1. Go to https://gocareerate.com
2. Click "Sign In"
3. Try "Continue with GitHub" → Should redirect to GitHub authorization
4. Try "Continue with Microsoft" → Should redirect to Microsoft login (no redirect URI error)

---

## Current Status

✅ Cookie consent - Fixed (centered, responsive)
✅ Login button text - Fixed ("Continue with Microsoft")
✅ Import from GitHub - Already routes to GitHub OAuth
⏳ GitHub OAuth - Needs credentials added
⏳ Microsoft OAuth - Needs redirect URI added to Azure AD

---

## Files Changed (Ready to Deploy)

- `client/src/components/CookieConsent.tsx` - Fixed positioning
- `client/src/components/LoginModal.tsx` - Fixed button text consistency

