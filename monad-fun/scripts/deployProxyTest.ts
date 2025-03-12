import { ContractFactory, ethers, JsonRpcProvider, Wallet } from "ethers";
import {
  bytecode as proxyAdminBytecode,
  abi as proxyAdminAbi,
} from "../artifacts/@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json";
import {
  bytecode as proxyBytecode,
  abi as proxyAbi,
} from "../artifacts/@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json";
import {
  abi as tokenAbi,
  bytecode as tokenBytecode,
} from "../artifacts/contracts/example/MyTokenV1.sol/MyTokenV1.json";
import { vars } from "hardhat/config";
import { encodeFunctionData } from "viem";

async function main() {
  const provider = new JsonRpcProvider("https://testnet-rpc.monad.xyz");
  const signer = new Wallet(vars.get("INITIAL_OWNER_PRIVATE_KEY"), provider);
  console.log("deployer address", signer.address);

  // deploy proxyAdmin
  const proxyAdminFactory = new ContractFactory(
    proxyAdminAbi,
    proxyAdminBytecode,
    signer
  );
  const param = signer.address;
  const proxyAdminDeployTx = await proxyAdminFactory.deploy(param);
  const proxyAdmin = await proxyAdminDeployTx.waitForDeployment();

  console.log("ProxyAdmin deployed at:", await proxyAdmin.getAddress());

  // deploy MyTokenV1 implementation
  const mytokenFactory = new ContractFactory(tokenAbi, tokenBytecode, signer);
  const mytokenTx = await mytokenFactory.deploy();
  const mytoken = await mytokenTx.waitForDeployment();
  console.log("Implementation deployed at:", await mytoken.getAddress());

  // init data for MyTokenV1
  const initData = encodeFunctionData({
    abi: tokenAbi,
    functionName: "initialize",
    args: ["Fake Monad", "FMON", 123],
  });

  // deploy TransparentUpgradeableProxy
  const proxyFactory = new ContractFactory(proxyAbi, proxyBytecode, signer);
  const proxyContract = await proxyFactory.deploy(
    await mytoken.getAddress(),
    await proxyAdmin.getAddress(),
    initData
  );
  await proxyContract.waitForDeployment();
  console.log("Transparent Proxy at:", await proxyContract.getAddress());

  const callContract = new ethers.Contract(
    await proxyContract.getAddress(),
    tokenAbi,
    signer
  );

  const myValue = await callContract.myValue();
  console.log("myValue", myValue.toString());
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
