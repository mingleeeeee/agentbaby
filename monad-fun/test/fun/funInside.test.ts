import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { BytesLike, parseEther, Signer, ZeroAddress } from "ethers";
import {
  FFactory,
  FRouter,
  Bonding,
  MyTokenV1,
  AgentToken,
  AgentFactoryV3,
  WeightedPoolFactory,
} from "../../typechain-types";
import { zeroAddress } from "viem";

describe("Deployment and Setup Test", function () {
  let virtual: MyTokenV1;
  let agentFactoryProxy: AgentFactoryV3;
  let agentToken: AgentToken;
  let fFactoryProxy: FFactory;
  let fRouterProxy: FRouter;
  let bondingProxy: Bonding;
  let weightedPoolFactory: WeightedPoolFactory;
  let deployer: Signer;
  let feeReceiver: Signer;
  let memeCreator: Signer;
  let memeBuyer: Signer;

  const valutAddress = "0x2FA699664752B34E90A414A42D62D7A8b2702B85";
  const PROPOSAL_THRESHOLD = parseEther("50000"); // 50k
  const wethAddress = ZeroAddress;

  const deplyBaseToken = async (deployer: Signer) => {
    const MyTokenV1Factory = await ethers.getContractFactory(
      "MyTokenV1",
      deployer
    );

    // use { kind: "transparent" } to deploy Transparent Proxy
    const proxy = await upgrades.deployProxy(
      MyTokenV1Factory,
      ["MyToken", "MTK", 123], // refer to initialize(name, symbol, initialValue)
      {
        kind: "transparent",
        initializer: "initialize", // 預設也是會呼叫同名方法
      }
    );
    await proxy.waitForDeployment();

    return proxy;
  };

  const deployAgentToken = async (deployer: Signer) => {
    // Deploy AgentToken
    const AgentTokenFactory = await ethers.getContractFactory(
      "AgentToken",
      deployer
    );
    const agentTokenInstance = await AgentTokenFactory.deploy();

    return agentTokenInstance;
  };

  const deployWeightedPoolFactory = async (deployer: Signer) => {
    // Deploy AgentToken
    const WeightedPoolFactory = await ethers.getContractFactory(
      "WeightedPoolFactory",
      deployer
    );
    const WeightedPoolFactoryInstance = await WeightedPoolFactory.deploy(
      valutAddress, // vault address,
      zeroAddress, //
      '{"name":"WeightedPoolFactory","version":1,"deployment":"20250118-v3-weighted-pool-factory"}', // factoryVersion
      '{"name":"WeightedPool","version":1,"deployment":"20250118-v3-weighted-pool"}' // poolVersion
    );

    return WeightedPoolFactoryInstance;
  };

  const deployAgentFactory = async (
    deployer: Signer,
    agentTokenAddress: string,
    virtualAddress: string,
    weightedPoolFactoryAddress: string,
    _valutAddress: string
  ) => {
    // Deploy AgentFactoryV3 by proxy
    const AgentFactoryV3Factory = await ethers.getContractFactory(
      "AgentFactoryV3",
      deployer
    );
    const agentFactoryProxyInstance = await upgrades.deployProxy(
      AgentFactoryV3Factory,
      [
        agentTokenAddress, // implementaion address
        virtualAddress, // virtual address
        PROPOSAL_THRESHOLD, // application threshold
        1001,
        weightedPoolFactoryAddress, // poolFactory Address
        _valutAddress, // vault address
      ],
      { kind: "transparent" }
    );
    await agentFactoryProxyInstance.waitForDeployment();

    return agentFactoryProxyInstance;
  };

  beforeEach(async function () {
    [deployer, feeReceiver, memeCreator, memeBuyer] = await ethers.getSigners();

    // deploy process
    virtual = (await deplyBaseToken(deployer)) as unknown as MyTokenV1;
    agentToken = (await deployAgentToken(deployer)) as AgentToken;
    weightedPoolFactory = (await deployWeightedPoolFactory(
      deployer
    )) as WeightedPoolFactory;
    agentFactoryProxy = (await deployAgentFactory(
      deployer,
      await agentToken.getAddress(),
      await virtual.getAddress(),
      await weightedPoolFactory.getAddress(),
      valutAddress
    )) as AgentFactoryV3;

    // Set token admin, supply params, tax params, uniswap router, and grant role in AgentFactory proxy
    await agentFactoryProxy.setMaturityDuration(86400 * 365 * 10); // 10years
    // await agentFactoryProxy.setUniswapRouter(process.env.UNISWAP_ROUTER);
    await agentFactoryProxy.setTokenAdmin(await deployer.getAddress());
    await agentFactoryProxy.setTokenSupplyParams(
      ethers.parseEther("1000000000"), //   process.env.AGENT_TOKEN_SUPPLY,
      ethers.parseEther("1000000000"), //   process.env.AGENT_TOKEN_LP_SUPPLY,
      ethers.parseEther("1000000000"), //   process.env.AGENT_TOKEN_VAULT_SUPPLY,
      ethers.parseEther("1000000000"), //   process.env.AGENT_TOKEN_SUPPLY,
      ethers.parseEther("1000000000"), //   process.env.AGENT_TOKEN_SUPPLY,
      10, //   process.env.BOT_PROTECTION,
      await deployer.getAddress()
    );

    await agentFactoryProxy.setTokenTaxParams(
      1, //process.env.BUYTAX,
      1, //      process.env.SELLTAX,
      1, //      process.env.SWAP_THRESHOLD,
      await feeReceiver.getAddress() //      treasury.address
    );

    // Deploy FFactory by proxy
    const FFactoryFactory = await ethers.getContractFactory(
      "FFactory",
      deployer
    );
    const fFactoryProxyInstance = await upgrades.deployProxy(
      FFactoryFactory,
      [await feeReceiver.getAddress(), 1, 1], // refer to initialize params buyTax:1%, sellTax:1% (assetToken)
      { kind: "transparent" }
    );
    await fFactoryProxyInstance.waitForDeployment();
    fFactoryProxy = fFactoryProxyInstance as FFactory;

    // Grant admin role in FFactory proxy
    await fFactoryProxy.grantRole(
      await fFactoryProxy.ADMIN_ROLE(),
      await deployer.getAddress()
    );

    // Deploy FRouter by proxy
    const FRouterFactory = await ethers.getContractFactory("FRouter", deployer);
    const fRouterProxyInstance = await upgrades.deployProxy(
      FRouterFactory,
      [await fFactoryProxy.getAddress(), await virtual.getAddress()],
      { kind: "transparent" }
    );
    await fRouterProxyInstance.waitForDeployment();
    fRouterProxy = fRouterProxyInstance as FRouter;

    // set router in FFactory proxy
    await fFactoryProxy.setRouter(await fRouterProxy.getAddress());

    // Deploy Bonding by proxy
    const BondingFactory = await ethers.getContractFactory("Bonding", deployer);
    const bondingProxyInstance = await upgrades.deployProxy(
      BondingFactory,
      [
        await fFactoryProxy.getAddress(),
        await fRouterProxy.getAddress(),
        await feeReceiver.getAddress(), // feeTo
        100000, // equal 100 ether, fee to create a new bonding token
        1000000000, //  initialSupply_
        10000, //  assetRate_: prd is 5000  (now initial virtual liq is 3000, if 5000, the initial virtual liq is 6000),
        100, //  maxTx_
        await agentFactoryProxy.getAddress(), //  agentFactory_ (暫時隨便給一個 之後不會是這個)
        85000000, //  gradThreshold_ (decimal 0)
      ],
      { kind: "transparent" }
    );

    await bondingProxyInstance.waitForDeployment();
    bondingProxy = bondingProxyInstance as Bonding;

    // Set deploy params and fee in Bonding proxy
    // await bondingProxy.setDeployParams(/* params */);

    // grant role to bonding contract
    await fFactoryProxy.grantRole(
      await fFactoryProxy.CREATOR_ROLE(),
      await bondingProxy.getAddress()
    );
    await fRouterProxy.grantRole(
      await fRouterProxy.EXECUTOR_ROLE(),
      await bondingProxy.getAddress()
    );
    await agentFactoryProxy.grantRole(
      await agentFactoryProxy.BONDING_ROLE(),
      await bondingProxy.getAddress()
    );
  });

  it("Should launch meme token", async () => {
    await virtual
      .connect(deployer)
      .transfer(await memeCreator.getAddress(), ethers.parseEther("200"));

    // launch meme token
    await virtual
      .connect(memeCreator)
      .approve(await bondingProxy.getAddress(), ethers.parseEther("1000"));
    await bondingProxy.connect(memeCreator).launch(
      "Cat",
      "$CAT",
      [0, 1, 2],
      "it is a cat",
      "",
      ["", "", "", ""],
      ethers.parseEther("200") // purchase amount
    );

    const tokenInfo = await bondingProxy.tokenInfo(
      await bondingProxy.tokenInfos(0)
    );

    const pair = await ethers.getContractAt("FPair", tokenInfo.pair);
    const [r1, r2] = await pair.getReserves();

    // ethers.formatEther 轉換回 ether 單位
    console.log("Reserves", Number(r1), ethers.formatEther(r2));

    // memeToken
    const memeToken = await ethers.getContractAt("FERC20", tokenInfo.token);
    console.log(
      "fee:",
      ethers.formatEther(
        await virtual.balanceOf(await feeReceiver.getAddress())
      )
    );

    // will receive 1% fee (100 * 0.01) + 100 create fee = 101 token
    expect(
      ethers.formatEther(
        await virtual.balanceOf(await feeReceiver.getAddress())
      )
    ).to.be.equal("101.0");

    // the inside pool will have 99 token (1 to feeReceiver)
    expect(
      ethers.formatEther(await virtual.balanceOf(tokenInfo.pair))
    ).to.be.equal("99.0");
    expect(
      ethers.formatEther(
        await virtual.balanceOf(await memeCreator.getAddress())
      )
    ).to.be.equal("0.0");

    console.log(
      "memeToken balance",
      await memeToken.balanceOf(await memeCreator.getAddress())
    );
    expect(
      await memeToken.balanceOf(await memeCreator.getAddress())
    ).to.be.equal("31945789");
  });

  it("Should buy and sell meme token", async () => {
    // launch meme token
    await virtual
      .connect(deployer)
      .transfer(await memeCreator.getAddress(), ethers.parseEther("200"));
    await virtual
      .connect(memeCreator)
      .approve(await bondingProxy.getAddress(), ethers.parseEther("1000"));
    await bondingProxy.connect(memeCreator).launch(
      "Cat",
      "$CAT",
      [0, 1, 2],
      "it is a cat",
      "",
      ["", "", "", ""],
      ethers.parseEther("200") // purchase amount (including fee)
    );

    const tokenInfo = await bondingProxy.tokenInfo(
      await bondingProxy.tokenInfos(0)
    );

    const memeAddress = tokenInfo.token;
    // buy meme token, need to approve frouter proxy to spend virtual token
    await virtual
      .connect(deployer)
      .transfer(await memeBuyer.getAddress(), ethers.parseEther("100"));
    await virtual
      .connect(memeBuyer)
      .approve(await fRouterProxy.getAddress(), ethers.parseEther("100"));
    await bondingProxy
      .connect(memeBuyer)
      .buy(ethers.parseEther("100"), memeAddress);

    expect(
      ethers.formatEther(await virtual.balanceOf(await memeBuyer.getAddress()))
    ).to.be.equal("0.0");
    expect(
      ethers.formatEther(await virtual.balanceOf(tokenInfo.pair))
    ).to.be.equal("198.0");
    expect(
      ethers.formatEther(
        await virtual.balanceOf(await feeReceiver.getAddress())
      )
    ).to.be.equal("102.0");

    // memeToken
    const memeToken = await ethers.getContractAt("FERC20", tokenInfo.token);

    // expect(
    //   ethers.formatEther(
    //     await memeToken.balanceOf(await memeBuyer.getAddress())
    //   )
    // ).to.be.equal("29967907.095855529260482865");

    expect(await memeToken.balanceOf(await memeBuyer.getAddress())).to.be.equal(
      "29967908"
    );

    // sell meme token
    await memeToken
      .connect(memeBuyer)
      .approve(await fRouterProxy.getAddress(), 29967908);

    await bondingProxy.connect(memeBuyer).sell(29967908, memeAddress);

    expect(await memeToken.balanceOf(await memeBuyer.getAddress())).to.be.equal(
      0
    );
  });

  // THIS WILL FAIL DUE TO THE poolRegister function of gamingDex

  // it("Should graduate meme token", async () => {
  //   // launch meme token
  //   await virtual
  //     .connect(deployer)
  //     .transfer(await memeCreator.getAddress(), ethers.parseEther("200"));
  //   await virtual
  //     .connect(memeCreator)
  //     .approve(await bondingProxy.getAddress(), ethers.parseEther("1000"));
  //   await bondingProxy.connect(memeCreator).launch(
  //     "Cat",
  //     "$CAT",
  //     [0, 1, 2],
  //     "it is a cat",
  //     "",
  //     ["", "", "", ""],
  //     ethers.parseEther("200") // purchase amount (including fee)
  //   );

  //   const tokenInfo = await bondingProxy.tokenInfo(
  //     await bondingProxy.tokenInfos(0)
  //   );

  //   const memeAddress = tokenInfo.token;
  //   // buy meme token, need to approve frouter proxy to spend virtual token
  //   await virtual
  //     .connect(deployer)
  //     .transfer(await memeBuyer.getAddress(), ethers.parseEther("35000"));
  //   await virtual
  //     .connect(memeBuyer)
  //     .approve(await fRouterProxy.getAddress(), ethers.parseEther("35000"));
  //   await expect(
  //     bondingProxy
  //       .connect(memeBuyer)
  //       .buy(ethers.parseEther("35000"), memeAddress)
  //   ).to.emit(bondingProxy, "Graduated");
  //   await virtual
  //     .connect(deployer)
  //     .transfer(await memeBuyer.getAddress(), ethers.parseEther("35000"));

  //   const tokenInfoAfterTransit = await bondingProxy.tokenInfo(
  //     await bondingProxy.tokenInfos(0)
  //   );
  //   const agentTokenAddress = tokenInfoAfterTransit.agentToken;
  //   // const IERC20 = await ethers.getContractAt("IERC20", agentTokenAddress);

  //   // balance1 + balance2 = 1B
  //   // balance of agent token in fpair
  //   // console.log(
  //   //   "outside meme token balance1",
  //   //   await IERC20.balanceOf(tokenInfoAfterTransit.pair)
  //   // );
  //   // balance of agent token in agent token contract (not add liquidity to pool yet)
  //   // console.log(
  //   //   "outside meme token balance2",
  //   //   await IERC20.balanceOf(agentTokenAddress)
  //   // );
  //   // virtual token balance in agentTokenAddress (not add liquidity to pool yet)
  //   console.log("virtual balance", await virtual.balanceOf(agentTokenAddress));
  // });

  it("Should get baseToken, memeToken balance after buy", async () => {
    await virtual
      .connect(deployer)
      .transfer(await memeCreator.getAddress(), ethers.parseEther("1100"));

    // launch meme token & first buy
    await virtual
      .connect(memeCreator)
      .approve(await bondingProxy.getAddress(), ethers.parseEther("1100"));
    await bondingProxy.connect(memeCreator).launch(
      "Cat",
      "$CAT",
      [0, 1, 2],
      "it is a cat",
      "",
      ["", "", "", ""],
      ethers.parseEther("1100") // purchase amount
    );

    const tokenInfo = await bondingProxy.tokenInfo(
      await bondingProxy.tokenInfos(0)
    );
    const memeAddress = tokenInfo.token;
    const pair = await ethers.getContractAt("FPair", tokenInfo.pair);

    // initial reserves
    const [r1, r2] = await pair.getReserves();
    console.log(`Reserves1`, Number(r1), ethers.formatEther(r2));

    // 第32次會 graduated
    for (let i = 1; i <= 31; i++) {
      await virtual
        .connect(deployer)
        .transfer(await memeBuyer.getAddress(), ethers.parseEther("1000"));
      await virtual
        .connect(memeBuyer)
        .approve(await fRouterProxy.getAddress(), ethers.parseEther("1000"));
      await bondingProxy
        .connect(memeBuyer)
        .buy(ethers.parseEther("1000"), memeAddress);

      const [r1, r2] = await pair.getReserves();
      console.log(`Reserves${i + 1}`, Number(r1), ethers.formatEther(r2));
    }

    // memeToken
    const memeToken = await ethers.getContractAt("FERC20", tokenInfo.token);

    // console.log(
    //   "fee:",
    //   ethers.formatEther(
    //     await virtual.balanceOf(await feeReceiver.getAddress())
    //   )
    // );

    // will receive 1% fee (100 * 0.01) + 100 create fee = 101 token
    // expect(
    //   ethers.formatEther(
    //     await virtual.balanceOf(await feeReceiver.getAddress())
    //   )
    // ).to.be.equal("101.0");

    // // the inside pool will have 99 token (1 to feeReceiver)
    // expect(
    //   ethers.formatEther(await virtual.balanceOf(tokenInfo.pair))
    // ).to.be.equal("99.0");
    // expect(
    //   ethers.formatEther(
    //     await virtual.balanceOf(await memeCreator.getAddress())
    //   )
    // ).to.be.equal("0.0");

    // expect(
    //   ethers.formatEther(
    //     await memeToken.balanceOf(await memeCreator.getAddress())
    //   )
    // ).to.be.equal("31945788.964181994191674734");
  });
});
