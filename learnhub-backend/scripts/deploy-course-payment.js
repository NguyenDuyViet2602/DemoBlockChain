// Deploy only CoursePayment contract
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];
  
  console.log("=".repeat(60));
  console.log("⚡ Deploy CoursePayment");
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
    console.log(`   CertificateNFT: ${existing.contracts?.CertificateNFT}`);
  }
  
  if (existing?.contracts?.CoursePayment) {
    console.log(`\n✅ CoursePayment already deployed: ${existing.contracts.CoursePayment}`);
    return;
  }

  // Check required contracts
  if (!existing?.contracts?.LearnHubToken) {
    throw new Error("LearnHubToken not found! Please deploy LearnHubToken first.");
  }

  const tokenAddress = existing.contracts.LearnHubToken;
  const treasuryAddress = deployer.address; // Use deployer as treasury for now
  const initialRate = hre.ethers.parseEther("1000"); // 1000 LHT = 1 VND (example rate)

  console.log(`\n📋 Configuration:`);
  console.log(`   Token Address: ${tokenAddress}`);
  console.log(`   Treasury Address: ${treasuryAddress}`);
  console.log(`   Initial Rate: ${hre.ethers.formatEther(initialRate)} LHT per 1 VND`);

  // Estimate gas
  console.log("\n⛽ Estimating gas for CoursePayment...");
  const CoursePayment = await hre.ethers.getContractFactory("CoursePayment");
  const deployTx = await CoursePayment.getDeployTransaction(
    deployer.address,
    tokenAddress,
    treasuryAddress,
    initialRate
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
  console.log(`\n🚀 Deploying CoursePayment...`);
  const coursePayment = await CoursePayment.deploy(
    deployer.address,
    tokenAddress,
    treasuryAddress,
    initialRate,
    {
      gasLimit: gasEstimate,
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    }
  );
  
  await coursePayment.waitForDeployment();
  const coursePaymentAddress = await coursePayment.getAddress();
  console.log(`\n✅ CoursePayment deployed!`);
  console.log(`   Address: ${coursePaymentAddress}`);

  // Grant PAYMENT_HANDLER_ROLE to backend (deployer for now)
  console.log(`\n🔐 Granting PAYMENT_HANDLER_ROLE to deployer...`);
  const grantTx = await coursePayment.grantRole(
    await coursePayment.PAYMENT_HANDLER_ROLE(),
    deployer.address
  );
  await grantTx.wait();
  console.log(`✅ PAYMENT_HANDLER_ROLE granted`);

  // Update deployment file
  const addresses = {
    ...existing,
    contracts: {
      ...existing?.contracts,
      CoursePayment: coursePaymentAddress,
    },
    timestamp: new Date().toISOString(),
  };
  
  fs.writeFileSync(deploymentFile, JSON.stringify(addresses, null, 2));
  
  console.log(`\n📝 Deployment updated: ${deploymentFile}`);
  console.log(`\n✅ CoursePayment deployed successfully!`);
  console.log("=".repeat(60));
  console.log("📋 Deployment Summary:");
  console.log("=".repeat(60));
  console.log(`LearnHubToken: ${addresses.contracts.LearnHubToken}`);
  console.log(`RewardDistribution: ${addresses.contracts.RewardDistribution}`);
  console.log(`CertificateNFT: ${addresses.contracts.CertificateNFT}`);
  console.log(`CoursePayment: ${addresses.contracts.CoursePayment}`);
  console.log("=".repeat(60));
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Add to .env: COURSE_PAYMENT_ADDRESS=${coursePaymentAddress}`);
  console.log(`   2. Update treasury address if needed`);
  console.log(`   3. Adjust exchange rate if needed (currently: ${hre.ethers.formatEther(initialRate)} LHT per 1 VND)`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  });

