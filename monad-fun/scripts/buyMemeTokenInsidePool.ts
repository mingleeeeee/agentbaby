import { JsonRpcProvider, Wallet } from "ethers";
import { ethers } from "hardhat";
import { abi as bondingAbi } from "../artifacts/contracts/fun/Bonding.sol/Bonding.json";
import { abi as tokenAbi } from "../artifacts/contracts/example/MyTokenV1.sol/MyTokenV1.json";
import { vars } from "hardhat/config";

// to let the token graduate, pay 35000 ether
const bondingProxyAddress = "0xd565dcEc43f6EdA952AB0Baa96093620677240cC";
const tokenProxyAddress = "0x9E58915818c0cF3a7A0962aedF91ACFB8ff5370D";
const fRouterProxyAddress = "0xBbC69B69eD9392D72506724451c4127a748f947B";
async function main() {
  const provider = new JsonRpcProvider("https://testnet-rpc.monad.xyz");
  const signer = new Wallet(vars.get("INITIAL_OWNER_PRIVATE_KEY"), provider);
  console.log("signer address", signer.address);

  const tokenCall = new ethers.Contract(tokenProxyAddress, tokenAbi, signer);

  const bongingCall = new ethers.Contract(
    bondingProxyAddress,
    bondingAbi,
    signer
  );

  // approve router proxy contract first
  const approveTx = await tokenCall.approve(
    fRouterProxyAddress,
    ethers.parseEther("50000")
  );
  await approveTx.wait();
  console.log("Token approved");

  // to find out the token address
  // here just simply use the first token
  const tokenInfo = await bongingCall.tokenInfo(
    await bongingCall.tokenInfos(0)
  );
  console.log("Token info", tokenInfo);

  const buyTx = await bongingCall.buy(
    ethers.parseEther("35000"),
    tokenInfo.token
  );
  await buyTx.wait();
  console.log("Token bought");
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
