const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];

  console.log("=".repeat(60));
  console.log("⚡ Redeploy RewardDistribution Contract");
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
    console.log(`   RewardDistribution (OLD): ${existing.contracts?.RewardDistribution}`);
    console.log(`   CertificateNFT: ${existing.contracts?.CertificateNFT}`);
    console.log(`   CoursePayment: ${existing.contracts?.CoursePayment}`);
  }

  if (!existing?.contracts?.LearnHubToken) {
    throw new Error("LearnHubToken not deployed. Please deploy it first.");
  }

  const tokenAddress = existing.contracts.LearnHubToken;

  console.log("\n📋 Configuration:");
  console.log(`   Token Address: ${tokenAddress}`);
  console.log(`   Admin Address: ${deployer.address}`);

  // Estimate gas
  console.log("\n⛽ Estimating gas for RewardDistribution...");
  const RewardDistribution = await hre.ethers.getContractFactory("RewardDistribution");
  const deployTx = await RewardDistribution.getDeployTransaction(
    deployer.address,
    tokenAddress
  );

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
  console.log(`\n🚀 Deploying RewardDistribution...`);
  const rewardDistribution = await RewardDistribution.deploy(
    deployer.address,
    tokenAddress,
    {
      gasLimit: gasEstimate,
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    }
  );

  await rewardDistribution.waitForDeployment();
  const rewardDistributionAddress = await rewardDistribution.getAddress();
  console.log(`\n✅ RewardDistribution deployed!`);
  console.log(`   Address: ${rewardDistributionAddress}`);

  // Grant MINTER_ROLE to RewardDistribution contract
  console.log(`\n🔐 Granting MINTER_ROLE to RewardDistribution...`);
  const tokenArtifact = require('../artifacts/contracts/LearnHubToken.sol/LearnHubToken.json');
  const tokenContract = new hre.ethers.Contract(
    tokenAddress,
    tokenArtifact.abi,
    deployer
  );
  
  const MINTER_ROLE = await tokenContract.MINTER_ROLE();
  const hasRole = await tokenContract.hasRole(MINTER_ROLE, rewardDistributionAddress);
  
  if (!hasRole) {
    const grantRoleTx = await tokenContract.grantRole(MINTER_ROLE, rewardDistributionAddress);
    await grantRoleTx.wait();
    console.log(`✅ MINTER_ROLE granted`);
  } else {
    console.log(`✅ MINTER_ROLE already granted`);
  }

  // Grant DISTRIBUTOR_ROLE to deployer (backend)
  console.log(`\n🔐 Granting DISTRIBUTOR_ROLE to deployer...`);
  const DISTRIBUTOR_ROLE = await rewardDistribution.DISTRIBUTOR_ROLE();
  const hasDistributorRole = await rewardDistribution.hasRole(DISTRIBUTOR_ROLE, deployer.address);
  
  if (!hasDistributorRole) {
    const grantDistributorTx = await rewardDistribution.grantDistributorRole(deployer.address);
    await grantDistributorTx.wait();
    console.log(`✅ DISTRIBUTOR_ROLE granted`);
  } else {
    console.log(`✅ DISTRIBUTOR_ROLE already granted`);
  }

  // Update deployment file
  const addresses = {
    ...existing,
    contracts: {
      ...existing?.contracts,
      RewardDistribution: rewardDistributionAddress,
    },
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(deploymentFile, JSON.stringify(addresses, null, 2));

  console.log(`\n📝 Deployment updated: ${deploymentFile}`);

  console.log(`\n✅ RewardDistribution redeployed successfully!`);
  console.log("=".repeat(60));
  console.log("📋 Deployment Summary:");
  console.log("=".repeat(60));
  console.log(`LearnHubToken: ${addresses.contracts.LearnHubToken}`);
  console.log(`RewardDistribution (NEW): ${addresses.contracts.RewardDistribution}`);
  console.log(`CertificateNFT: ${addresses.contracts.CertificateNFT}`);
  console.log(`CoursePayment: ${addresses.contracts.CoursePayment}`);
  console.log("=".repeat(60));

  console.log("\n💡 Next steps:");
  console.log(`   1. Update .env: REWARD_DISTRIBUTION_ADDRESS=${rewardDistributionAddress}`);
  console.log(`   2. Restart backend server`);
  console.log(`   3. Test streak reward with streak >= 1 day`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  });

