import hre from "hardhat";
import { sepolia_verify_address } from "../const";

async function main() {
  await hre.run("verify:verify", {
    address: "0x868EE79985eE3e77D39765036cD2b7Ac97E84484",
    // constructorArguments: [
    //   "0x2dEF3eFE2011f23Bf96D8034332607e15271AeB6",
    //   "0x3483C6bC54AA9b3Bd2994eD0335c0E12c3c1c38E",
    //   "0x3052a3C5402Cb64F7c6EB69a4cFEaDADaE7AC2a0",
    //   100000,
    //   1000000000,
    //   10000,
    //   100,
    //   "0x683afD6025A70EB9415ab91181f890d3282aB197",
    //   85000000,
    //   "0x2Da016a77E290fb82F5af7051198304d57779f5d",
    //   "0xCdE13e9260A99DaD0Da5E59AADC9A59A2FB57c38",
    //   '{"name":"WeightedPoolFactory","version":1,"deployment":"20250118-v3-weighted-pool-factory"}', // factoryVersion
    //   '{"name":"WeightedPool","version":1,"deployment":"20250118-v3-weighted-pool"}', // poolVersion
    //  ],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
