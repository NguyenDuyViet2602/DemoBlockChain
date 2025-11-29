// Script to test RPC endpoint connectivity
const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
  const network = hre.network.name;
  const rpcUrl = hre.config.networks[network]?.url;
  
  console.log(`\n🔍 Testing RPC endpoint for ${network}...`);
  console.log(`RPC URL: ${rpcUrl}\n`);

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Test 1: Get network info
    console.log("1. Testing network connection...");
    const networkInfo = await provider.getNetwork();
    console.log(`   ✅ Connected! Chain ID: ${networkInfo.chainId}`);
    
    // Test 2: Get latest block
    console.log("2. Testing block retrieval...");
    const blockNumber = await provider.getBlockNumber();
    console.log(`   ✅ Latest block: ${blockNumber}`);
    
    // Test 3: Get gas price
    console.log("3. Testing gas price...");
    const feeData = await provider.getFeeData();
    console.log(`   ✅ Gas price: ${ethers.formatUnits(feeData.gasPrice || 0, "gwei")} gwei`);
    
    console.log("\n✅ All tests passed! RPC endpoint is working.\n");
    
  } catch (error) {
    console.error("\n❌ RPC endpoint test failed:");
    console.error(`   Error: ${error.message}`);
    console.error("\n💡 Try using a different RPC endpoint:");
    console.error("   - Chainstack: https://matic-mumbai.chainstacklabs.com");
    console.error("   - Bwarelabs: https://matic-testnet-archive-rpc.bwarelabs.com");
    console.error("   - Or get a free API key from Alchemy/Infura\n");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

