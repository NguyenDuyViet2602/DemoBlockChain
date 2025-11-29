// Deploy only RewardDistribution with minimal gas
// Assumes LearnHubToken is already deployed
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];
  
  console.log("=".repeat(60));
  console.log("⚡ Deploy RewardDistribution Only");
  console.log("=".repeat(60));
  console.log(`Deployer: ${deployer.address}`);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const balanceInEth = hre.ethers.formatEther(balance);
  console.log(`Balance: ${balanceInEth} POL\n`);
  
  // Use existing LearnHubToken
  const tokenAddress = process.env.TOKEN_CONTRACT_ADDRESS || 
                       "0xC40444E53a0Fc052181b59942cF5d2Af9Ae93320";
  
  console.log(`Using LearnHubToken: ${tokenAddress}`);
  
  // Verify token
  try {
    const token = await hre.ethers.getContractAt("LearnHubToken", tokenAddress);
    const name = await token.name();
    console.log(`✅ Verified: ${name}\n`);
  } catch (error) {
    throw new Error(`Cannot verify token at ${tokenAddress}: ${error.message}`);
  }
  
  // Estimate gas for RewardDistribution
  console.log("Estimating gas for RewardDistribution...");
  const RewardDistribution = await hre.ethers.getContractFactory("RewardDistribution");
  const deployTx = await RewardDistribution.getDeployTransaction(deployer.address, tokenAddress);
  
  const feeData = await hre.ethers.provider.getFeeData();
  const gasEstimate = await hre.ethers.provider.estimateGas(deployTx);
  const estimatedCost = gasEstimate * (feeData.gasPrice || feeData.maxFeePerGas || 0n);
  
  console.log(`Estimated gas: ${gasEstimate.toString()}`);
  console.log(`Estimated cost: ${hre.ethers.formatEther(estimatedCost)} POL`);
  console.log(`Current balance: ${balanceInEth} POL`);
  
  if (balance < estimatedCost) {
    const shortfall = hre.ethers.formatEther(estimatedCost - balance);
    console.log(`\n❌ Insufficient balance!`);
    console.log(`   Need: ${hre.ethers.formatEther(estimatedCost)} POL`);
    console.log(`   Have: ${balanceInEth} POL`);
    console.log(`   Shortfall: ${shortfall} POL`);
    console.log(`\n💡 Options:`);
    console.log(`   1. Get more tokens from faucets`);
    console.log(`   2. Use local network: npm run deploy:local`);
    console.log(`   3. Wait for faucet reset (24h)`);
    process.exit(1);
  }
  
  // Try to deploy with optimized gas
  console.log(`\n🚀 Deploying RewardDistribution...`);
  console.log(`   Using optimized gas settings...`);
  
  try {
    const rewardDistribution = await RewardDistribution.deploy(deployer.address, tokenAddress, {
      gasLimit: gasEstimate,
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    });
    
    console.log(`   Transaction sent, waiting for confirmation...`);
    await rewardDistribution.waitForDeployment();
    
    const rewardDistributionAddress = await rewardDistribution.getAddress();
    console.log(`\n✅ RewardDistribution deployed!`);
    console.log(`   Address: ${rewardDistributionAddress}`);
    
    // Grant MINTER_ROLE
    console.log(`\n🔐 Granting MINTER_ROLE...`);
    const token = await hre.ethers.getContractAt("LearnHubToken", tokenAddress);
    
    const grantGasEstimate = await token.grantMinterRole.estimateGas(rewardDistributionAddress);
    const grantCost = grantGasEstimate * (feeData.gasPrice || feeData.maxFeePerGas || 0n);
    
    console.log(`   Estimated cost: ${hre.ethers.formatEther(grantCost)} POL`);
    
    const remainingBalance = await hre.ethers.provider.getBalance(deployer.address);
    if (remainingBalance < grantCost) {
      console.warn(`   ⚠️  Insufficient balance for granting role`);
      console.warn(`   You can grant role later when you have more tokens`);
    } else {
      const grantTx = await token.grantMinterRole(rewardDistributionAddress, {
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      });
      await grantTx.wait();
      console.log(`   ✅ MINTER_ROLE granted successfully!`);
    }
    
    // Save deployment
    const deploymentFile = `./deployment-${hre.network.name}.json`;
    const addresses = {
      network: hre.network.name,
      deployer: deployer.address,
      contracts: {
        LearnHubToken: tokenAddress,
        RewardDistribution: rewardDistributionAddress,
      },
      timestamp: new Date().toISOString(),
    };
    
    fs.writeFileSync(deploymentFile, JSON.stringify(addresses, null, 2));
    
    console.log(`\n📝 Deployment saved to: ${deploymentFile}`);
    console.log(`\n✅ Success! RewardDistribution is ready to use.`);
    
  } catch (error) {
    if (error.message.includes("insufficient funds")) {
      console.error(`\n❌ Deployment failed: Insufficient funds`);
      console.error(`   You need more POL tokens to complete deployment`);
    } else {
      console.error(`\n❌ Deployment failed: ${error.message}`);
    }
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

