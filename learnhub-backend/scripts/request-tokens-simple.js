// Simple script to request tokens using curl-like approach
// This uses node-fetch or native fetch if available
const https = require('https');

const WALLET_ADDRESS = process.env.WALLET_ADDRESS || '0x630525f80f6C211455A1765b335c10e2B4840110';

console.log("🚰 Requesting Testnet Tokens");
console.log(`Address: ${WALLET_ADDRESS}\n`);

// Function to make POST request
function postRequest(hostname, path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: hostname,
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Try QuickNode
async function tryQuickNode() {
  console.log("1. QuickNode Faucet...");
  try {
    // QuickNode API endpoint (if available)
    const response = await postRequest(
      'faucet.quicknode.com',
      '/polygon/amoy',
      { address: WALLET_ADDRESS }
    );
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${response.body.substring(0, 200)}...`);
    
    if (response.status === 200 || response.status === 201) {
      console.log("   ✅ Request sent successfully!");
      return true;
    }
    return false;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Try Chainlink
async function tryChainlink() {
  console.log("\n2. Chainlink Faucet...");
  try {
    const response = await postRequest(
      'faucets.chain.link',
      '/polygon-amoy',
      { 
        address: WALLET_ADDRESS,
        network: 'polygon-amoy'
      }
    );
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${response.body.substring(0, 200)}...`);
    
    if (response.status === 200 || response.status === 201) {
      console.log("   ✅ Request sent successfully!");
      return true;
    }
    return false;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Check current balance
async function checkBalance() {
  console.log("\n3. Checking current balance...");
  try {
    const { ethers } = require("ethers");
    const provider = new ethers.JsonRpcProvider(
      process.env.POLYGON_MUMBAI_RPC || 
      "https://polygon-amoy.g.alchemy.com/v2/vRCnbwYHNth2R8ttNLlUA"
    );
    
    const balance = await provider.getBalance(WALLET_ADDRESS);
    const balanceInEth = ethers.formatEther(balance);
    
    console.log(`   Current balance: ${balanceInEth} POL`);
    
    if (parseFloat(balanceInEth) < 0.1) {
      console.log("   ⚠️  Balance is low. You need more tokens to deploy.");
    } else {
      console.log("   ✅ Balance is sufficient!");
    }
    
    return balanceInEth;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return "0";
  }
}

// Main
async function main() {
  console.log("=".repeat(60));
  
  const results = [];
  
  // Try faucets
  results.push(await tryQuickNode());
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  results.push(await tryChainlink());
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check balance
  await checkBalance();
  
  console.log("\n" + "=".repeat(60));
  
  if (results.some(r => r)) {
    console.log("\n✅ Token requests sent!");
    console.log("   Please wait 1-5 minutes for tokens to arrive.");
    console.log("   Check balance: npm run check-balance");
  } else {
    console.log("\n⚠️  Could not request via API automatically.");
    console.log("\n💡 Manual options:");
    console.log("   1. QuickNode: https://faucet.quicknode.com/polygon/amoy");
    console.log("   2. Chainlink: https://faucets.chain.link/polygon-amoy");
    console.log("   3. Use local network: npm run deploy:local");
  }
  
  console.log("=".repeat(60));
}

main().catch(console.error);

