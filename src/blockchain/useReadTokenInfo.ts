import { useReadContract, useReadContracts } from "wagmi";
import {
  BONDING_ADDRESS,
  BONDING_CONTRACT_ABI,
  DESIRED_CHAIN_ID,
} from "./cosntant";
import { formatEther } from "ethers";
import { RefetchOptions, QueryObserverResult } from "@tanstack/react-query";
import { ReadContractsErrorType } from "@wagmi/core";
import { useMemo } from "react";
import { Address } from "viem";

type Status = "success" | "failure" | "loading";

type ReturnType = {
  tokenInfoList: TokenInfoState[];
  isLoading: boolean;
  refetchTokenInfo: RefetchTokenInfoType;
};

export type TokenInfoState = {
  status: Status;
  data: FinalReadTokenData | null;
};

export type RefetchTokenInfoType = (
  options?: RefetchOptions | undefined
) => Promise<
  QueryObserverResult<
    (
      | {
          error?: undefined;
          result:
            | never[]
            | unknown[]
            | (bigint | `0x${string}`)[]
            | boolean[]
            | (readonly `0x${string}`[])[];
          status: "success";
        }
      | { error: Error; result?: undefined; status: "failure" }
    )[],
    ReadContractsErrorType
  >
>;

export const useReadTokenInfos = (tokenId: number) => {
  const result = useReadContract({
    address: BONDING_ADDRESS,
    abi: BONDING_CONTRACT_ABI,
    functionName: "tokenInfos",
    args: [tokenId],
    chainId: DESIRED_CHAIN_ID,
  });
  const configs = [
    {
      contractAddress: BONDING_ADDRESS as Address,
      chainId: DESIRED_CHAIN_ID,
      tokenAddress: result.data,
    },
  ];

  const { data, error, isLoading, refetch } = useReadContracts({
    contracts: configs.map((config) => ({
      address: config.contractAddress,
      abi: BONDING_CONTRACT_ABI,
      functionName: "tokenInfo",
      args: [config.tokenAddress],
      chainId: config.chainId,
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
  token: string;
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
  description: string;
};

export function useReadTokenInfoData(tokenId: number): ReturnType {
  const { data, isLoading, refetchTokenInfo } = useReadTokenInfos(tokenId);

  console.log("data", data);
  const tokenInfoList = useMemo(() => {
    if (!data) return [];

    return data.map((it) => {
      if (it.status === "success") {
        const res = it.result as ReadTokenData;
        const tokenData = res.find((item) => typeof item === "object");

        const isInvalidData =
          tokenData?.token === "0x0000000000000000000000000000000000000000";

        if (isInvalidData) {
          return {
            status: "failure" as Status,
            data: null,
          };
        }

        return {
          status: "success" as Status,
          data: tokenData
            ? {
                name: tokenData.name,
                creator: res[0],
                token: res[1],
                pair: res[2],
                agentToken: res[3],
                trading: res[11],
                tradingOnUniswap: res[12],
                supply: tokenData.supply,
                price: formatEther(
                  BigInt(tokenData.marketCap) / BigInt(tokenData.supply)
                ),
                marketCap: tokenData.marketCap,
                liquidity: tokenData.liquidity,
                volume: tokenData.volume,
                volume24H: tokenData.volume24H,
                description: res[6],
              }
            : null,
        };
      } else if (it.status === "failure") {
        return {
          status: "failure" as Status,
          data: null,
        };
      } else {
        return {
          status: "loading" as Status,
          data: null,
        };
      }
    });
  }, [data]);

  return { refetchTokenInfo, tokenInfoList, isLoading };
}
