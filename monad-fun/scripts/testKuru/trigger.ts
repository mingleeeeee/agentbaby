import { JsonRpcProvider, Wallet } from "ethers";
import { vars } from "hardhat/config";
import { ethers } from "hardhat";
import { abi as testKuruAbi } from "../../artifacts/contracts/testingKuru/TestKuru.sol/TestKuru.json";
import { abi as pairTokenAbi } from "../../artifacts/contracts/example/MyTokenV1.sol/MyTokenV1.json";

const testKuruAddress = "0xD1C66181B5FcdD70573DcfD3052d68E83E51981f";
const pairTokenAddress = "0x9E58915818c0cF3a7A0962aedF91ACFB8ff5370D";

async function main() {
  const provider = new JsonRpcProvider("https://testnet-rpc.monad.xyz");
  const signer = new Wallet(vars.get("INITIAL_OWNER_PRIVATE_KEY"), provider);

  // to get pool address
  // 1. using bonding contract, to get tokenInfo, get the agent token address in the tokenInfo
  // 2. using the agent token contract, get the balancer pool address
  const testKuruCall = new ethers.Contract(
    testKuruAddress,
    testKuruAbi,
    signer
  );

  const pairToken = new ethers.Contract(pairTokenAddress, pairTokenAbi, signer);

  console.log("memeToken", await testKuruCall.memeToken());
  console.log("pairToken", await testKuruCall.pairToken());
  console.log("lpOwner", await testKuruCall.lpOwner());

  // step 1 . mintTokenToThisContract()
  //   await pairToken.approve(testKuruAddress, ethers.parseEther("10000"));
  //   await testKuruCall.mintTokenToThisContract();
  console.log("pairToken balance", await pairToken.balanceOf(testKuruAddress));
  console.log("meme balance", await testKuruCall.balanceOf(testKuruAddress));

  // step 2 . createMarket , check the market address
  //   await testKuruCall.createMarket();
  console.log("market address", await testKuruCall.kuruMarketProxyAddress());

  // step 3 . addLiquidity
  //   await testKuruCall.addLiquidity();
  console.log("kuruVault address", await testKuruCall.kuruVaultAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
