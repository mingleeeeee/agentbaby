import { useWriteContract } from "wagmi";
import { parseEther } from "viem";
import {
  BONDING_ADDRESS,
  BONDING_CONTRACT_ABI,
  DESIRED_CHAIN_ID,
  LAUNCH_TOKEN_PURCHASE_PRICE,
} from "./cosntant";

export const LAUNCH_TOKEN_EVENT_ABI = [
  "event PairCreated(address indexed arg0, address indexed arg1, address arg2, uint256 arg3)",
];

export const useLaunchToken = () => {
  const launchToken = useWriteContract();
  const handleLaunchToken = (
    name: string,
    ticker: string,
    description: string,
    imageUrl: string,
    urls: [string, string, string, string]
  ) => {
    launchToken.writeContract({
      address: BONDING_ADDRESS,
      abi: BONDING_CONTRACT_ABI,
      functionName: "launch",
      args: [
        name,
        ticker,
        [0, 1, 2],
        description,
        imageUrl,
        urls,
        BigInt(parseEther(LAUNCH_TOKEN_PURCHASE_PRICE)),
      ],
      chainId: DESIRED_CHAIN_ID,
    });
  };

  return {
    launchToken,
    handleLaunchToken,
  };
};
