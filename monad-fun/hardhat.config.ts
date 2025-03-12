import { vars, type HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-gas-reporter";

const config: HardhatUserConfig = {
  sourcify: {
    enabled: true,
    apiUrl: "https://sourcify-api-monad.blockvision.org",
    browserUrl: "https://testnet.monadexplorer.com",
  },
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // evmVersion: "cancun",
      viaIR: true,
    },
  },
  etherscan: {
    enabled: false,
  },
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true,
    },
    monadTestnet: {
      url: "https://testnet-rpc.monad.xyz/",
    },
    defiverseTestnet: {
      gasPrice: 10_000_000_000,
      url: "https://rpc-testnet.defi-verse.org",
      accounts: [vars.get("INITIAL_OWNER_PRIVATE_KEY")],
    },
    "defiverse-testnet": {
      chainId: 17117,
      url: "https://rpc-testnet.defi-verse.org/",
      accounts: [vars.get("INITIAL_OWNER_PRIVATE_KEY")],
      gasPrice: 50000000000,
    },
    polygonAmoy: {
      url: "https://rpc-amoy.polygon.technology/",
      accounts: [vars.get("INITIAL_OWNER_PRIVATE_KEY")],
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${vars.get(
        "ALCHEMY_API_KEY"
      )}`,
      accounts: [
        // dev key, should not be used in production
        vars.get("INITIAL_OWNER_PRIVATE_KEY"),
      ],
    },
    morphTestnet: {
      url: "https://rpc-quicknode-holesky.morphl2.io",
      chainId: 2810,
      accounts: [
        // dev key, should not be used in production
        vars.get("INITIAL_OWNER_PRIVATE_KEY"),
      ],
    },

    mantleSepolia: {
      chainId: 5003,
      url: "https://rpc.sepolia.mantle.xyz", // Sepolia Testnet
      accounts: [vars.get("INITIAL_OWNER_PRIVATE_KEY")],
    },

    baseSepolia: {
      chainId: 84532,
      url: "https://sepolia.base.org",
      accounts: [vars.get("INITIAL_OWNER_PRIVATE_KEY")],
    },

    chiado: {
      chainId: 10200,
      url: "https://rpc.chiadochain.net",
      accounts: [vars.get("INITIAL_OWNER_PRIVATE_KEY")],
    },
    alfajores: {
      chainId: 44787,
      url: "https://alfajores-forno.celo-testnet.org",
      accounts: [vars.get("INITIAL_OWNER_PRIVATE_KEY")],
    },
    lineaTestnet: {
      chainId: 59141,
      url: `https://linea-sepolia.g.alchemy.com/v2/${vars.get(
        "ALCHEMY_API_KEY"
      )}`,
      accounts: [vars.get("INITIAL_OWNER_PRIVATE_KEY")],
    },

    optimismSepolia: {
      chainId: 11155420,
      url: "https://sepolia.optimism.io",
      accounts: [vars.get("INITIAL_OWNER_PRIVATE_KEY")],
    },
  },

  // xdeploy: {
  //   contract: "StoreEvent",
  //   // constructorArgsPath: "PATH_TO_CONSTRUCTOR_ARGS", // optional; default value is `undefined`
  //   salt: "test1",
  //   signer: vars.get("INITIAL_OWNER_PRIVATE_KEY"),
  //   networks: [
  //     // "holesky", "amoy",
  //     // "baseSepolia",
  //     // "chiado", // gnosis
  //     // "alfajores", //celo
  //     // "lineaTestnet",
  //     // "mantaTestnet",
  //   ],
  //   rpcUrls: [
  //     // "https://eth-holesky.g.alchemy.com/v2/",
  //     // "https://polygon-amoy.g.alchemy.com/v2/",
  //     // "https://sepolia.base.org",
  //     // "https://rpc.chiadochain.net",
  //     // "https://alfajores-forno.celo-testnet.org",
  //     // "https://linea-sepolia.g.alchemy.com/v2/",
  //     // "https://rpc.testnet.mantle.xyz",
  //   ],
  //   gasLimit: 1_500_000, // optional; default value is `1.5e6`
  // },
  gasReporter: {
    // https://www.npmjs.com/package/hardhat-gas-reporter
    enabled: `${process.env.REPORT_GAS}` == "true" ? true : false,
  },
};

export default config;
