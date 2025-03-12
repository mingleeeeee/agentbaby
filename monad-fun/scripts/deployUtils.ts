import {
  BytesLike,
  ContractFactory,
  Interface,
  InterfaceAbi,
  Wallet,
} from "ethers";
import {
  bytecode as proxyAdminBytecode,
  abi as proxyAdminAbi,
} from "../artifacts/@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol/ProxyAdmin.json";
import {
  bytecode as proxyBytecode,
  abi as proxyAbi,
} from "../artifacts/@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json";

import { Abi, encodeFunctionData } from "viem";

// deploy proxyAdmin and proxy with implementation
export const deployProxyAdminAndProxy = async (
  signer: Wallet,
  implAbi: Interface | InterfaceAbi,
  implBytecode:
    | BytesLike
    | {
        object: string;
      },
  implInitArgs: any[]
) => {
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

  // deploy implementation
  const implFactory = new ContractFactory(implAbi, implBytecode, signer);
  const implTx = await implFactory.deploy();
  const impl = await implTx.waitForDeployment();
  console.log("Implementation deployed at:", await impl.getAddress());

  // init data for implementation
  const initData = encodeFunctionData({
    abi: implAbi as Abi,
    functionName: "initialize",
    args: implInitArgs,
  });

  // deploy TransparentUpgradeableProxy
  const proxyFactory = new ContractFactory(proxyAbi, proxyBytecode, signer);
  const proxyContract = await proxyFactory.deploy(
    await impl.getAddress(),
    await proxyAdmin.getAddress(),
    initData
  );
  await proxyContract.waitForDeployment();
  console.log("Transparent Proxy at:", await proxyContract.getAddress());

  return proxyContract;
};

export const normalDeploy = async (
  signer: Wallet,
  contractAbi: Interface | InterfaceAbi,
  contractBytecode:
    | BytesLike
    | {
        object: string;
      },
  contractArgs: any[]
) => {
  const contractFactory = new ContractFactory(
    contractAbi,
    contractBytecode,
    signer
  );
  const contractTx = await contractFactory.deploy(...contractArgs);
  const contract = await contractTx.waitForDeployment();
  return contract;
};
