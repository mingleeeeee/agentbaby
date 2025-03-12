import { JsonRpcProvider, Wallet } from "ethers";
import { ethers } from "hardhat";
import { abi as bondingAbi } from "../artifacts/contracts/fun/Bonding.sol/Bonding.json";
import { vars } from "hardhat/config";

const bondingProxyAddress = "0xd565dcEc43f6EdA952AB0Baa96093620677240cC";
async function main() {
  const provider = new JsonRpcProvider("https://testnet-rpc.monad.xyz");
  const signer = new Wallet(vars.get("INITIAL_OWNER_PRIVATE_KEY"), provider);
  console.log("signer address", signer.address);

  const bongingCall = new ethers.Contract(
    bondingProxyAddress,
    bondingAbi,
    signer
  );

  const tokenInfo = await bongingCall.tokenInfo(
    await bongingCall.tokenInfos(0)
  );
  console.log("Token info", tokenInfo);

  const unwrapTokenTx = await bongingCall.unwrapToken(tokenInfo.token, [
    signer.address,
  ]);
  await unwrapTokenTx.wait();
  console.log("Token unwraped");
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
