// Script to deploy remaining contracts (RewardDistribution and CertificateNFT)
// Use this if LearnHubToken is already deployed
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const signers = await hre.ethers.getSigners();
  
  if (!signers || signers.length === 0) {
    throw new Error("No signers found. Please set PRIVATE_KEY in your .env file.");
  }
  
  const deployer = signers[0];
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const balanceInEth = hre.ethers.formatEther(balance);
  console.log("Account balance:", balanceInEth, "POL");
  
  // Check if deployment file exists
  let existingDeployment = null;
  const deploymentFile = `./deployment-${hre.network.name}.json`;
  
  if (fs.existsSync(deploymentFile)) {
    existingDeployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    console.log("\n📄 Found existing deployment file");
    console.log("   LearnHubToken:", existingDeployment.contracts?.LearnHubToken);
  }
  
  // Get token address
  let tokenAddress = existingDeployment?.contracts?.LearnHubToken;
  
  if (!tokenAddress) {
    // Try to get from environment or ask user
    tokenAddress = process.env.TOKEN_CONTRACT_ADDRESS;
    
    if (!tokenAddress) {
      console.log("\n⚠️  LearnHubToken address not found!");
      console.log("   Please provide TOKEN_CONTRACT_ADDRESS in .env");
      console.log("   Or deploy LearnHubToken first");
      process.exit(1);
    }
  }
  
  console.log("\n✅ Using LearnHubToken at:", tokenAddress);
  
  const addresses = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      LearnHubToken: tokenAddress,
    },
    timestamp: new Date().toISOString(),
  };
  
  // Deploy RewardDistribution if not exists
  if (!existingDeployment?.contracts?.RewardDistribution) {
    console.log("\n2. Deploying RewardDistribution...");
    
    // Estimate gas
    const RewardDistribution = await hre.ethers.getContractFactory("RewardDistribution");
    const deployTx = await RewardDistribution.getDeployTransaction(deployer.address, tokenAddress);
    const gasEstimate = await hre.ethers.provider.estimateGas(deployTx);
    const feeData = await hre.ethers.provider.getFeeData();
    const estimatedCost = gasEstimate * (feeData.gasPrice || feeData.maxFeePerGas || 0n);
    console.log(`   Estimated cost: ${hre.ethers.formatEther(estimatedCost)} POL`);
    
    if (balance < estimatedCost * 2n) {
      console.warn("   ⚠️  Balance might not be enough!");
    }
    
    const rewardDistribution = await RewardDistribution.deploy(deployer.address, tokenAddress);
    await rewardDistribution.waitForDeployment();
    const rewardDistributionAddress = await rewardDistribution.getAddress();
    console.log("   ✅ RewardDistribution deployed to:", rewardDistributionAddress);
    
    addresses.contracts.RewardDistribution = rewardDistributionAddress;
    
    // Grant MINTER_ROLE
    console.log("\n3. Granting MINTER_ROLE to RewardDistribution...");
    const token = await hre.ethers.getContractAt("LearnHubToken", tokenAddress);
    const grantTx = await token.grantMinterRole(rewardDistributionAddress);
    await grantTx.wait();
    console.log("   ✅ MINTER_ROLE granted successfully");
  } else {
    console.log("\n✅ RewardDistribution already deployed:", existingDeployment.contracts.RewardDistribution);
    addresses.contracts.RewardDistribution = existingDeployment.contracts.RewardDistribution;
  }
  
  // Deploy CertificateNFT if not exists
  if (!existingDeployment?.contracts?.CertificateNFT) {
    console.log("\n4. Deploying CertificateNFT...");
    
    const CertificateNFT = await hre.ethers.getContractFactory("CertificateNFT");
    const deployTx = await CertificateNFT.getDeployTransaction(deployer.address);
    const gasEstimate = await hre.ethers.provider.estimateGas(deployTx);
    const feeData = await hre.ethers.provider.getFeeData();
    const estimatedCost = gasEstimate * (feeData.gasPrice || feeData.maxFeePerGas || 0n);
    console.log(`   Estimated cost: ${hre.ethers.formatEther(estimatedCost)} POL`);
    
    if (balance < estimatedCost * 2n) {
      console.warn("   ⚠️  Balance might not be enough!");
    }
    
    const certificateNFT = await CertificateNFT.deploy(deployer.address);
    await certificateNFT.waitForDeployment();
    const certificateNFTAddress = await certificateNFT.getAddress();
    console.log("   ✅ CertificateNFT deployed to:", certificateNFTAddress);
    
    addresses.contracts.CertificateNFT = certificateNFTAddress;
  } else {
    console.log("\n✅ CertificateNFT already deployed:", existingDeployment.contracts.CertificateNFT);
    addresses.contracts.CertificateNFT = existingDeployment.contracts.CertificateNFT;
  }
  
  // Save deployment info
  fs.writeFileSync(deploymentFile, JSON.stringify(addresses, null, 2));
  
  console.log("\n✅ Deployment Summary:");
  console.log("==========================================");
  console.log("LearnHubToken:", addresses.contracts.LearnHubToken);
  console.log("RewardDistribution:", addresses.contracts.RewardDistribution);
  console.log("CertificateNFT:", addresses.contracts.CertificateNFT);
  console.log("==========================================");
  console.log(`\n📝 Deployment info saved to: ${deploymentFile}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error.message);
    if (error.message.includes("insufficient funds")) {
      console.error("\n💡 You need more POL tokens. Try:");
      console.error("   1. QuickNode Faucet: https://faucet.quicknode.com/polygon/amoy");
      console.error("   2. Or use local network: npm run deploy:local");
    }
    process.exit(1);
  });

