# Perfect LifeTracker Pro - Production Security Guide

This document provides comprehensive security guidelines and procedures for deploying Perfect LifeTracker Pro in production environments.

## 🔒 Security Configuration Checklist

### 1. Environment Variables Security

#### ⚠️ **Critical: Hardcoded Secrets Identified**

The following secrets are currently hardcoded and **MUST** be replaced before production deployment:

**Backend Secrets:**
```bash
# backend/.env - REPLACE BEFORE PRODUCTION
COSMOS_DB_KEY=dummy-key-for-development                    # ❌ HARDCODED
AZURE_STORAGE_CONNECTION_STRING=UseDevelopmentStorage=true  # ❌ HARDCODED  
JWT_SECRET=your-super-secret-jwt-key                       # ❌ HARDCODED
SESSION_SECRET=your-session-secret                         # ❌ HARDCODED
ENCRYPTION_KEY=your-encryption-key                         # ❌ HARDCODED
```

**Frontend Secrets:**
```bash
# frontend/.env - REPLACE BEFORE PRODUCTION
VITE_AZURE_CLIENT_ID=d9764c39-1eb9-4963-83a0-e8ba859c8965  # ❌ HARDCODED (Development)
```

### 2. Secret Generation Requirements

#### JWT_SECRET (Backend)
```bash
# Generate secure 256-bit JWT secret
openssl rand -hex 32
# Example output: a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

#### SESSION_SECRET (Backend)
```bash
# Generate secure session secret
openssl rand -base64 64
# Example output: ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890+/==
```

#### ENCRYPTION_KEY (Backend)
```bash
# Generate AES-256 encryption key
openssl rand -hex 32
# Example output: fedcba0987654321098765432109876543210fedcba0987654321098765432109
```

### 3. Azure Resource Security Configuration

#### Azure Cosmos DB
- [ ] Enable **Firewall and Virtual Networks** restrictions
- [ ] Use **Service Endpoints** for app service access
- [ ] Enable **Diagnostic Settings** for audit logging
- [ ] Configure **Role-Based Access Control (RBAC)**
- [ ] Enable **Advanced Threat Protection**

#### Azure Storage Account
- [ ] Enable **Firewall and Virtual Networks** restrictions
- [ ] Configure **CORS settings** for specific domains only
- [ ] Enable **Blob versioning** and **soft delete**
- [ ] Use **Managed Identity** for application access
- [ ] Enable **Storage Analytics** logging

#### Azure Active Directory B2C
- [ ] Configure **conditional access policies**
- [ ] Enable **multi-factor authentication**
- [ ] Set up **identity protection**
- [ ] Configure **custom domains** for production
- [ ] Enable **audit logging**

## 🔄 Secret Rotation Procedures

### Quarterly Rotation Schedule (Every 90 Days)

#### Week 1: Preparation
1. **Generate new secrets** using the commands above
2. **Test in staging environment** with new secrets
3. **Verify application functionality** with new secrets
4. **Schedule maintenance window** for production update

#### Week 2: Backend Secret Rotation
```bash
# 1. Update backend environment variables
az webapp config appsettings set --name perfectltp-api --resource-group perfectltp-rg --settings \
  JWT_SECRET="NEW_JWT_SECRET" \
  SESSION_SECRET="NEW_SESSION_SECRET" \
  ENCRYPTION_KEY="NEW_ENCRYPTION_KEY"

# 2. Restart backend service
az webapp restart --name perfectltp-api --resource-group perfectltp-rg

# 3. Verify health check
curl -X GET https://api.perfectltp.com/api/health
```

#### Week 3: Database Key Rotation
```bash
# 1. Generate new Cosmos DB key in Azure Portal
# 2. Update application settings
az webapp config appsettings set --name perfectltp-api --resource-group perfectltp-rg --settings \
  COSMOS_DB_KEY="NEW_COSMOS_DB_KEY"

# 3. Restart and verify
az webapp restart --name perfectltp-api --resource-group perfectltp-rg
```

#### Week 4: Storage Account Key Rotation
```bash
# 1. Regenerate storage account key
az storage account keys renew --account-name perfectltpstorage --resource-group perfectltp-rg --key key1

# 2. Get new connection string
az storage account show-connection-string --name perfectltpstorage --resource-group perfectltp-rg

# 3. Update application settings
az webapp config appsettings set --name perfectltp-api --resource-group perfectltp-rg --settings \
  AZURE_STORAGE_CONNECTION_STRING="NEW_CONNECTION_STRING"
```

## 🔐 Azure Key Vault Integration (Recommended)

### Setup Azure Key Vault

```bash
# 1. Create Key Vault
az keyvault create --name perfectltp-keyvault --resource-group perfectltp-rg --location eastus

# 2. Enable soft delete and purge protection
az keyvault update --name perfectltp-keyvault --enable-soft-delete true --enable-purge-protection true

# 3. Set access policy for App Service
az keyvault set-policy --name perfectltp-keyvault --object-id APP_SERVICE_PRINCIPAL_ID --secret-permissions get list
```

### Store Secrets in Key Vault

```bash
# Store backend secrets
az keyvault secret set --vault-name perfectltp-keyvault --name "jwt-secret" --value "YOUR_JWT_SECRET"
az keyvault secret set --vault-name perfectltp-keyvault --name "session-secret" --value "YOUR_SESSION_SECRET"
az keyvault secret set --vault-name perfectltp-keyvault --name "encryption-key" --value "YOUR_ENCRYPTION_KEY"
az keyvault secret set --vault-name perfectltp-keyvault --name "cosmos-db-key" --value "YOUR_COSMOS_KEY"
az keyvault secret set --vault-name perfectltp-keyvault --name "storage-connection-string" --value "YOUR_STORAGE_CONNECTION"
```

### Update Application to Use Key Vault

**Backend Code Example:**
```typescript
// backend/src/config/secrets.ts
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

