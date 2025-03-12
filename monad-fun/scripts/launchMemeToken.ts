import { JsonRpcProvider, Wallet } from "ethers";
import { ethers } from "hardhat";
import { abi as bondingAbi } from "../artifacts/contracts/fun/Bonding.sol/Bonding.json";
import { abi as tokenAbi } from "../artifacts/contracts/example/MyTokenV1.sol/MyTokenV1.json";
import { vars } from "hardhat/config";

const bondingProxyAddress = "0xd565dcEc43f6EdA952AB0Baa96093620677240cC";
const tokenProxyAddress = "0x9E58915818c0cF3a7A0962aedF91ACFB8ff5370D";

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

  // approve bonding contract first
  const approveTx = await tokenCall.approve(
    bondingProxyAddress,
    ethers.parseEther("200")
  );
  await approveTx.wait();

  const launchTokenTx = await bongingCall.launch(
    "BABY",
    "$BABY",
    [0, 1, 2],
    "BABY",
    "it's a BABY",
    ["", "", "", ""],
    ethers.parseEther("200") // purchase amount (including fee)
  );
  await launchTokenTx.wait();
  console.log("Token launched");
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
