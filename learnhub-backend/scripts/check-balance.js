// Script to check wallet balance on Polygon Amoy
const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  
  if (!signers || signers.length === 0) {
    console.error("❌ No signers found. Please set PRIVATE_KEY in your .env file.");
    process.exit(1);
  }
  
  const deployer = signers[0];
  const address = deployer.address;
  
  console.log("=".repeat(60));
  console.log("💰 Checking Wallet Balance");
  console.log("=".repeat(60));
  console.log(`Address: ${address}`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`Chain ID: ${(await hre.ethers.provider.getNetwork()).chainId}`);
  console.log("=".repeat(60));
  
  try {
    // Get balance
    const balance = await hre.ethers.provider.getBalance(address);
    const balanceInEth = hre.ethers.formatEther(balance);
    
    // Get fee data for gas price
    const feeData = await hre.ethers.provider.getFeeData();
    const gasPrice = feeData.gasPrice ? hre.ethers.formatUnits(feeData.gasPrice, "gwei") : "N/A";
    
    // Get latest block
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    
    console.log(`\n📊 Balance Information:`);
    console.log(`   Balance: ${balanceInEth} POL (MATIC)`);
    console.log(`   Balance (Wei): ${balance.toString()}`);
    console.log(`\n⛽ Gas Information:`);
    console.log(`   Gas Price: ${gasPrice} gwei`);
    console.log(`\n📦 Network Information:`);
    console.log(`   Latest Block: ${blockNumber}`);
    
    // Estimate costs
    const minBalance = hre.ethers.parseEther("0.1");
    const recommendedBalance = hre.ethers.parseEther("0.5");
    
    console.log("\n" + "=".repeat(60));
    console.log("💡 Recommendations:");
    console.log("=".repeat(60));
    
    if (balance === 0n) {
      console.log("❌ Balance is 0!");
      console.log("   You need POL tokens to deploy contracts.");
      console.log("   Get tokens from: https://faucet.polygon.technology/");
    } else if (balance < minBalance) {
      console.log("⚠️  Low balance!");
      console.log(`   Current: ${balanceInEth} POL`);
      console.log(`   Minimum recommended: 0.1 POL`);
      console.log(`   Recommended: 0.5 POL`);
      console.log("   You might not have enough for all deployments.");
      console.log("   Get more tokens from: https://faucet.polygon.technology/");
    } else if (balance < recommendedBalance) {
      console.log("✅ Balance is OK for basic deployment");
      console.log(`   Current: ${balanceInEth} POL`);
      console.log(`   Recommended: 0.5 POL for all contracts`);
      console.log("   You should be able to deploy, but might need more for multiple deployments.");
    } else {
      console.log("✅ Balance is sufficient!");
      console.log(`   Current: ${balanceInEth} POL`);
      console.log("   You have enough tokens to deploy all contracts.");
    }
    
    // Estimate deployment costs (rough estimate)
    console.log("\n📋 Estimated Deployment Costs:");
    console.log("   LearnHubToken: ~0.01-0.02 POL");
    console.log("   RewardDistribution: ~0.02-0.03 POL");
    console.log("   CertificateNFT: ~0.02-0.03 POL");
    console.log("   Grant Role: ~0.001 POL");
    console.log("   Total estimated: ~0.05-0.08 POL");
    
    console.log("\n" + "=".repeat(60));
    console.log("🔗 Useful Links:");
    console.log("=".repeat(60));
    console.log(`   Explorer: https://amoy.polygonscan.com/address/${address}`);
    console.log(`   Faucet: https://faucet.polygon.technology/`);
    console.log(`   Alchemy Faucet: https://www.alchemy.com/faucets/polygon-amoy`);
    console.log("=".repeat(60));
    
  } catch (error) {
    console.error("\n❌ Error checking balance:");
    console.error(error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

