// Deploy contracts with minimal gas usage
// This script tries to deploy with current balance by optimizing gas
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];
  
  console.log("=".repeat(60));
  console.log("⚡ Minimal Gas Deployment");
  console.log("=".repeat(60));
  console.log(`Deployer: ${deployer.address}`);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const balanceInEth = hre.ethers.formatEther(balance);
  console.log(`Balance: ${balanceInEth} POL\n`);
  
  if (balance === 0n) {
    throw new Error("Balance is 0! Cannot deploy.");
  }
  
  // Check existing deployment
  const deploymentFile = `./deployment-${hre.network.name}.json`;
  let existing = null;
  if (fs.existsSync(deploymentFile)) {
    existing = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    console.log("📄 Found existing deployment");
  }
  
  const addresses = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {},
    timestamp: new Date().toISOString(),
  };
  
  // 1. Use existing LearnHubToken (already deployed: 0xC40444E53a0Fc052181b59942cF5d2Af9Ae93320)
  let tokenAddress = existing?.contracts?.LearnHubToken || 
                     process.env.TOKEN_CONTRACT_ADDRESS || 
                     "0xC40444E53a0Fc052181b59942cF5d2Af9Ae93320"; // Already deployed address
  
  console.log(`\n✅ Using LearnHubToken: ${tokenAddress}`);
  
  // Verify token exists
  try {
    const token = await hre.ethers.getContractAt("LearnHubToken", tokenAddress);
    const name = await token.name();
    console.log(`   Verified: ${name}`);
  } catch (error) {
    console.warn(`   ⚠️  Could not verify token at ${tokenAddress}`);
    console.warn("   Continuing anyway...");
  }
  
  addresses.contracts.LearnHubToken = tokenAddress;
  
  // Check balance after first deployment
  const balanceAfter = await hre.ethers.provider.getBalance(deployer.address);
  const balanceAfterEth = hre.ethers.formatEther(balanceAfter);
  console.log(`\n   Remaining balance: ${balanceAfterEth} POL`);
  
  // 2. Deploy RewardDistribution if we have enough balance
  if (!existing?.contracts?.RewardDistribution) {
    const feeData = await hre.ethers.provider.getFeeData();
    const RewardDistribution = await hre.ethers.getContractFactory("RewardDistribution");
    const deployTx = await RewardDistribution.getDeployTransaction(deployer.address, tokenAddress);
    const gasEstimate = await hre.ethers.provider.estimateGas(deployTx);
    const estimatedCost = gasEstimate * (feeData.gasPrice || feeData.maxFeePerGas || 0n);
    
    if (balanceAfter > estimatedCost * 2n) {
      console.log("\n2. Deploying RewardDistribution...");
      console.log(`   Estimated: ${hre.ethers.formatEther(estimatedCost)} POL`);
      
      const rewardDistribution = await RewardDistribution.deploy(deployer.address, tokenAddress, {
        gasLimit: gasEstimate,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      });
      
      await rewardDistribution.waitForDeployment();
      const rewardDistributionAddress = await rewardDistribution.getAddress();
      console.log(`   ✅ Deployed: ${rewardDistributionAddress}`);
      
      addresses.contracts.RewardDistribution = rewardDistributionAddress;
      
      // Grant role
      console.log("\n3. Granting MINTER_ROLE...");
      const token = await hre.ethers.getContractAt("LearnHubToken", tokenAddress);
      const grantTx = await token.grantMinterRole(rewardDistributionAddress, {
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      });
      await grantTx.wait();
      console.log("   ✅ Role granted");
    } else {
      console.log("\n⚠️  Insufficient balance for RewardDistribution");
      console.log(`   Need: ~${hre.ethers.formatEther(estimatedCost)} POL`);
      console.log(`   Have: ${balanceAfterEth} POL`);
    }
  } else {
    console.log(`\n✅ Using existing RewardDistribution: ${existing.contracts.RewardDistribution}`);
    addresses.contracts.RewardDistribution = existing.contracts.RewardDistribution;
  }
  
  // Save deployment
  fs.writeFileSync(deploymentFile, JSON.stringify(addresses, null, 2));
  
  console.log("\n" + "=".repeat(60));
  console.log("✅ Deployment Summary");
  console.log("=".repeat(60));
  Object.entries(addresses.contracts).forEach(([name, addr]) => {
    console.log(`${name}: ${addr}`);
  });
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    if (error.message.includes("insufficient funds")) {
      console.error("\n💡 Solutions:");
      console.error("   1. Get more tokens from faucets");
      console.error("   2. Use local network: npm run deploy:local");
      console.error("   3. Wait for more tokens");
    }
    process.exit(1);
  });

