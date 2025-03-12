import { JsonRpcProvider, Wallet } from "ethers";
import { normalDeploy } from "../deployUtils";
import { vars } from "hardhat/config";
import { abi as testKuruAbi } from "../../artifacts/contracts/testingKuru/TestKuru.sol/TestKuru.json";
import { bytecode as testKuruBytecode } from "../../artifacts/contracts/testingKuru/TestKuru.sol/TestKuru.json";
import { TestKuru } from "../../typechain-types";

let deployer: Wallet;

// address kuruRouterAddress_,
// address memeToken_,
// address pairToken_,
// address lpOwner_

const kuruRouterAddress = "0xc816865f172d640d93712C68a7E1F83F3fA63235";
const pairTokenAddress = "0x9E58915818c0cF3a7A0962aedF91ACFB8ff5370D";
const lpOwnerAddress = "0xeeEFbDFa58878e73ac087325a41EdFdf12eF4dbd";

async function main() {
  const provider = new JsonRpcProvider("https://testnet-rpc.monad.xyz");
  deployer = new Wallet(vars.get("INITIAL_OWNER_PRIVATE_KEY"), provider);
  console.log("deployer address", deployer.address);

  const deployTestKuru = async (deployer: Wallet) => {
    const testingKuruInstance = await normalDeploy(
      deployer,
      testKuruAbi,
      testKuruBytecode,
      [kuruRouterAddress, pairTokenAddress, lpOwnerAddress]
    );

    return testingKuruInstance as TestKuru;
  };

  const address = await deployTestKuru(deployer);
  console.log("TestKuru deployed at", await address.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
