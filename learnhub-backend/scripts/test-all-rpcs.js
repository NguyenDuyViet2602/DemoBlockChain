// Script to test all available RPC endpoints for Polygon Mumbai
const { ethers } = require("ethers");

const RPC_ENDPOINTS = [
  {
    name: "Polygon Public RPC",
    url: "https://polygon-mumbai.public.blastapi.io",
    requiresKey: false
  },
  {
    name: "1RPC",
    url: "https://1rpc.io/maticmum",
    requiresKey: false
  },
  {
    name: "PublicNode",
    url: "https://polygon-mumbai-bor.publicnode.com",
    requiresKey: false
  },
  {
    name: "Chainstack",
    url: "https://matic-mumbai.chainstacklabs.com",
    requiresKey: false
  },
  {
    name: "Bwarelabs",
    url: "https://matic-testnet-archive-rpc.bwarelabs.com",
    requiresKey: false
  },
  {
    name: "Ankr",
    url: "https://rpc.ankr.com/polygon_mumbai",
    requiresKey: false
  }
];

async function testRPC(name, url) {
  try {
    console.log(`\n🔍 Testing ${name}...`);
    console.log(`   URL: ${url}`);
    
    const provider = new ethers.JsonRpcProvider(url, {
      name: "mumbai",
      chainId: 80001
    });
    
    // Set timeout
    const timeout = 10000; // 10 seconds
    
    // Test 1: Get network info
    const networkPromise = provider.getNetwork();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), timeout)
    );
    
    const networkInfo = await Promise.race([networkPromise, timeoutPromise]);
    console.log(`   ✅ Chain ID: ${networkInfo.chainId}`);
    
    // Test 2: Get latest block
    const blockNumber = await Promise.race([
      provider.getBlockNumber(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeout))
    ]);
    console.log(`   ✅ Latest block: ${blockNumber}`);
    
    // Test 3: Get gas price
    const feeData = await Promise.race([
      provider.getFeeData(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeout))
    ]);
    const gasPrice = feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") : "N/A";
    console.log(`   ✅ Gas price: ${gasPrice} gwei`);
    
    return { success: true, name, url, blockNumber, gasPrice };
    
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return { success: false, name, url, error: error.message };
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("🧪 Testing Polygon Mumbai RPC Endpoints");
  console.log("=".repeat(60));
  
  const results = [];
  
  for (const endpoint of RPC_ENDPOINTS) {
    const result = await testRPC(endpoint.name, endpoint.url);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 Test Results Summary");
  console.log("=".repeat(60));
  
  const working = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (working.length > 0) {
    console.log("\n✅ Working RPC Endpoints:");
    working.forEach((r, index) => {
      console.log(`\n${index + 1}. ${r.name}`);
      console.log(`   URL: ${r.url}`);
      console.log(`   Latest Block: ${r.blockNumber}`);
      console.log(`   Gas Price: ${r.gasPrice} gwei`);
      console.log(`   ✅ Status: WORKING`);
    });
    
    console.log("\n💡 Recommended RPC (first working):");
    console.log(`   ${working[0].name}: ${working[0].url}`);
    console.log("\n📝 Add to your .env file:");
    console.log(`   POLYGON_MUMBAI_RPC=${working[0].url}`);
  }
  
  if (failed.length > 0) {
    console.log("\n❌ Failed RPC Endpoints:");
    failed.forEach((r, index) => {
      console.log(`\n${index + 1}. ${r.name}`);
      console.log(`   URL: ${r.url}`);
      console.log(`   Error: ${r.error}`);
    });
  }
  
  console.log("\n" + "=".repeat(60));
  
  if (working.length === 0) {
    console.log("\n⚠️  No working RPC endpoints found!");
    console.log("💡 Consider:");
    console.log("   1. Check your internet connection");
    console.log("   2. Try using a VPN if you're in a restricted region");
    console.log("   3. Get a free API key from Alchemy or Infura");
    process.exit(1);
  } else {
    console.log(`\n✅ Found ${working.length} working RPC endpoint(s)!`);
    process.exit(0);
  }
}

main()
  .catch((error) => {
    console.error("\n❌ Unexpected error:", error);
    process.exit(1);
  });

