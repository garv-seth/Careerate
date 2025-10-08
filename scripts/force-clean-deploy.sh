#!/bin/bash
# Force Clean Azure Deployment - Nuclear Option
# This script completely cleans Azure Container Apps and ACR, then forces a fresh deployment

set -e  # Exit on any error

RESOURCE_GROUP="Careerate"
CONTAINER_APP="careerate-web"
ACR_NAME="careerateacr"
IMAGE_NAME="careerate-app"

echo "🧹 STEP 1: Deactivating ALL old revisions..."
# Get all revisions except the latest one and deactivate them
az containerapp revision list \
  --name $CONTAINER_APP \
  --resource-group $RESOURCE_GROUP \
  --query "[?properties.active==\`true\`].name" -o tsv | \
  while read revision; do
    echo "  Deactivating: $revision"
    az containerapp revision deactivate \
      --name $CONTAINER_APP \
      --resource-group $RESOURCE_GROUP \
      --revision $revision || echo "  ⚠️  Failed to deactivate $revision"
  done

echo ""
echo "🗑️  STEP 2: Deleting ALL images from Azure Container Registry..."
# Delete the entire repository (all tags)
az acr repository delete \
  --name $ACR_NAME \
  --repository $IMAGE_NAME \
  --yes || echo "⚠️  No images to delete (this is fine)"

echo ""
echo "⏳ STEP 3: Waiting 10 seconds for Azure to process deletions..."
sleep 10

echo ""
echo "🔨 STEP 4: Triggering fresh Docker build..."
# Get current git commit
GIT_SHA=$(git rev-parse HEAD)
TIMESTAMP=$(date +%s)

# Build and push with unique tag
az acr build \
  --registry $ACR_NAME \
  --image $IMAGE_NAME:$GIT_SHA \
  --image $IMAGE_NAME:latest \
  --build-arg CACHE_BUST=$TIMESTAMP \
  --build-arg GIT_COMMIT=$GIT_SHA \
  --build-arg DEPLOY_TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ) \
  --no-cache \
  .

echo ""
echo "🚀 STEP 5: Deploying to Azure Container Apps with NEW revision..."
az containerapp update \
  --name $CONTAINER_APP \
  --resource-group $RESOURCE_GROUP \
  --image $ACR_NAME.azurecr.io/$IMAGE_NAME:$GIT_SHA \
  --revision-suffix deploy-$(date +%Y%m%d-%H%M%S) \
  --set-env-vars "CACHE_BUST=$TIMESTAMP" "GIT_COMMIT=$GIT_SHA"

echo ""
echo "⏳ STEP 6: Waiting 30 seconds for deployment to stabilize..."
sleep 30

echo ""
echo "✅ STEP 7: Setting 100% traffic to latest revision..."
LATEST_REVISION=$(az containerapp revision list \
  --name $CONTAINER_APP \
  --resource-group $RESOURCE_GROUP \
  --query "sort_by([?properties.active==\`true\`], &properties.createdTime)[-1].name" -o tsv)

echo "  Latest active revision: $LATEST_REVISION"

az containerapp ingress traffic set \
  --name $CONTAINER_APP \
  --resource-group $RESOURCE_GROUP \
  --revision-weight $LATEST_REVISION=100

echo ""
echo "🔍 STEP 8: Verification..."
APP_URL=$(az containerapp show --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv)
echo "  App URL: https://$APP_URL"

# Test the deployment
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$APP_URL" || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
  echo "  ✅ Deployment successful! App is responding."
else
  echo "  ⚠️  App returned HTTP $HTTP_STATUS (may still be starting)"
fi

echo ""
echo "🎉 CLEAN DEPLOYMENT COMPLETE!"
echo ""
echo "📋 Next steps:"
echo "  1. Visit: https://$APP_URL"
echo "  2. Hard refresh (Ctrl+F5) to clear browser cache"
echo "  3. Check browser console to verify the error is fixed"
echo ""
echo "🔧 If you still see the old code:"
echo "  - Clear browser cache completely"
echo "  - Try incognito mode"
echo "  - Check deployed commit: curl https://$APP_URL/api/health | jq '.gitCommit'"
