import { JsonRpcProvider, Wallet } from "ethers";
import {
  abi as weightedPoolFactoryAbi,
  bytecode as weightedPoolFactoryBytecode,
} from "../../artifacts/contracts/dexPool/balancer-v2/contracts/WeightedPoolFactory.sol/WeightedPoolFactory.json";
import {
  abi as protocolFeePercentagesProviderAbi,
  bytecode as protocolFeePercentagesProviderBytecode,
} from "../../artifacts/contracts/dexPool/balancer-v2/contracts/ProtocolFeePercentagesProvider.sol/ProtocolFeePercentagesProvider.json";

import { normalDeploy } from "../deployUtils";
import {
  ProtocolFeePercentagesProvider,
  WeightedPoolFactory,
} from "../../typechain-types";
import { ethers } from "hardhat";
import { vars } from "hardhat/config";

const MODE = "test"; // test or mainnet
// consts
const DEFIVERSE_TEST_VAULT = "0x2Da016a77E290fb82F5af7051198304d57779f5d";
const OASYS_MAINNET_VAULT = "0x";
const VAULT = MODE == "test" ? DEFIVERSE_TEST_VAULT : OASYS_MAINNET_VAULT; // vault address
const theirVault = "0xB90C55d2b2bb9699d2605B32B117dB601cA92aE5";
const theirFeeProvider = "0x38d04d161247031484B31fB8403D20bed5287cf7";
let protocolFeePercentagesProvider: ProtocolFeePercentagesProvider;
let weightedPoolFactory: WeightedPoolFactory;
let deployer: Wallet;

// normal deploy ProtocolFeePercentagesProvider
const deployProtocolFeePercentagesProvider = async (deployer: Wallet) => {
  const ProtocolFeePercentagesProvider = await normalDeploy(
    deployer,
    protocolFeePercentagesProviderAbi,
    protocolFeePercentagesProviderBytecode,
    [
      theirVault,
      ethers.parseEther("0.5"), // 500000000000000000 wei
      ethers.parseEther("0.5"),
    ]
  );

  return ProtocolFeePercentagesProvider as ProtocolFeePercentagesProvider;
};

// normal deploy WeightedPoolFactory
const deployWeightedPoolFactory = async (deployer: Wallet) => {
  const WeightedPoolFactory = await normalDeploy(
    deployer,
    weightedPoolFactoryAbi,
    weightedPoolFactoryBytecode,
    [
      theirVault,
      //   await protocolFeePercentagesProvider.getAddress(),
      theirFeeProvider,
      '{"name":"WeightedPoolFactory","version":3,"deployment":"20230206-weighted-pool-v3"}', // factoryVersion
      '{"name":"WeightedPool","version":3,"deployment":"20230206-weighted-pool-v3"} ', // poolVersion
    ]
  );

  return WeightedPoolFactory as WeightedPoolFactory;
};

async function main() {
  const provider = new JsonRpcProvider("https://rpc-testnet.defi-verse.org/");
  deployer = new Wallet(vars.get("INITIAL_OWNER_PRIVATE_KEY"), provider);
  console.log("address", deployer.address);

  // 1. deploy balancer ProtocolFeePercentagesProvider
  //   protocolFeePercentagesProvider = await deployProtocolFeePercentagesProvider(
  //     deployer
  //   );

  //   console.log(
  //     "ProtocolFeePercentagesProvider deployed to:",
  //     await protocolFeePercentagesProvider.getAddress()
  //   );

  // 2. deploy balancer WeightedPoolFactory
  weightedPoolFactory = await deployWeightedPoolFactory(deployer);
  console.log(
    "WeightedPoolFactory deployed to:",
    await weightedPoolFactory.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
