# Terms of Service

**Effective Date**: October 12, 2025  
**Last Updated**: October 12, 2025

Welcome to Careerate. By using our services, you agree to these Terms of Service.

---

## 1. Acceptance of Terms

By accessing or using Careerate ("Service", "Platform", "we", "us"), you agree to be bound by these Terms. If you do not agree, do not use our Service.

## 2. Description of Service

Careerate is an AI-powered deployment platform that:

- Deploys applications to **your cloud accounts** (AWS, Azure, GCP)
- Uses AI agents to automate infrastructure management
- Provides monitoring, cost optimization, and auto-healing
- Allows you to eject and retain full control of your infrastructure

**Important**: We do NOT host your applications. All infrastructure runs in YOUR cloud accounts. You are billed directly by your cloud provider (AWS, Azure, GCP).

## 3. Account Registration

You must:

- Provide accurate, complete information
- Maintain the security of your account
- Be 18+ years old (or have parental consent)
- Notify us immediately of any unauthorized access

## 4. Cloud Account Connections

### Your Responsibility

When you connect a cloud account (AWS, Azure, GCP), you grant Careerate limited permissions to deploy and manage resources on your behalf. You are responsible for:

- All cloud costs incurred
- Resources created in your accounts
- Compliance with your cloud provider's terms
- Monitoring your cloud bills

### Ejection

You can revoke our access anytime ("ejection"). Your infrastructure will continue running in your account, and you can manage it manually using the Infrastructure as Code templates we provide.

## 5. AI Agent Disclaimer

### 5.1 Agent Autonomy Levels

You choose how much control to give our AI agents:

- **Supervised**: Agent asks permission for every action (safest)
- **Semi-Autonomous**: Agent auto-executes low-risk actions, asks for high-risk ones
- **Fully Autonomous**: Agent executes all actions without asking

### 5.2 Liability Disclaimer

**⚠️ IMPORTANT - PLEASE READ CAREFULLY**

AI agents, while powerful, can make mistakes. By using Careerate, especially in Semi-Autonomous or Fully Autonomous modes, you acknowledge and agree:

1. **We are NOT LIABLE for agent errors**, including but not limited to:
   - Unexpected cloud costs
   - Resource misconfigurations
   - Data loss
   - Service outages
   - Security vulnerabilities introduced by the agent

2. **YOU are RESPONSIBLE for**:
   - Monitoring your cloud accounts and bills
   - Setting appropriate budget limits
   - Reviewing agent actions (especially in Supervised mode)
   - Backing up your data
   - Complying with applicable laws and regulations

3. **NO WARRANTY**: The AI agents are provided "AS IS" without warranty of any kind. We do not guarantee that agents will always make correct decisions or that your deployments will succeed.

4. **YOU ASSUME ALL RISK** when using Fully Autonomous mode.

### 5.3 Recommendations

We strongly recommend:

- Start with **Supervised mode**
- Set **budget limits** on your cloud accounts
- Enable **billing alerts** from your cloud provider (AWS, Azure, GCP)
- Review agent logs regularly
- Test in non-production environments first

## 6. Cost Transparency

### 6.1 Careerate Pricing

- **Beta (Current)**: Free, no platform fees
- **Future Pricing**: Will be announced at least 30 days in advance

### 6.2 Cloud Provider Costs

You pay your cloud provider directly for:

- Compute resources (ECS, Lambda, Container Apps, Cloud Run)
- Databases (RDS, Azure SQL, Cloud SQL)
- Storage (S3, Blob Storage, GCS)
- Bandwidth/data transfer
- Monitoring services

**We provide cost estimates before deployment**, but actual costs may vary based on usage.

## 7. Data Privacy & Security

### 7.1 What We Store

- Your email and account info
- Cloud account credentials (encrypted with AES-256-GCM in Azure Key Vault)
- Deployment metadata (project names, configurations)
- Usage logs and metrics

### 7.2 What We DON'T Store

