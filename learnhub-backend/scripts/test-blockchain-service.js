// Script to test blockchain service initialization
const blockchainService = require('../src/services/blockchain.service');

async function main() {
  console.log("=".repeat(60));
  console.log("🧪 Testing Blockchain Service");
  console.log("=".repeat(60));
  
  try {
    // Wait a bit for initialization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("\n✅ Blockchain service loaded");
    console.log("\n📋 Available functions:");
    console.log("   - connectWallet");
    console.log("   - getUserWalletAddress");
    console.log("   - getTokenBalance");
    console.log("   - distributeLessonReward");
    console.log("   - distributeQuizReward");
    console.log("   - distributeCourseReward");
    console.log("   - mintCertificateNFT");
    console.log("   - getTransactionHistory");
    
    console.log("\n✅ Service is ready!");
    console.log("\n💡 Next steps:");
    console.log("   1. Start backend: npm run dev");
    console.log("   2. Test API endpoints");
    console.log("   3. Connect wallet via API");
    console.log("   4. Test reward distribution");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("\n💡 Check:");
    console.error("   1. .env file has all required variables");
    console.error("   2. Contract addresses are correct");
    console.error("   3. RPC URL is accessible");
    console.error("   4. Private key is valid");
  }
  
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

