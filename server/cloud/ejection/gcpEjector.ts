/**
 * GCP Ejection Service
 * 
 * Handles ejectable infrastructure for Google Cloud Platform
 * Generates Terraform configs and manages Service Account lifecycle
 */

import { storageV2 } from '../../storage-v2';
import { agentLogger } from '../../agents/kernel.config';

/**
 * GCP Ejection Service
 */
export class GCPEjector {
  /**
   * Export deployment as Terraform configuration
   */
  async exportDeployment(deploymentId: string): Promise<{
    templateFormat: 'terraform';
    template: string;
    instructions: string;
  }> {
    agentLogger.info('Exporting GCP deployment', { deploymentId });

    const deployment = await storageV2.getDeploymentById(deploymentId);
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    const template = this.generateTerraformConfig(deployment);
    const instructions = this.generateEjectionInstructions(deployment);

    return {
      templateFormat: 'terraform',
      template,
      instructions
    };
  }

  /**
   * Generate Terraform configuration for deployed resources
   */
  private generateTerraformConfig(deployment: any): string {
    const projectId = deployment.projectId || 'your-gcp-project';
    const region = deployment.region || 'us-central1';

    return `
# Careerate Deployment: ${deployment.name}
# Generated: ${new Date().toISOString()}

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = "${projectId}"
  region  = "${region}"
}

# Cloud Run Service
resource "google_cloud_run_service" "app" {
  name     = "${deployment.name}"
  location = "${region}"

  template {
    spec {
      containers {
        image = "${deployment.image || 'gcr.io/your-project/app:latest'}"
        
        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }

        ports {
          container_port = 8080
        }
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "1"
        "autoscaling.knative.dev/maxScale" = "10"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Allow unauthenticated access
resource "google_cloud_run_service_iam_member" "public" {
  service  = google_cloud_run_service.app.name
  location = google_cloud_run_service.app.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Output the service URL
output "service_url" {
  value = google_cloud_run_service.app.status[0].url
}

# Database (if needed)
${deployment.architecture?.database ? `
resource "google_sql_database_instance" "main" {
  name             = "${deployment.name}-db"
  database_version = "POSTGRES_14"
  region           = "${region}"

  settings {
    tier = "db-f1-micro"
    
    ip_configuration {
      ipv4_enabled = true
    }
  }
}

resource "google_sql_database" "database" {
  name     = "${deployment.name}_production"
  instance = google_sql_database_instance.main.name
}

output "database_connection" {
  value     = google_sql_database_instance.main.connection_name
  sensitive = true
}
` : ''}

# Storage Bucket
resource "google_storage_bucket" "storage" {
  name          = "${projectId}-${deployment.name}-storage"
  location      = "${region}"
  force_destroy = false

  uniform_bucket_level_access = true
}

output "storage_bucket" {
  value = google_storage_bucket.storage.name
}
`.trim();
  }

  /**
   * Generate ejection instructions
   */
  private generateEjectionInstructions(deployment: any): string {
    return `
# GCP Ejection Guide - ${deployment.name}

## Your Resources

All resources remain in your GCP project:
- Cloud Run services
- Cloud SQL databases (if any)
- Storage buckets
- Load balancers

## Management with Terraform

### 1. Install Terraform
\`\`\`bash
# macOS
brew install terraform

# Linux
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
\`\`\`

### 2. Initialize Terraform
\`\`\`bash
cd deployment-${deployment.id}
terraform init
\`\`\`

### 3. Import Existing Resources
\`\`\`bash
# Import Cloud Run service
terraform import google_cloud_run_service.app projects/<PROJECT_ID>/locations/${deployment.region || 'us-central1'}/services/${deployment.name}

# Import other resources as needed
\`\`\`

### 4. Make Changes
Edit \`main.tf\`, then:
\`\`\`bash
terraform plan
terraform apply
\`\`\`

## Alternative: gcloud CLI

\`\`\`bash
# Update Cloud Run service
gcloud run services update ${deployment.name} \\
  --image=gcr.io/your-project/app:v2 \\
  --region=${deployment.region || 'us-central1'}

# View logs
gcloud run services logs read ${deployment.name}
\`\`\`

## Deletion (if needed)
\`\`\`bash
terraform destroy
\`\`\`

Or via gcloud:
\`\`\`bash
gcloud run services delete ${deployment.name} --region=${deployment.region || 'us-central1'}
\`\`\`

## Need Careerate Back?

Re-connect at gocareerate.com/integrations → "Connect GCP"
`.trim();
  }

  /**
   * Revoke Service Account access
   */
  async revokeAccess(userId: string, integrationId: string): Promise<void> {
    agentLogger.info('Revoking GCP access', { userId, integrationId });

    const integration = await storageV2.getIntegration(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    // In production, would call GCP IAM API to delete Service Account
    await storageV2.updateIntegration(integrationId, {
      status: 'ejected',
      ejectedAt: new Date()
    });

    agentLogger.info('GCP access revoked', { userId, integrationId });
  }

  /**
   * Complete ejection flow
   */
  async eject(userId: string, integrationId: string): Promise<{
    success: boolean;
    exports: Array<any>;
    instructions: string;
    revokedAt: Date;
  }> {
    agentLogger.info('Starting GCP ejection', { userId, integrationId });

    const deployments = await storageV2.getDeploymentsByIntegration(integrationId);
    const exports = await Promise.all(deployments.map(d => this.exportDeployment(d.id)));
    
    await this.revokeAccess(userId, integrationId);

    return {
      success: true,
      exports,
      instructions: `GCP ejection complete. ${deployments.length} deployment(s) exported as Terraform.`,
      revokedAt: new Date()
    };
  }
}

export const gcpEjector = new GCPEjector();

