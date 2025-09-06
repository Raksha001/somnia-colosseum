import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying Somnia Colosseum Duel Contract...");

  // // Get the deployer account
  // const [deployer] = await hre.ethers.getSigners();
  const deployAddress = process.env.deployAddress || "0x988bDE707ef69A55EB9AD36a2a27156e39070be0"
  console.log("Deploying with account:",deployAddress);
  
  const balance = await hre.ethers.provider.getBalance(deployAddress);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy the contract
  const Duel = await hre.ethers.getContractFactory("Duel");
  const feeRecipient = process.env.FEE_RECIPIENT || deployAddress;
  
  console.log("Fee recipient:", feeRecipient);
  
  const duel = await Duel.deploy(feeRecipient);
  //const duel = await Duel.deploy();
  await duel.waitForDeployment();

  const contractAddress = await duel.getAddress();
  console.log("✅ Duel contract deployed to:", contractAddress);

  // Verify the contract on Etherscan (if not on hardhat network)
  // if (hre.network.name !== "hardhat") {
  //   console.log("⏳ Waiting for block confirmations...");
  //   await duel.deploymentTransaction().wait(6);

  //   console.log("🔍 Verifying contract on Etherscan...");
  //   try {
  //     await hre.run("verify:verify", {
  //       address: contractAddress,
  //       constructorArguments: [feeRecipient],
  //     });
  //     console.log("✅ Contract verified on Etherscan");
  //   } catch (error) {
  //     console.log("❌ Error verifying contract:", error.message);
  //   }
  // }
  // Save to file for frontend usage
//   const fs = require('fs');
//   fs.writeFileSync(
//     './deployment.json',
//     JSON.stringify(deploymentInfo, null, 2)
//   );
  
//   console.log("💾 Deployment info saved to deployment.json");
// }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });