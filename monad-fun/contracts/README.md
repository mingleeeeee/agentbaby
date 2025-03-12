For reviewers:

## code structures
- inside pool related contracts:
  - fun folder 
- outside pool related contracts:
  - dexPool folder (for create a poolFactory, router, pool and lots of interface / extension contracts of balancer)
  - virtualPersona folder (agentFactoryV3, agentToken)

## note
- comment // temp, means this part will cause error due to pool register part (connecting to gamingDex team now), if want to let test the code works, please following the comment explaination
- comment // REMOVE, means the part is not needed for now, most are old virtual related functions
- comment // NEW, means the new add part (most are balancer pool related functions)
- testing code is now till the part of: achieve threshold and open trading on balncer
- testing code for receive tax outside pool, buy and sell outside pool are not implemented yet
- testing command: `npx hardhat test ./test/fun/funInside.test.ts`

## How to start
0. we need to deploy some contracts for first, you can check in the `test/fun/funInside.test.ts` file
1. Start tracking from contracts/fun/Bonding.sol 
   - initial set up when the contract is deployed
   - should launch the inside pool FToken (user click the create new token in frontend)
   - should buy and sell the inside pool FToken
   - should correctly collect the fee from the inside pool FToken
   - should trigger `_openTradingOnUniswap()` (on gamingDex) when the remaining FTokens are less than the threshold
   - should unwrap the FTokens to meme tokens
2. When `_openTradingOnUniswap()` called, should start working with the outside pool related contracts: `contracts/virtualPersona/AgentFactoryV3.sol`, `contracts/virtualPersona/AgentToken.sol` and contract in `/contracts/dexPool` folder
   - should transfer all base token get from the inside pool to the AgentFactoryV3 contract
   - should create a new AgentToken and mint the new meme token to the pair contract and balancerPool contract
     - pair contract is for unwrap FTokens to meme tokens (User can do this function in `Bonding.sol`)
     - balancerPool is for adding init liquidity to the out side dex pool
  
### DEX POOL (balancer pool)
need to deploy the following contracts and set up in `AgentFactoryV3.sol`
1. contracts/dexPool/weightPools/contracts/WeightedPoolFactory.sol
   - constructor params:
     - IVault vault
     - uint32 pauseWindowDuration
     - string memory factoryVersion
     - string memory poolVersion
2. contracts/dexPool/vault/contracts/Router.sol

We need to create a balancer pool contract from the balancer pool factory contract, and also register the pool to the vault contract. => this step is confirming now.

Then we can interact with the pool by using the router contract, such as adding liquidity, swapping, etc.

