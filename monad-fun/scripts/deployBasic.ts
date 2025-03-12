import { ethers } from "hardhat";
import {
  AgentFactoryV3,
  AgentToken,
  Bonding,
  FFactory,
  FRouter,
} from "../typechain-types";
import { JsonRpcProvider, Wallet, ZeroAddress } from "ethers";
import { vars } from "hardhat/config";
import { deployProxyAdminAndProxy, normalDeploy } from "./deployUtils";
// abis and bytecodes
import {
  abi as bondingAbi,
  bytecode as bondingBytecode,
} from "../artifacts/contracts/fun/Bonding.sol/Bonding.json";
import {
  abi as fRouterAbi,
  bytecode as fRouterBytecode,
} from "../artifacts/contracts/fun/FRouter.sol/FRouter.json";
import {
  abi as fFactoryAbi,
  bytecode as fFactoryBytecode,
} from "../artifacts/contracts/fun/FFactory.sol/FFactory.json";
import {
  abi as agentFactoryV3Abi,
  bytecode as agentFactoryV3Bytecode,
} from "../artifacts/contracts/virtualPersona/AgentFactoryV3.sol/AgentFactoryV3.json";
import {
  abi as agentTokenAbi,
  bytecode as agentTokenBytecode,
} from "../artifacts/contracts/virtualPersona/AgentToken.sol/AgentToken.json";

let deployer: Wallet;
let agentToken: AgentToken;
let agentFactoryProxy: AgentFactoryV3;
let fFactoryProxy: FFactory;
let fRouterProxy: FRouter;
let bondingProxy;

const MODE = "test"; // test or mainnet
// consts
const KURU_ROUTER_ADDRESS = "0xc816865f172d640d93712C68a7E1F83F3fA63235";
// 50k, if the MEME token amount is less than this, it will be graduated
// mainnet: 125000000 ether, testnet:
const GRAD_THRESHOLD = ethers.parseEther("85000000");
const BASE_TOKEN = "0x9E58915818c0cF3a7A0962aedF91ACFB8ff5370D"; // this should be the base token address
const NEXT_ID = MODE == "test" ? 1001 : 1; // test: 1001, mainnet: 1
const FEE_RECEIVER = "0x3052a3C5402Cb64F7c6EB69a4cFEaDADaE7AC2a0"; // fee receiver address
const INSIDE_POOL_BUY_TAX = 1; // 1%
const INSIDE_POOL_SELL_TAX = 1; // 1%
const BASE_TOKEN_SYMBOL = "WMON";

// 1000, propose threshold, if the amount is less than this, can not create agent token
// mainnet:125000 ether , testnet:
const APPILCATION_THRESHOLD = ethers.parseEther("12500000");

// deploy functions

// Deploy Bonding by proxy
const deployBonding = async (
  deployer: Wallet,
  fFactoryAddress: string,
  fRouterAddress: string,
  feeReceiverAddress: string,
  creationFee: number,
  initialSupply: number,
  assetRate: number,
  maxTx: number,
  agentFactoryAddress: string,
  gradThreshold: bigint
) => {
  const bondingProxyInstance = await deployProxyAdminAndProxy(
    deployer,
    bondingAbi,
    bondingBytecode,
    [
      fFactoryAddress,
      fRouterAddress,
      feeReceiverAddress,
      creationFee,
      initialSupply,
      assetRate,
      maxTx,
      agentFactoryAddress,
      gradThreshold,
    ]
  );

  return bondingProxyInstance as Bonding;
};

// Deploy FRouter by proxy
const deployFRouter = async (
  deployer: Wallet,
  fFactoryAddress: string,
  assetTokenAddress: string
) => {
  const fRouterProxyInstance = await deployProxyAdminAndProxy(
    deployer,
    fRouterAbi,
    fRouterBytecode,
    [fFactoryAddress, assetTokenAddress]
  );

  return fRouterProxyInstance as FRouter;
};

// deploy FFactory by proxy
const deployFFactory = async (
  deployer: Wallet,
  feeReceiver: string,
  buyTax: number,
  sellTax: number
) => {
  const fFactoryProxyInstance = await deployProxyAdminAndProxy(
    deployer,
    fFactoryAbi,
    fFactoryBytecode,
    [feeReceiver, buyTax, sellTax]
  );

  return fFactoryProxyInstance as FFactory;
};

// normal deploy AgentToken
const deployAgentToken = async (deployer: Wallet) => {
  const agentTokenInstance = await normalDeploy(
    deployer,
    agentTokenAbi,
    agentTokenBytecode,
    []
  );

  return agentTokenInstance as AgentToken;
};

// Deploy AgentFactoryV3 by proxy
const deployAgentFactoryV3 = async (
  deployer: Wallet,
  agentTokenAddress: string,
  baseTokenAddress: string,
  gradThreshold: bigint,
  nextId: number,
  kuruRouterAddress: string,
  baseTokenSymbol: string
) => {
  const agentFactoryProxyInstance = await deployProxyAdminAndProxy(
    deployer,
    agentFactoryV3Abi,
    agentFactoryV3Bytecode,
    [
      agentTokenAddress, // implementaion address
      baseTokenAddress, // virtual address
      gradThreshold,
      nextId,
      kuruRouterAddress, // poolFactory Address
      baseTokenSymbol,
    ]
  );

  return agentFactoryProxyInstance as AgentFactoryV3;
};