- Your application source code (we access via GitHub but don't store it)
- Your application data
- Secrets from your cloud accounts (except the access keys/tokens we need)

### 7.3 Data Protection

- All credentials are encrypted at rest (Azure Key Vault)
- TLS encryption in transit
- SOC 2 Type II compliance (in progress)
- GDPR and CCPA compliant

See our [Privacy Policy](/legal/privacy) for details.

## 8. Acceptable Use Policy

You may NOT:

- Use Careerate for illegal purposes
- Deploy malicious software or spam
- Abuse or attempt to bypass our security measures
- Scrape or reverse engineer our AI models
- Use the service to cryptocurrency mine without explicit permission from your cloud provider
- Exceed reasonable usage limits (we'll notify you first)

Violations may result in account suspension or termination.

## 9. Intellectual Property

### 9.1 Careerate IP

We own all rights to:

- The Careerate platform and website
- Our AI models and agent logic
- Documentation and branding

### 9.2 Your IP

You retain all rights to:

- Your application code
- Your data
- Infrastructure you deploy (even after ejection)

### 9.3 Open Source

Careerate uses open-source components. See our [GitHub repository](https://github.com/garv-seth/CareerateV0) for licenses.

## 10. Service Availability

### 10.1 Uptime Target

We target 99.9% uptime, but we do NOT guarantee it. We are not liable for:

- Scheduled maintenance
- Service outages
- Third-party failures (AWS, Azure, GCP, GitHub)

### 10.2 Support

- **Free Tier**: Community support (Discord, GitHub Issues)
- **Pro Tier**: Email support (24-48 hour response)
- **Enterprise Tier**: Priority support with SLA

## 11. Termination

### 11.1 By You

You can delete your account anytime. Eject from all cloud providers first to ensure your infrastructure keeps running.

### 11.2 By Us

We may suspend or terminate your account if you:

- Violate these Terms
- Engage in fraudulent activity
- Cause harm to other users or our service

We'll notify you first (except in cases of severe abuse).

## 12. Disclaimers

### 12.1 AS-IS Service

CAREERATE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.

### 12.2 AI Limitations

AI agents may:

- Make incorrect decisions
- Misinterpret your requests
- Generate inefficient architectures
- Miss security vulnerabilities

**USE AT YOUR OWN RISK.**

## 13. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW:

1. WE ARE NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.

2. OUR TOTAL LIABILITY TO YOU SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS BEFORE THE CLAIM (CURRENTLY $0 DURING BETA).

3. THIS INCLUDES BUT IS NOT LIMITED TO:
   - Cloud costs incurred due to agent errors
   - Data loss
   - Business interruption
   - Lost profits

Some jurisdictions don't allow these limitations, so they may not apply to you.

## 14. Indemnification

You agree to indemnify and hold Careerate harmless from any claims, damages, or expenses (including legal fees) arising from:

- Your use of the Service
- Your violation of these Terms
- Your violation of any laws
- Your cloud account configurations

## 15. Governing Law & Disputes

### 15.1 Jurisdiction

These Terms are governed by the laws of the State of Washington, USA, without regard to conflict of law principles.

### 15.2 Dispute Resolution

Any disputes will be resolved through:

1. Good-faith negotiation
2. Binding arbitration (American Arbitration Association rules)
3. Small claims court (if dispute is under $10,000)

You waive the right to a jury trial or class action lawsuit.

## 16. Changes to Terms

We may update these Terms at any time. We'll notify you via:

- Email to your registered address
- In-app notification
- Notice on our website

Continued use after changes means you accept the new Terms.

## 17. Contact Us

Questions about these Terms?

- **Email**: legal@gocareerate.com
- **Address**: Careerate, [Address TBD]
- **Website**: https://gocareerate.com

## 18. Severability

If any provision of these Terms is found invalid, the remaining provisions remain in full effect.

---

**By using Careerate, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service, including all disclaimers and limitations of liability.**

Last updated: October 12, 2025

