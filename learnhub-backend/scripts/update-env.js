// Script to update .env file with deployed contract addresses
const fs = require('fs');
const path = require('path');

const deploymentFile = './deployment-mumbai.json';
const envFile = './.env';

// Read deployment info
let deployment;
try {
  deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  console.log('✅ Loaded deployment info from:', deploymentFile);
} catch (error) {
  console.error('❌ Error reading deployment file:', error.message);
  process.exit(1);
}

const contracts = deployment.contracts;
console.log('\n📋 Contract Addresses:');
console.log('   LearnHubToken:', contracts.LearnHubToken);
console.log('   RewardDistribution:', contracts.RewardDistribution);
console.log('   CertificateNFT:', contracts.CertificateNFT);
if (contracts.CoursePayment) {
  console.log('   CoursePayment:', contracts.CoursePayment);
}

// Read existing .env file
let envContent = '';
if (fs.existsSync(envFile)) {
  envContent = fs.readFileSync(envFile, 'utf8');
  console.log('\n✅ Found existing .env file');
} else {
  console.log('\n⚠️  .env file not found, will create new one');
}

// Update or add contract addresses
const updates = {
  'TOKEN_CONTRACT_ADDRESS': contracts.LearnHubToken,
  'REWARD_DISTRIBUTION_ADDRESS': contracts.RewardDistribution,
  'CERTIFICATE_NFT_ADDRESS': contracts.CertificateNFT,
};
if (contracts.CoursePayment) {
  updates['COURSE_PAYMENT_ADDRESS'] = contracts.CoursePayment;
}

let updated = false;
let lines = envContent.split('\n');
const newLines = [];

// Process existing lines
for (const line of lines) {
  let modified = false;
  for (const [key, value] of Object.entries(updates)) {
    if (line.trim().startsWith(`${key}=`)) {
      newLines.push(`${key}=${value}`);
      modified = true;
      updated = true;
      break;
    }
  }
  if (!modified) {
    newLines.push(line);
  }
}

// Add missing keys
for (const [key, value] of Object.entries(updates)) {
  const exists = newLines.some(line => line.trim().startsWith(`${key}=`));
  if (!exists) {
    // Add at the end or in a specific section
    newLines.push(`\n# Blockchain Contract Addresses (Deployed on ${deployment.network})`);
    newLines.push(`${key}=${value}`);
    updated = true;
    break;
  }
}

// If no blockchain section exists, add it
if (!newLines.some(line => line.includes('# Blockchain Contract Addresses'))) {
  newLines.push(`\n# Blockchain Contract Addresses (Deployed on ${deployment.network})`);
  newLines.push(`TOKEN_CONTRACT_ADDRESS=${contracts.LearnHubToken}`);
  newLines.push(`REWARD_DISTRIBUTION_ADDRESS=${contracts.RewardDistribution}`);
  newLines.push(`CERTIFICATE_NFT_ADDRESS=${contracts.CertificateNFT}`);
  if (contracts.CoursePayment) {
    newLines.push(`COURSE_PAYMENT_ADDRESS=${contracts.CoursePayment}`);
  }
  updated = true;
}

// Write updated .env
if (updated || !fs.existsSync(envFile)) {
  fs.writeFileSync(envFile, newLines.join('\n'));
  console.log('\n✅ Updated .env file with contract addresses');
} else {
  console.log('\n✅ .env file already up to date');
}

console.log('\n📝 Updated variables:');
for (const [key, value] of Object.entries(updates)) {
  console.log(`   ${key}=${value}`);
}

console.log('\n✨ Done! Your .env file is ready.');

