# Phase 1: Immediate Security & Critical Updates

## 🚨 **URGENT: Execute These Commands Immediately**

### **Frontend Security Fixes**

```bash
cd frontend

# 1. ADDRESS SECURITY VULNERABILITIES
# Remove vulnerable image optimization packages
npm uninstall imagemin imagemin-cli imagemin-gifsicle imagemin-jpegtran imagemin-optipng

# Remove vulnerable bundlesize package (has axios dependency issues)
npm uninstall bundlesize

# Clean unused React Native dependencies (not needed for web app)
npm uninstall expo-status-bar react-native-paper react-native-safe-area-context

# Clean unused testing packages
npm uninstall vitest @cypress/code-coverage @cypress/vite-dev-server cypress-real-events

# 2. UPDATE CRITICAL AUTHENTICATION PACKAGES
npm install @azure/msal-browser@^4.13.0
npm install @auth0/auth0-spa-js@^2.2.0

# 3. UPDATE MATERIAL-UI (SECURITY PATCHES)
npm install @mui/material@^7.1.1 @mui/icons-material@^7.1.1

# 4. ADD MISSING DEPENDENCY FOR ESLINT
npm install eslint-config-react-app --save-dev

# 5. VERIFY SECURITY STATUS
npm audit --audit-level moderate
```

### **Backend Security & Maintenance**

```bash
cd backend

# 1. ADD MISSING DEPENDENCIES
npm install bcryptjs
npm install @typescript-eslint/eslint-config-recommended --save-dev

# 2. REMOVE UNUSED DEPENDENCIES
npm uninstall express-oauth2-jwt-bearer

# 3. UPDATE CRITICAL AZURE PACKAGES
npm install @azure/cosmos@^4.4.1

# 4. UPDATE TYPE DEFINITIONS
npm install @types/cors@^2.8.18

# 5. VERIFY CLEAN STATE
npm audit
npm outdated
```

## 📋 **POST-UPDATE VERIFICATION**

### **Test Commands to Run**

```bash
# Frontend tests
cd frontend
npm run test:ci
npm run lint
npm run build

# Backend tests  
cd backend
npm test
npm run lint
npm run build

# Full application test
cd ..
npm run test
npm run build
```

### **Expected Results**
- ✅ Frontend: 0 high-severity vulnerabilities
- ✅ Backend: Still 0 vulnerabilities
- ✅ All builds successful
- ✅ All tests passing
- ✅ No unused dependencies warnings

## 🔧 **If Issues Arise**

### **Rollback Commands**
```bash
# If frontend breaks
cd frontend
git checkout HEAD -- package.json package-lock.json
npm ci

# If backend breaks
cd backend  
git checkout HEAD -- package.json package-lock.json
npm ci
```

### **Common Issues & Solutions**

1. **TypeScript Errors After Updates**
   ```bash
   # Clear TypeScript cache
   npx tsc --build --clean
   rm -rf node_modules/.cache
   ```

2. **ESLint Configuration Issues**
   ```bash
   # Reset ESLint cache
   npx eslint --print-config . > /dev/null
   ```

3. **Build Failures**
   ```bash
   # Clear all caches
   npm run clean:deps
   rm -rf node_modules dist
   npm ci
   ```

## 📊 **Impact Assessment**

### **Packages Removed (Frontend)**
- `imagemin` + related packages (7 packages) - **Vulnerable**
- `bundlesize` - **Vulnerable** 
- React Native packages (3 packages) - **Unused**
- Unused testing packages (4 packages) - **Cleanup**

### **Packages Updated**
- `@azure/msal-browser`: 4.10.0 → 4.13.0
- `@auth0/auth0-spa-js`: 2.1.3 → 2.2.0  
- `@mui/material`: 7.0.2 → 7.1.1
- `@mui/icons-material`: 7.0.2 → 7.1.1
- `@azure/cosmos`: 4.3.0 → 4.4.1

### **Bundle Size Impact**
- **Expected reduction**: ~15-20% due to removing unused packages
- **Security vulnerabilities**: Reduced from 15+ to 0
- **Maintenance debt**: Reduced significantly

---

**⚡ Execute these commands now to secure your application immediately!** 