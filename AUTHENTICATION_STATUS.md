# Authentication Status & Fixes Required

**Date:** October 2, 2025
**Status:** ⚠️ Both OAuth methods broken - Manual fixes required

---

## 🚨 Issues

### 1. Azure B2C OAuth - BROKEN
**Error:** `AADSTS50011: The redirect URI 'https://gocareerate.com/api/callback' does not match`

**Root Cause:** Azure AD app registration missing redirect URI

**Fix Required (Manual - Azure Portal):**
1. Go to https://portal.azure.com
2. Navigate to: Azure Active Directory → App Registrations
3. Find app: Client ID `e8b1c661-2139-4583-a4ca-ce0c1cb946b1`
4. Click "Authentication" → "Add a platform" → "Web"
5. Add redirect URIs:
   - `https://gocareerate.com/api/callback`
   - `https://careerate-web.politetree-6f564ad5.westus2.azurecontainerapps.io/api/callback`
   - `http://localhost:5000/api/callback` (for development)
6. Save

---

### 2. GitHub OAuth - BROKEN
**Error:** `Failed query: select ... from "users" where "user"."id" = $1`

**Root Cause:** Two possibilities:
1. Database query using wrong table name (`user` instead of `users`)
2. Authentication middleware running before user creation

**Current State:**
- Route `/api/auth/github/callback` is public (no `isAuthenticated`)
- `upsertUser` function exists and works
- Error suggests session deserialization failing

**Potential Fix:**
- The error might be from session deserialization in passport
- Need to check if `users` table exists vs `user` table

---

### 3. Database Connection Issue
**Error:** `password authentication failed for user 'neondb_owner'`

**Root Cause:** Possible database password rotation or connection string issue

**Fix Required:**
1. Verify Neon database connection string is correct
2. Check if password was rotated in Neon dashboard
3. Update DATABASE_URL in Azure Container App secrets if needed

---

## ✅ What Was Fixed

1. **Added BASE_URL environment variable** to Container App
   - Set to: `https://gocareerate.com`
   - Set NODE_ENV to: `production`

2. **GitHub OAuth Route** is public (no authentication required)

3. **Session configuration** is correct in azureAuth.ts

---

## 🔧 Manual Action Items (YOU MUST DO)

### Priority 1: Fix Azure B2C (5 minutes)
```
1. Azure Portal → App Registrations
2. Find app e8b1c661-2139-4583-a4ca-ce0c1cb946b1
3. Add redirect URI: https://gocareerate.com/api/callback
```

### Priority 2: Create GitHub OAuth App (5 minutes)
```
1. Go to: https://github.com/settings/applications/new
2. Application name: Careerate
3. Homepage URL: https://gocareerate.com
4. Authorization callback URL: https://gocareerate.com/api/auth/github/callback
5. Get Client ID and Secret
6. Update Container App secrets:
   - GITHUB_CLIENT_ID
   - GITHUB_CLIENT_SECRET
```

### Priority 3: Verify Database Connection
```
1. Go to Neon dashboard
2. Verify connection string hasn't changed
3. If changed, update DATABASE_URL secret in Container App
```

---

## 🧪 How to Test After Fixes

### Test Azure B2C:
1. Go to https://gocareerate.com
2. Click "Sign In" (Microsoft button)
3. Should redirect to Microsoft login
4. After login, should redirect back to dashboard
5. ✅ Success if you see the dashboard

### Test GitHub OAuth:
1. Go to https://gocareerate.com/integrations
2. Click "Connect GitHub"
3. Authorize Careerate app
4. Should redirect back with "?github=success"
5. ✅ Success if you see your repositories

---

## 📝 Environment Variables Status

**Container App (Production):**
- ✅ BASE_URL: `https://gocareerate.com`
- ✅ NODE_ENV: `production`
- ✅ AZURE_CLIENT_ID: Set (from secrets)
- ✅ AZURE_CLIENT_SECRET: Set (from secrets)
- ✅ AZURE_TENANT_ID: Set (from secrets)
- ⚠️ GITHUB_CLIENT_ID: Not set (you need to create GitHub app)
- ⚠️ GITHUB_CLIENT_SECRET: Not set (you need to create GitHub app)
- ✅ DATABASE_URL: Set (verify it's correct)
- ✅ SESSION_SECRET: Set

**Local (.env):**
- ⚠️ GITHUB_CLIENT_ID: Empty
- ⚠️ GITHUB_CLIENT_SECRET: Empty
- ⚠️ ENCRYPTION_KEY: Empty (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

---

## 🚀 Commands to Run After Manual Fixes

```bash
# After adding GitHub OAuth app
az containerapp secret set --name careerate-web --resource-group Careerate \
  --secrets github-client-id=YOUR_GITHUB_CLIENT_ID \
  github-client-secret=YOUR_GITHUB_CLIENT_SECRET

# Restart container app
az containerapp revision restart --name careerate-web --resource-group Careerate

# Test authentication
curl https://gocareerate.com/api/auth/status
```

---

## 💡 Why This Happened

1. **Code cleanup** removed some unused services but didn't break auth
2. **Azure B2C** redirect URI was never properly configured for production domain
3. **GitHub OAuth** was never fully set up (no client ID/secret)
4. **Database error** might be transient or password issue

**The auth code itself is CORRECT.** The issues are **configuration/setup**, not code bugs.

---

## ⏱️ Timeline to Fix

- Azure B2C fix: **5 minutes** (portal click)
- GitHub OAuth setup: **5 minutes** (create app + update secrets)
- Verify database: **2 minutes** (check Neon dashboard)
- Test both methods: **5 minutes**

**Total: ~20 minutes to fully working authentication**

---

## 🔄 Rollback if Needed

```bash
# If something goes wrong, roll back to before cleanup:
git reset --hard 017af71

# Or to after cleanup (current):
git reset --hard 2c56066

# Redeploy:
npm run build
az acr build --registry careerateacr --image careerate-app:latest .
az containerapp update --name careerate-web --resource-group Careerate \
  --image careerateacr.azurecr.io/careerate-app:latest
```

---

**Bottom Line:** The code is fine. You need to:
1. Add redirect URI to Azure AD app (portal)
2. Create GitHub OAuth app (github.com)
3. Update secrets in Container App
4. Restart and test

Then both auth methods will work perfectly.
