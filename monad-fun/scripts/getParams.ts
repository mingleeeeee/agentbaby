import { JsonRpcProvider, Wallet } from "ethers";
import { ethers } from "hardhat";
import { abi as bondingAbi } from "../artifacts/contracts/fun/Bonding.sol/Bonding.json";
import { abi as tokenAbi } from "../artifacts/contracts/example/MyTokenV1.sol/MyTokenV1.json";

import { abi as agentFactoryAbi } from "../artifacts/contracts/virtualPersona/AgentFactoryV3.sol/AgentFactoryV3.json";
import { vars } from "hardhat/config";

const agentFactoryAddress = "0x04B3db04EF68384B55091DCc16EC5BC187c0C123";
const bondingProxyAddress = "0x07BD7E0B8a1CFC32f7243A47c208C506B24d0Af5";
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

  console.log(
    "get token info",
    await bongingCall.tokenInfo(await bongingCall.tokenInfos(0))
  );

  const agentFactoryCall = new ethers.Contract(
    agentFactoryAddress,
    agentFactoryAbi,
    signer
  );

  console.log("get params", await agentFactoryCall.getKuruRouterAddress());
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
