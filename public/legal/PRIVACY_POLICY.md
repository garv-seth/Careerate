# Privacy Policy

**Effective Date**: October 12, 2025  
**Last Updated**: October 12, 2025

Careerate ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.

---

## 1. Information We Collect

### 1.1 Account Information

When you create an account, we collect:

- **Email address** (for authentication and notifications)
- **Name** (optional, for personalization)
- **OAuth tokens** (from Microsoft, GitHub)

### 1.2 Cloud Account Credentials

When you connect cloud accounts, we collect and encrypt:

- **AWS**: IAM Role ARN and ExternalId
- **Azure**: Service Principal credentials (Tenant ID, Client ID, Client Secret)
- **GCP**: Service Account JSON key or OAuth tokens

**Storage**: Encrypted with AES-256-GCM in Azure Key Vault (Microsoft-managed HSMs).

### 1.3 Deployment Metadata

We store:

- Project names and descriptions
- Repository URLs (GitHub, GitLab)
- Environment variables (encrypted)
- Deployment configurations and logs
- Cost estimates and usage metrics

### 1.4 Usage Data

We automatically collect:

- **IP address** (for security and fraud prevention)
- **Browser type and version**
- **Device information** (OS, screen size for responsive design)
- **Usage patterns** (pages visited, features used)
- **Performance metrics** (page load times, API response times)
- **Error logs** (to improve our service)

### 1.5 Cookies

We use cookies for:

- **Authentication** (session cookies, essential)
- **Preferences** (theme, language)
- **Analytics** (Google Analytics, anonymized)

You can disable non-essential cookies in your browser or our cookie consent banner.

---

## 2. How We Use Your Information

### 2.1 Provide Our Service

- Authenticate you and maintain your session
- Deploy applications to your cloud accounts
- Monitor deployments and send alerts
- Provide cost estimates and optimization recommendations

### 2.2 Improve Our Service

- Analyze usage patterns to identify bugs
- Train AI models (anonymized, aggregated data only)
- Develop new features based on user needs

### 2.3 Communicate With You

- Send deployment notifications (email, in-app)
- Notify you of service updates or security issues
- Respond to your support requests
- Send marketing emails (you can opt out)

### 2.4 Security & Fraud Prevention

- Detect and prevent unauthorized access
- Investigate suspicious activity
- Comply with legal obligations (subpoenas, court orders)

---

## 3. What We DON'T Do

### 3.1 We DON'T Sell Your Data

We will never sell, rent, or trade your personal information to third parties for marketing purposes.

### 3.2 We DON'T Store Your Source Code

When you deploy from GitHub, we:

- Access your repository via OAuth (read-only)
- Clone it temporarily for build purposes
- Delete it immediately after deployment

We do NOT store your source code permanently.

### 3.3 We DON'T Access Your Application Data

Once deployed, your application runs in YOUR cloud account. We only access:

- Deployment metadata (status, logs, metrics)
- Cloud provider APIs (to create/update resources)

We do NOT access your application's database or user data.

---

## 4. Data Sharing & Disclosure

### 4.1 Third-Party Services

We share limited data with:

- **Cloud Providers** (AWS, Azure, GCP): To deploy your applications
- **GitHub/GitLab**: To access your repositories (OAuth)
- **Azure Key Vault**: To encrypt and store credentials
- **Analytics** (Google Analytics): Anonymized usage data
- **Email** (SendGrid, Mailgun): For transactional emails
- **Monitoring** (Datadog, Sentry): Error logs and performance metrics (no PII)

### 4.2 Legal Requirements

We may disclose your information if required by law:

- Court orders or subpoenas
- DMCA takedown notices
- Government investigations
- Emergencies (e.g., preventing harm)

### 4.3 Business Transfers

If Careerate is acquired or merged, your data may be transferred to the new entity. We'll notify you via email.

---

## 5. Data Security

### 5.1 Encryption

- **At Rest**: AES-256-GCM encryption (Azure Key Vault)
- **In Transit**: TLS 1.3 for all connections
- **Database**: Encrypted PostgreSQL (Azure Flexible Server)

