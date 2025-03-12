import { JsonRpcProvider, Wallet } from "ethers";
import { ethers } from "hardhat";
import { abi as bondingAbi } from "../../artifacts/contracts/fun/Bonding.sol/Bonding.json";
import { abi as tokenAbi } from "../../artifacts/contracts/example/MyTokenV1.sol/MyTokenV1.json";
import { vars } from "hardhat/config";
import { zeroAddress } from "viem";

const WEIGHTED_POOL_FACTORY_ADDRESS =
  "0x48494Fa9eAd46EE8E3FcB66487a6dBBD34DcAFe3";
const DEFIVERSE_TEST_VAULT = "0x2Da016a77E290fb82F5af7051198304d57779f5d";

const WEIGHTED_POOL_FACTORY_ABI = [
  {
    inputs: [
      {
        internalType: "contract IVault",
        name: "vault",
        type: "address",
      },
      {
        internalType: "contract IProtocolFeePercentagesProvider",
        name: "protocolFeeProvider",
        type: "address",
      },
      {
        internalType: "string",
        name: "factoryVersion",
        type: "string",
      },
      {
        internalType: "string",
        name: "poolVersion",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [],
    name: "FactoryDisabled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "pool",
        type: "address",
      },
    ],
    name: "PoolCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "contract IERC20[]",
        name: "tokens",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "normalizedWeights",
        type: "uint256[]",
      },
      {
        internalType: "contract IRateProvider[]",
        name: "rateProviders",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "swapFeePercentage",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "create",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "disable",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "selector",
        type: "bytes4",
      },
    ],
    name: "getActionId",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAuthorizer",
    outputs: [
      {
        internalType: "contract IAuthorizer",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCreationCode",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCreationCodeContracts",
    outputs: [
      {
        internalType: "address",
        name: "contractA",
        type: "address",
      },
      {
        internalType: "address",
        name: "contractB",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPauseConfiguration",
    outputs: [
      {
        internalType: "uint256",
        name: "pauseWindowDuration",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "bufferPeriodDuration",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPoolVersion",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getProtocolFeePercentagesProvider",
    outputs: [
      {
        internalType: "contract IProtocolFeePercentagesProvider",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getVault",
    outputs: [
      {
        internalType: "contract IVault",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isDisabled",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "pool",
        type: "address",
      },
    ],
    name: "isPoolFromFactory",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const INSIDE_MEME = "0x5a276c1f9AF274Ed74d545B32eac46DDf83267A6";
const BASE_TOKEN = "0x15A580c90B10bF98dFe66f28B8e96D08150Cb6a4";
const BASE_TOKEN_2 = "0xE30b16e107D6E9b8426C191f6148096C331b4c88";

async function main() {
  const provider = new JsonRpcProvider("https://rpc-testnet.defi-verse.org/");
  const signer = new Wallet(vars.get("INITIAL_OWNER_PRIVATE_KEY"), provider);

  const weightedPoolFactoryCall = new ethers.Contract(
    WEIGHTED_POOL_FACTORY_ADDRESS,
    WEIGHTED_POOL_FACTORY_ABI,
    signer
  );

  const createPooleTx = await weightedPoolFactoryCall.create(
    "BASE_BASE_POOL",
    "BBT",
    [BASE_TOKEN_2, BASE_TOKEN].sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    }), // sort tokens
    [ethers.parseEther("0.5"), ethers.parseEther("0.5")],
    [zeroAddress, zeroAddress],
    ethers.parseEther("0.01"), // swapFeePercentage 1% = 10000000000000000
    signer.address // owner
  );

  await createPooleTx.wait();
  console.log("createPooleTx", createPooleTx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
