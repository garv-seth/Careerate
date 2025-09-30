/**
 * Test deployment script - bypasses authentication for testing
 */

const { azureContainerApps } = require('./dist/index.cjs');
const fs = require('fs');

async function testDeployment() {
  console.log('🧪 Starting deployment test...\n');

  const testProject = {
    projectId: '76406293-87b7-4a6a-9102-1a1ed13cdc6a',
    appName: `careerate-test-${Date.now()}`,
    sourceCode: {
      'index.js': fs.readFileSync('./test-deployment/index.js', 'utf-8'),
      'package.json': fs.readFileSync('./test-deployment/package.json', 'utf-8'),
      'Dockerfile': fs.readFileSync('./test-deployment/Dockerfile', 'utf-8')
    },
    envVars: {},
    port: 3000
  };

  try {
    console.log('📦 Deployment spec:', {
      projectId: testProject.projectId,
      appName: testProject.appName,
      files: Object.keys(testProject.sourceCode),
      port: testProject.port
    });

    console.log('\n🚀 Calling azureContainerApps.deployApp()...\n');

    const result = await azureContainerApps.deployApp(testProject);

    console.log('\n✅ DEPLOYMENT SUCCESSFUL!');
    console.log('Result:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testDeployment();
