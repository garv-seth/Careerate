#!/bin/bash
# Simple deployment completion script

echo "Checking for new Docker image..."
echo "GitHub Actions: https://github.com/garv-seth/CareerateV0/actions"
echo ""

# Check if image exists
MAX_ATTEMPTS=40
attempt=0

while [ $attempt -lt $MAX_ATTEMPTS ]; do
    attempt=$((attempt + 1))
    echo "Attempt $attempt/$MAX_ATTEMPTS..."

    # Check for image with commit 0690090
    if az acr repository show-tags --name careerateacr --repository careerate-app 2>/dev/null | grep -q "0690090"; then
        echo "✓ New image found!"
        break
    fi

    if [ $attempt -eq $MAX_ATTEMPTS ]; then
        echo "Timeout. Check GitHub Actions manually."
        exit 1
    fi

    echo "Waiting 15s..."
    sleep 15
done

echo ""
echo "Routing traffic to latest revision..."

# Get latest revision
LATEST=$(az containerapp revision list \
    --name careerate-web \
    --resource-group Careerate \
    --query "sort_by([?properties.active==\`true\`], &properties.createdTime)[-1].name" -o tsv)

echo "Latest revision: $LATEST"

# Route 100% traffic
az containerapp ingress traffic set \
    --name careerate-web \
    --resource-group Careerate \
    --revision-weight "$LATEST=100"

echo ""
echo "Waiting 30s for deployment..."
sleep 30

echo ""
echo "Verifying deployment..."

# Check deployed commit
DEPLOYED=$(curl -s https://careerate-web.politetree-6f564ad5.westus2.azurecontainerapps.io/api/health | grep -o '"gitCommit":"[^"]*"' | cut -d'"' -f4)

echo "Deployed commit: $DEPLOYED"

if [ "$DEPLOYED" = "0690090" ] || [[ "$DEPLOYED" == *"0690090"* ]]; then
    echo ""
    echo "SUCCESS! Hydration fix is LIVE!"
    echo ""
    echo "Test now:"
    echo "1. Open: https://gocareerate.com/dashboard#agent (incognito)"
    echo "2. Open DevTools Console (F12)"
    echo "3. No hydration errors should appear!"
else
    echo ""
    echo "Deployed commit: $DEPLOYED (expected 0690090)"
    echo "Wait 1-2 min and check manually."
fi

echo ""
echo "Production: https://gocareerate.com"
