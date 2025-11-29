const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  
  if (!signers || signers.length === 0) {
    throw new Error(
      "No signers found. Please set PRIVATE_KEY in your .env file.\n" +
      "Example: PRIVATE_KEY=0x1234567890abcdef..."
    );
  }
  
  const deployer = signers[0];
  console.log("Deploying contracts with the account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const balanceInEth = hre.ethers.formatEther(balance);
  console.log("Account balance:", balanceInEth, "MATIC");
  
  const minBalance = hre.ethers.parseEther("0.05"); // Minimum 0.05 MATIC recommended
  
  if (balance === 0n) {
    console.warn("\n⚠️  WARNING: Account balance is 0!");
    console.warn("   You need MATIC tokens to pay for gas fees.");
    console.warn("   Get testnet tokens from: https://faucet.polygon.technology/");
    throw new Error("Insufficient balance: 0 MATIC");
  }
  
  if (balance < minBalance) {
    console.warn(`\n⚠️  WARNING: Low balance (${balanceInEth} MATIC)`);
    console.warn("   Recommended: At least 0.1 MATIC for deploying all contracts");
    console.warn("   Current balance might not be enough for all deployments");
    console.warn("   Get more tokens from: https://faucet.polygon.technology/");
  }

  // Deploy LearnHubToken
  console.log("\n1. Deploying LearnHubToken...");
  const LearnHubToken = await hre.ethers.getContractFactory("LearnHubToken");
  const token = await LearnHubToken.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("LearnHubToken deployed to:", tokenAddress);

  // Deploy RewardDistribution
  console.log("\n2. Deploying RewardDistribution...");
  const RewardDistribution = await hre.ethers.getContractFactory("RewardDistribution");
  
  // Estimate gas before deploying
  const deployTx = await RewardDistribution.getDeployTransaction(deployer.address, tokenAddress);
  const gasEstimate = await hre.ethers.provider.estimateGas(deployTx);
  const feeData = await hre.ethers.provider.getFeeData();
  const estimatedCost = gasEstimate * (feeData.gasPrice || feeData.maxFeePerGas || 0n);
  console.log(`   Estimated gas cost: ${hre.ethers.formatEther(estimatedCost)} MATIC`);
  
  const rewardDistribution = await RewardDistribution.deploy(deployer.address, tokenAddress);
  await rewardDistribution.waitForDeployment();
  const rewardDistributionAddress = await rewardDistribution.getAddress();
  console.log("RewardDistribution deployed to:", rewardDistributionAddress);

  // Grant MINTER_ROLE to RewardDistribution contract
  console.log("\n3. Granting MINTER_ROLE to RewardDistribution...");
  const grantTx = await token.grantMinterRole(rewardDistributionAddress);
  await grantTx.wait();
  console.log("MINTER_ROLE granted successfully");

  // Deploy CertificateNFT
  console.log("\n4. Deploying CertificateNFT...");
  const CertificateNFT = await hre.ethers.getContractFactory("CertificateNFT");
  const certificateNFT = await CertificateNFT.deploy(deployer.address);
  await certificateNFT.waitForDeployment();
  const certificateNFTAddress = await certificateNFT.getAddress();
  console.log("CertificateNFT deployed to:", certificateNFTAddress);

  console.log("\n✅ Deployment Summary:");
  console.log("==========================================");
  console.log("LearnHubToken:", tokenAddress);
  console.log("RewardDistribution:", rewardDistributionAddress);
  console.log("CertificateNFT:", certificateNFTAddress);
  console.log("==========================================");

  // Save addresses to a file for easy reference
  const fs = require("fs");
  const addresses = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      LearnHubToken: tokenAddress,
      RewardDistribution: rewardDistributionAddress,
      CertificateNFT: certificateNFTAddress,
    },
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    `./deployment-${hre.network.name}.json`,
    JSON.stringify(addresses, null, 2)
  );
  console.log(`\n📝 Deployment info saved to: ./deployment-${hre.network.name}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

