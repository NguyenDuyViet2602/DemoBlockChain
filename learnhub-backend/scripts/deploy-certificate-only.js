// Deploy only CertificateNFT
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];
  
  console.log("=".repeat(60));
  console.log("⚡ Deploy CertificateNFT");
  console.log("=".repeat(60));
  console.log(`Deployer: ${deployer.address}`);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const balanceInEth = hre.ethers.formatEther(balance);
  console.log(`Balance: ${balanceInEth} POL\n`);
  
  // Load existing deployment
  const deploymentFile = `./deployment-${hre.network.name}.json`;
  let existing = null;
  if (fs.existsSync(deploymentFile)) {
    existing = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    console.log("📄 Found existing deployment");
    console.log(`   LearnHubToken: ${existing.contracts?.LearnHubToken}`);
    console.log(`   RewardDistribution: ${existing.contracts?.RewardDistribution}`);
  }
  
  if (existing?.contracts?.CertificateNFT) {
    console.log(`\n✅ CertificateNFT already deployed: ${existing.contracts.CertificateNFT}`);
    return;
  }
  
  // Estimate gas
  console.log("Estimating gas for CertificateNFT...");
  const CertificateNFT = await hre.ethers.getContractFactory("CertificateNFT");
  const deployTx = await CertificateNFT.getDeployTransaction(deployer.address);
  
  const feeData = await hre.ethers.provider.getFeeData();
  const gasEstimate = await hre.ethers.provider.estimateGas(deployTx);
  const estimatedCost = gasEstimate * (feeData.gasPrice || feeData.maxFeePerGas || 0n);
  
  console.log(`Estimated gas: ${gasEstimate.toString()}`);
  console.log(`Estimated cost: ${hre.ethers.formatEther(estimatedCost)} POL`);
  console.log(`Current balance: ${balanceInEth} POL`);
  
  if (balance < estimatedCost) {
    throw new Error(`Insufficient balance! Need ${hre.ethers.formatEther(estimatedCost)} POL`);
  }
  
  // Deploy
  console.log(`\n🚀 Deploying CertificateNFT...`);
  const certificateNFT = await CertificateNFT.deploy(deployer.address, {
    gasLimit: gasEstimate,
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
  });
  
  await certificateNFT.waitForDeployment();
  const certificateNFTAddress = await certificateNFT.getAddress();
  console.log(`\n✅ CertificateNFT deployed!`);
  console.log(`   Address: ${certificateNFTAddress}`);
  
  // Update deployment file
  const addresses = {
    ...existing,
    contracts: {
      ...existing?.contracts,
      CertificateNFT: certificateNFTAddress,
    },
    timestamp: new Date().toISOString(),
  };
  
  fs.writeFileSync(deploymentFile, JSON.stringify(addresses, null, 2));
  
  console.log(`\n📝 Deployment updated: ${deploymentFile}`);
  console.log(`\n✅ All contracts deployed successfully!`);
  console.log("=".repeat(60));
  console.log("📋 Deployment Summary:");
  console.log("=".repeat(60));
  console.log(`LearnHubToken: ${addresses.contracts.LearnHubToken}`);
  console.log(`RewardDistribution: ${addresses.contracts.RewardDistribution}`);
  console.log(`CertificateNFT: ${addresses.contracts.CertificateNFT}`);
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  });