### 5.2 Access Controls

- Two-factor authentication (2FA) required for admin accounts
- Role-based access control (RBAC) for team members
- Regular security audits and penetration testing

### 5.3 Breach Notification

If a data breach occurs, we'll notify you within 72 hours via email and comply with GDPR/CCPA requirements.

---

## 6. Your Rights (GDPR & CCPA)

### 6.1 Right to Access

Request a copy of all data we have about you.

**How**: Email privacy@gocareerate.com with subject "Data Access Request"

### 6.2 Right to Rectification

Correct inaccurate or incomplete data.

**How**: Update your account settings or email us

### 6.3 Right to Deletion ("Right to be Forgotten")

Request deletion of your account and all associated data.

**How**: Go to Settings → Delete Account, or email us

**Note**: We may retain some data for legal/compliance purposes (e.g., tax records, fraud prevention) for up to 7 years.

### 6.4 Right to Data Portability

Export your data in a machine-readable format (JSON, CSV).

**How**: Go to Settings → Export Data

### 6.5 Right to Object

Object to processing of your data for marketing purposes.

**How**: Click "Unsubscribe" in any marketing email, or email us

### 6.6 Right to Opt-Out (CCPA)

California residents can opt out of "sale" of personal information (though we don't sell data).

**How**: Email privacy@gocareerate.com with subject "CCPA Opt-Out"

---

## 7. Data Retention

### 7.1 Active Accounts

We retain your data while your account is active.

### 7.2 Deleted Accounts

After you delete your account:

- **30 days**: Soft delete (recoverable if you change your mind)
- **After 30 days**: Permanently deleted from our systems

**Exceptions**: We may retain aggregated, anonymized data for analytics, and some logs for security/legal compliance.

### 7.3 Ejected Infrastructure

When you eject from a cloud provider:

- We delete the IAM role/Service Principal (revoking our access)
- We retain deployment metadata (for historical reference) for 1 year
- You can request deletion of this metadata

---

## 8. International Data Transfers

### 8.1 Where We Store Data

Careerate is hosted in **Azure US West 2** (Washington State, USA).

### 8.2 EU Users (GDPR)

If you're in the European Economic Area (EEA):

- Your data is transferred to the US (Azure complies with EU Standard Contractual Clauses)
- You have the rights described in Section 6
- You can file complaints with your local Data Protection Authority

### 8.3 Safeguards

We use:

- Azure's ISO 27001, SOC 2, and EU Model Clauses certifications
- Encryption in transit and at rest
- Regular audits

---

## 9. Children's Privacy

Careerate is NOT intended for users under 18. We do not knowingly collect data from children. If you believe a child has provided us with personal information, please contact us immediately, and we'll delete it.

---

## 10. Changes to This Policy

We may update this Privacy Policy. When we do:

- We'll notify you via email and in-app notification
- The "Last Updated" date at the top will change
- Continued use after changes means you accept the new policy

We'll never reduce your rights without your explicit consent.

---

## 11. Contact Us

### 11.1 Privacy Questions

**Email**: privacy@gocareerate.com  
**Response Time**: 3-5 business days

### 11.2 Data Protection Officer (DPO)

For GDPR inquiries:  
**Email**: dpo@gocareerate.com

### 11.3 Mailing Address

Careerate  
[Address TBD]  
United States

---

## 12. Third-Party Links

Our service may contain links to third-party websites (e.g., AWS Console, GitHub). We are not responsible for their privacy practices. Please review their policies.

---

## 13. Your Consent

By using Careerate, you consent to this Privacy Policy.

---

**Summary** (Plain English):

- We collect your email, cloud credentials (encrypted), and deployment metadata.
- We use it to provide our service, improve it, and keep you safe.
- We DON'T sell your data, store your source code, or access your application data.
- You can access, correct, export, or delete your data anytime.
- We comply with GDPR and CCPA.
- We use industry-standard encryption and security practices.

Questions? Email privacy@gocareerate.com

Last updated: October 12, 2025

