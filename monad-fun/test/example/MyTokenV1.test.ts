import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { MyTokenV1 } from "../typechain-types";
import { Signer } from "ethers";

describe("MyTokenV1 (Transparent Proxy) test", function () {
  let myTokenProxy: MyTokenV1;
  let deployer: Signer;
  let user1: Signer;

  beforeEach(async function () {
    [deployer, user1] = await ethers.getSigners();
    const MyTokenV1Factory = await ethers.getContractFactory(
      "MyTokenV1",
      deployer
    );

    // 使用 { kind: "transparent" } 來部署 Transparent Proxy
    const proxy = await upgrades.deployProxy(
      MyTokenV1Factory,
      ["MyToken", "MTK", 123], // 對應 initialize(name, symbol, initialValue)
      {
        kind: "transparent",
        initializer: "initialize", // 預設也是會呼叫同名方法
      }
    );
    await proxy.waitForDeployment();

    // 轉成你對應的介面 (TypeChain)，以便有型別推斷
    myTokenProxy = proxy as unknown as MyTokenV1;
  });

  it("Should deploy transparent proxy and initialize", async () => {
    // 測試合約的屬性
    expect(await myTokenProxy.name()).to.equal("MyToken");
    expect(await myTokenProxy.symbol()).to.equal("MTK");
    expect(await myTokenProxy.myValue()).to.equal(123);
  });

  it("Should setMyValue and transfer tokens", async () => {
    // setMyValue
    await myTokenProxy.setMyValue(999);
    expect(await myTokenProxy.myValue()).to.equal(999);

    // 測試 ERC20 功能：deployer -> user1 轉帳
    await myTokenProxy.transfer(user1.getAddress(), 100);
    expect(await myTokenProxy.balanceOf(user1.getAddress())).to.equal(100);
  });
});
