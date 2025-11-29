// Script to request testnet tokens from various faucets via API
const https = require('https');
const http = require('http');

const WALLET_ADDRESS = process.env.WALLET_ADDRESS || process.env.DEPLOYER_ADDRESS || '0x630525f80f6C211455A1765b335c10e2B4840110';

console.log("=".repeat(60));
console.log("🚰 Requesting Testnet Tokens via API");
console.log("=".repeat(60));
console.log(`Wallet Address: ${WALLET_ADDRESS}`);
console.log("=".repeat(60));

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        ...options.headers
      }
    };

    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, raw: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Faucet 1: QuickNode (if available)
async function requestQuickNode() {
  console.log("\n1. Trying QuickNode Faucet...");
  try {
    // QuickNode might have an API endpoint
    const response = await makeRequest(
      `https://faucet.quicknode.com/polygon/amoy`,
      {
        method: 'POST',
        body: {
          network: 'polygon-amoy',
          address: WALLET_ADDRESS
        }
      }
    );
    
    if (response.status === 200 || response.status === 201) {
      console.log("   ✅ Success! Tokens requested from QuickNode");
      return true;
    } else {
      console.log(`   ❌ Failed: Status ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Faucet 2: Chainlink (has API)
async function requestChainlink() {
  console.log("\n2. Trying Chainlink Faucet...");
  try {
    const response = await makeRequest(
      `https://faucets.chain.link/polygon-amoy`,
      {
        method: 'POST',
        body: {
          network: 'polygon-amoy',
          address: WALLET_ADDRESS
        }
      }
    );
    
    if (response.status === 200 || response.status === 201) {
      console.log("   ✅ Success! Tokens requested from Chainlink");
      return true;
    } else {
      console.log(`   ❌ Failed: Status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Faucet 3: Try direct RPC call (if network supports it)
async function requestViaRPC() {
  console.log("\n3. Trying direct RPC method...");
  try {
    // Some testnets allow direct minting via RPC
    // This is usually not available, but worth trying
    const { ethers } = require("ethers");
    const provider = new ethers.JsonRpcProvider("https://polygon-amoy.g.alchemy.com/v2/vRCnbwYHNth2R8ttNLlUA");
    
    // This won't work on most networks, but we can check balance
    const balance = await provider.getBalance(WALLET_ADDRESS);
    console.log(`   Current balance: ${ethers.formatEther(balance)} POL`);
    console.log("   ⚠️  Direct RPC minting not available on public networks");
    return false;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Faucet 4: Try GetBlock API
async function requestGetBlock() {
  console.log("\n4. Trying GetBlock Faucet...");
  try {
    // GetBlock might have an API endpoint
    const response = await makeRequest(
      `https://getblock.io/api/v2/faucet/polygon-amoy`,
      {
        method: 'POST',
        body: {
          address: WALLET_ADDRESS
        }
      }
    );
    
    if (response.status === 200 || response.status === 201) {
      console.log("   ✅ Success! Tokens requested from GetBlock");
      return true;
    } else {
      console.log(`   ❌ Failed: Status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  const results = [];
  
  // Try all faucets
  results.push(await requestQuickNode());
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
  
  results.push(await requestChainlink());
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  results.push(await requestViaRPC());
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  results.push(await requestGetBlock());
  
  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Summary");
  console.log("=".repeat(60));
  
  const successCount = results.filter(r => r === true).length;
  
  if (successCount > 0) {
    console.log(`✅ Successfully requested from ${successCount} faucet(s)`);
    console.log("\n⏳ Please wait a few minutes for tokens to arrive");
    console.log("   Check balance with: npm run check-balance");
  } else {
    console.log("❌ Could not request tokens via API");
    console.log("\n💡 Alternative solutions:");
    console.log("   1. Use local network: npm run deploy:local");
    console.log("   2. Try manual faucets: see ALTERNATIVE_FAUCETS.md");
    console.log("   3. Wait 24h for Polygon official faucet");
  }
  
  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => {
    console.log("\n✅ Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });

