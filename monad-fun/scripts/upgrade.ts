import { ethers, upgrades } from "hardhat";
import { MyTokenV1 } from "../typechain-types";
import { Signer } from "ethers";
import { sepolia_verify_address } from "../const";

let deployer: Signer;

const V1_ADDRESS = sepolia_verify_address;

async function main() {
  // 取得合約工廠

  [deployer] = await ethers.getSigners();

  const MyTokenV2Factory = await ethers.getContractFactory(
    "MyTokenV2",
    deployer
  );

  // 執行升級 // only admin can call this function
  await upgrades.upgradeProxy(V1_ADDRESS, MyTokenV2Factory);

  console.log("Upgraded to V2");
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
