import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { MyTokenV1, MyTokenV2 } from "../typechain-types";
import { Signer } from "ethers";

describe("MyTokenV2 (Transparent Upgrade) test", () => {
  let myTokenProxy: MyTokenV1;
  let deployer: Signer;

  before(async () => {
    [deployer] = await ethers.getSigners();

    // 先部署 V1
    const MyTokenV1Factory = await ethers.getContractFactory(
      "MyTokenV1",
      deployer
    );
    const proxy = await upgrades.deployProxy(
      MyTokenV1Factory,
      ["MyToken", "MTK", 123],
      { kind: "transparent" }
    );
    await proxy.waitForDeployment();

    myTokenProxy = proxy as MyTokenV1;
  });

  it("Should upgrade to V2", async () => {
    // 取得 V2 工廠
    const MyTokenV2Factory = await ethers.getContractFactory(
      "MyTokenV2",
      deployer
    );

    // 執行升級 // only admin can call this function
    const upgraded = await upgrades.upgradeProxy(
      await myTokenProxy.getAddress(),
      MyTokenV2Factory
    );
    const myTokenV2 = upgraded as MyTokenV2;

    // 測試新功能
    expect(await myTokenV2.version()).to.equal("V2");

    // 驗證舊狀態是否保留
    expect(await myTokenV2.myValue()).to.equal(123);
  });
});