const credential = new DefaultAzureCredential();
const vaultName = process.env.AZURE_KEYVAULT_NAME;
const url = `https://${vaultName}.vault.azure.net`;
const client = new SecretClient(url, credential);

export async function getSecret(secretName: string): Promise<string> {
  const secret = await client.getSecret(secretName);
  return secret.value || '';
}

// Usage
export const JWT_SECRET = await getSecret('jwt-secret');
export const COSMOS_DB_KEY = await getSecret('cosmos-db-key');
```

**App Service Configuration:**
```bash
# Reference Key Vault secrets in App Service settings
az webapp config appsettings set --name perfectltp-api --resource-group perfectltp-rg --settings \
  JWT_SECRET="@Microsoft.KeyVault(VaultName=perfectltp-keyvault;SecretName=jwt-secret)" \
  COSMOS_DB_KEY="@Microsoft.KeyVault(VaultName=perfectltp-keyvault;SecretName=cosmos-db-key)"
```

## 🛡️ Security Headers Configuration

### Helmet.js Configuration (Backend)

```typescript
// backend/src/middleware/security.ts
import helmet from 'helmet';

export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: "no-referrer" },
  xssFilter: true,
});
```

## 📊 Security Monitoring

### Application Insights Security Events

```typescript
// backend/src/middleware/securityLogging.ts
import { logger } from '../utils/logger';

export function logSecurityEvent(event: string, details: any) {
  logger.warn(`Security Event: ${event}`, {
    ...details,
    timestamp: new Date().toISOString(),
    severity: 'security'
  });
}

// Usage examples
logSecurityEvent('Authentication Failed', { userId, ipAddress, userAgent });
logSecurityEvent('Rate Limit Exceeded', { ipAddress, endpoint });
logSecurityEvent('Invalid Token Access', { token: '[REDACTED]', endpoint });
```

### Security Alerts Configuration

```bash
# Set up security alerts in Azure
az monitor alert create \
  --name "PerfectLTP-Security-Alert" \
  --resource-group perfectltp-rg \
  --condition "count 'requests' > 100" \
  --description "High number of requests detected"
```

## 🔍 Security Audit Checklist

### Pre-Deployment Security Audit

- [ ] **Secrets Audit**
  - [ ] All hardcoded secrets replaced with production values
  - [ ] No sensitive data in environment variables
  - [ ] Key Vault integration tested and working
  
- [ ] **Access Control Audit**
  - [ ] Azure RBAC configured properly
  - [ ] Service-to-service authentication using managed identities
  - [ ] Network security groups restricting access
  
- [ ] **Data Protection Audit**
  - [ ] Encryption at rest enabled for all data stores
  - [ ] TLS 1.2+ enforced for all communications
  - [ ] Personal data handling complies with GDPR/CCPA
  
- [ ] **Application Security Audit**
  - [ ] Input validation implemented
  - [ ] SQL injection protection verified
  - [ ] XSS protection enabled
  - [ ] CSRF protection implemented
  
- [ ] **Infrastructure Security Audit**
  - [ ] Web Application Firewall configured
  - [ ] DDoS protection enabled
  - [ ] Security headers implemented
  - [ ] Vulnerability scanning completed

### Post-Deployment Security Verification

```bash
# 1. SSL/TLS Configuration Test
curl -I https://www.perfectltp.com | grep -i security

# 2. Security Headers Test
curl -I https://api.perfectltp.com | grep -E "(X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security)"

# 3. API Authentication Test
curl -X GET https://api.perfectltp.com/api/protected
# Should return 401 Unauthorized

# 4. Health Check Test
curl -X GET https://api.perfectltp.com/api/health
# Should return 200 OK
```

## 🚨 Incident Response Plan

### Security Incident Detection
1. **Automated Monitoring**: Azure Monitor alerts for anomalies
2. **Manual Review**: Weekly security log analysis
3. **User Reports**: Security incident reporting mechanism

### Incident Response Steps
1. **Immediate Response** (Within 1 hour)
   - Assess severity and scope
   - Isolate affected systems if necessary
   - Document incident details

2. **Investigation** (Within 4 hours)
   - Analyze logs and determine root cause
   - Identify affected users and data
   - Implement temporary mitigations

3. **Resolution** (Within 24 hours)
   - Apply permanent fixes
   - Update security configurations
   - Notify affected users if required

4. **Post-Incident** (Within 1 week)
   - Conduct post-mortem analysis
   - Update security procedures
   - Implement additional preventive measures

## 📞 Emergency Contacts

### Security Team Contacts
- **Security Lead**: security@perfectltp.com
- **DevOps Lead**: devops@perfectltp.com
- **Azure Support**: +1-800-642-7676

### Vendor Security Contacts
- **Microsoft Azure Security**: Azure Portal > Support + Troubleshooting
- **Auth0 Security** (if used): security@auth0.com

---

## 📚 Additional Resources

- [Azure Security Best Practices](https://docs.microsoft.com/en-us/azure/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Best Practices](https://snyk.io/blog/10-react-security-best-practices/)

**⚠️ CRITICAL REMINDER:**
This security guide must be reviewed and updated quarterly. All team members with production access must acknowledge reading and understanding these procedures. 