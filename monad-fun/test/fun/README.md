

## deploy and set up steps

refer to this https://basescan.org/txs?a=0x9547e85f3016303a2996271314bde78b02021a28&p=2

1. deploy `AgentFactoryV3` contract by proxy and get proxy address 
   1. set token admin in `AgentFactory` proxy 
   2. set token supply params in `AgentFactory` proxy
   3. set token tax params in `AgentFactory` proxy
   4. set uniswap router in `AgentFactory` proxy
   5. grant role in `AgentFactory` proxy
2. deploy `FFactory` contract by proxy and get proxy address 
   1. grant role in `FFactory` proxy 
3. deploy `FRouter` contract by proxy and get proxy address 
   1. set router to factory
4. deploy `Bonding` contract by proxy and get proxy address 
   1.  set deploy params in Bonding proxy
   2.  set fee in Bonding proxy

// grant roles
 await fFactoryProxy.grantRole(
      await fFactoryProxy.CREATOR_ROLE(),
      await bondingProxy.getAddress()
    );
    await fRouterProxy.grantRole(
      await fRouterProxy.EXECUTOR_ROLE(),
      await bondingProxy.getAddress()
    );


有tax manager才需要set bonding tax, or 直接set feeTo address

## create a new token
