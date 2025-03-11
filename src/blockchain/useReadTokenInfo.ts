import { Address } from "abitype";
import { useReadContracts } from "wagmi";
import { BONDING_CONTRACT_ABI, DESIRED_CHAIN_ID } from "./cosntant";

type Config = {
  contractAddress: Address;
  tokenAddress: Address;
};

export const useReadTokenInfos = (configs: Config[]) => {
  const { data, error, isLoading, refetch } = useReadContracts({
    contracts: configs.map((config) => ({
      address: config.contractAddress,
      abi: BONDING_CONTRACT_ABI,
      functionName: "tokenInfo",
      args: [config.tokenAddress],
      chainId: DESIRED_CHAIN_ID,
    })),
  });

  return {
    data,
    error,
    isLoading,
    refetchTokenInfo: refetch,
  };
};

export type Data = {
  token: string;
  name: string;
  _name: string;
  ticker: string;
  supply: string;
  price: string;
  marketCap: string;
  liquidity: string;
  volume: string;
  volume24H: string;
  prevPrice: string;
  lastUpdated: string;
};

export type ReadTokenData = [
  creator: string, // creator
  token: string, // token
  pair: string, // pair
  agentToken: string, // agentToken
  tokenData: Data, // token data object
  description: string, // description
  imageUrl: string, // image URL
  twitter: string, // twitter
  telegram: string, // telegram
  youtube: string, // youtube
  website: string, // website
  trading: boolean, // trading
  tradingOnUniswap: boolean // tradingOnUniswap
];

export type FinalReadTokenData = {
  name: string;
  creator: string;
  pair: string;
  agentToken: string;
  trading: boolean;
  tradingOnUniswap: boolean;
  supply: string;
  price: string;
  marketCap: string;
  liquidity: string;
  volume: string;
  volume24H: string;
};
