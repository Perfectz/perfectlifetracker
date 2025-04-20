const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

// Define the paths
const frontendManifestsDir = path.join(__dirname, 'frontend');

// Check if directory exists
if (!fs.existsSync(frontendManifestsDir)) {
  console.error(`❌ Directory does not exist: ${frontendManifestsDir}`);
  process.exit(1);
}

console.log('🔍 Validating frontend Kubernetes manifests...');

// Check required files
const requiredFiles = ['deployment.yaml', 'service.yaml', 'ingress.yaml'];
const missingFiles = [];

for (const file of requiredFiles) {
  const filePath = path.join(frontendManifestsDir, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
}

if (missingFiles.length > 0) {
  console.error(`❌ Missing required files: ${missingFiles.join(', ')}`);
  process.exit(1);
}

console.log('✅ All required files exist');

// Validate YAML syntax and structure
try {
  // Deployment
  const deploymentPath = path.join(frontendManifestsDir, 'deployment.yaml');
  const deploymentContent = fs.readFileSync(deploymentPath, 'utf8');
  const deployment = yaml.parse(deploymentContent);
  
  // Check deployment structure
  if (deployment.kind !== 'Deployment') {
    console.error('❌ deployment.yaml: Kind should be Deployment');
    process.exit(1);
  }
  
  if (!deployment.spec || !deployment.spec.template || !deployment.spec.template.spec || !deployment.spec.template.spec.containers) {
    console.error('❌ deployment.yaml: Missing required spec fields');
    process.exit(1);
  }
  
  // Check health probes
  const container = deployment.spec.template.spec.containers[0];
  if (!container.livenessProbe || !container.readinessProbe) {
    console.error('❌ deployment.yaml: Missing health probes');
    process.exit(1);
  }
  
  if (container.livenessProbe.httpGet.path !== '/health' || container.readinessProbe.httpGet.path !== '/health') {
    console.error('❌ deployment.yaml: Health probes should use /health path');
    process.exit(1);
  }
  
  console.log('✅ deployment.yaml: Valid syntax and structure');
  
  // Service
  const servicePath = path.join(frontendManifestsDir, 'service.yaml');
  const serviceContent = fs.readFileSync(servicePath, 'utf8');
  const service = yaml.parse(serviceContent);
  
  // Check service structure
  if (service.kind !== 'Service') {
    console.error('❌ service.yaml: Kind should be Service');
    process.exit(1);
  }
  
  if (!service.spec || !service.spec.ports || !service.spec.selector) {
    console.error('❌ service.yaml: Missing required spec fields');
    process.exit(1);
  }
  
  console.log('✅ service.yaml: Valid syntax and structure');
  
  // Ingress
  const ingressPath = path.join(frontendManifestsDir, 'ingress.yaml');
  const ingressContent = fs.readFileSync(ingressPath, 'utf8');
  const ingress = yaml.parse(ingressContent);
  
  // Check ingress structure
  if (ingress.kind !== 'Ingress') {
    console.error('❌ ingress.yaml: Kind should be Ingress');
    process.exit(1);
  }
  
  if (!ingress.metadata || !ingress.metadata.annotations) {
    console.error('❌ ingress.yaml: Missing metadata or annotations');
    process.exit(1);
  }
  
  // Check for security annotations
  const requiredAnnotations = ['kubernetes.io/ingress.class', 'nginx.ingress.kubernetes.io/ssl-redirect'];
  const missingAnnotations = [];
  
  for (const annotation of requiredAnnotations) {
    if (!ingress.metadata.annotations[annotation]) {
      missingAnnotations.push(annotation);
    }
  }
  
  if (missingAnnotations.length > 0) {
    console.error(`❌ ingress.yaml: Missing required annotations: ${missingAnnotations.join(', ')}`);
    process.exit(1);
  }
  
  console.log('✅ ingress.yaml: Valid syntax and structure');
  
  console.log('\n✅ All Kubernetes manifests validated successfully');
} catch (error) {
  console.error(`❌ YAML validation error: ${error.message}`);
  process.exit(1);
} 