async function main() {
  const provider = new JsonRpcProvider("https://testnet-rpc.monad.xyz");
  deployer = new Wallet(vars.get("INITIAL_OWNER_PRIVATE_KEY"), provider);
  console.log("deployer address", deployer.address);

  // 3. deploy virtualFun agent token instance
  agentToken = await deployAgentToken(deployer);
  console.log("AgentToken deployed to:", await agentToken.getAddress());

  // 4. deploy AgentFactoryV3 by proxy
  agentFactoryProxy = await deployAgentFactoryV3(
    deployer,
    await agentToken.getAddress(), //implementaion address
    BASE_TOKEN, // baseToken address
    APPILCATION_THRESHOLD, // application threshold, if paid this amount, can directly create a agent token
    NEXT_ID, // nextId test: 1001, mainnet: 1
    KURU_ROUTER_ADDRESS, // kuru router address
    BASE_TOKEN_SYMBOL // base token symbol
  );
  console.log(
    "AgentFactoryV3 deployed to:",
    await agentFactoryProxy.getAddress()
  );

  const agentFactoryCall = new ethers.Contract(
    await agentFactoryProxy.getAddress(),
    agentFactoryV3Abi,
    deployer
  );

  // Set token admin, tax params, and grant role in AgentFactory proxy
  // no need to set tokenSupplyParams if we don't have a manual execute application
  const tx1 = await agentFactoryCall.setTokenSupplyParams(
    ethers.parseEther("1000000000"), //   process.env.AGENT_TOKEN_SUPPLY, maxSupply
    ethers.parseEther("1000000000"), //   process.env.AGENT_TOKEN_LP_SUPPLY, lpSupply
    ethers.parseEther("0"), //   process.env.AGENT_TOKEN_VAULT_SUPPLY, vaultSupply
    ethers.parseEther("1000000"), //   maxTokensPerWallet
    ethers.parseEther("100000"), //   maxTokensPerTxn
    3600, //   process.env.BOT_PROTECTION,
    ZeroAddress // vault address (fpair address)
  );
  await tx1.wait();

  const tx2 = await agentFactoryCall.setMaturityDuration(86400 * 365 * 10); // 10years
  await tx2.wait();

  const tx3 = await agentFactoryCall.setTokenAdmin(await deployer.getAddress());
  await tx3.wait();

  const tx4 = await agentFactoryCall.setTokenTaxParams(
    100, //process.env.TAX,
    100, //process.env.TAX,
    1, //process.env.SWAP_THRESHOLD,
    FEE_RECEIVER //treasury.address
  );
  await tx4.wait();

  console.log("AgentFactoryV3 params set");

  // 5. Deploy FFactory by proxy
  fFactoryProxy = await deployFFactory(
    deployer,
    FEE_RECEIVER,
    INSIDE_POOL_BUY_TAX,
    INSIDE_POOL_SELL_TAX
  );
  console.log("FFactory deployed to:", await fFactoryProxy.getAddress());

  // Grant admin role in FFactory proxy
  const fFactoryCall = new ethers.Contract(
    await fFactoryProxy.getAddress(),
    fFactoryAbi,
    deployer
  );
  const grantRoleTx1 = await fFactoryCall.grantRole(
    await fFactoryCall.ADMIN_ROLE(),
    await deployer.getAddress()
  );
  await grantRoleTx1.wait();
  console.log("FFactory admin role granted");

  // 6. Deploy FRouter by proxy
  fRouterProxy = await deployFRouter(
    deployer,
    await fFactoryProxy.getAddress(), // FFactory address
    BASE_TOKEN // base token address
  );
  console.log("FRouter deployed to:", await fRouterProxy.getAddress());

  // set router in FFactory proxy
  const setRouterTx1 = await fFactoryCall.setRouter(
    await fRouterProxy.getAddress()
  );
  await setRouterTx1.wait();
  console.log("FRouter set in FFactory");

  // Deploy Bonding by proxy => this is create in Frontend
  bondingProxy = await deployBonding(
    deployer,
    await fFactoryProxy.getAddress(),
    await fRouterProxy.getAddress(),
    FEE_RECEIVER,
    100000, // creationFee, 100 ether
    1000000000, // initialSupply
    10000, // assetRate, prd is 5000 (now initial virtual liq is 3000, if 5000, the initial virtual liq is 6000),
    100, // maxTx
    await agentFactoryProxy.getAddress(), // agentFactoryAddress
    GRAD_THRESHOLD // gradThreshold
  );
  console.log("Bonding deployed to:", await bondingProxy.getAddress());

  // grant role to bonding contract
  const grantRoleTx2 = await fFactoryCall.grantRole(
    await fFactoryCall.CREATOR_ROLE(),
    await bondingProxy.getAddress()
  );
  await grantRoleTx2.wait();

  const routerCall = new ethers.Contract(
    await fRouterProxy.getAddress(),
    fRouterAbi,
    deployer
  );
  const grantRoleTx3 = await routerCall.grantRole(
    await routerCall.EXECUTOR_ROLE(),
    await bondingProxy.getAddress()
  );
  await grantRoleTx3.wait();

  const grantRoleTx4 = await agentFactoryCall.grantRole(
    await agentFactoryCall.BONDING_ROLE(),
    await bondingProxy.getAddress()
  );
  await grantRoleTx4.wait();

  console.log("Bonding role granted");
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
