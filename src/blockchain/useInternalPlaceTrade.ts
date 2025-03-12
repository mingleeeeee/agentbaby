import { useWriteContract } from "wagmi";
import { parseEther } from "viem";

import {
  BONDING_ADDRESS,
  BONDING_CONTRACT_ABI,
  DESIRED_CHAIN_ID,
} from "./cosntant";

export const usePlaceTrade = () => {
  const { writeContractAsync, data: hash, error } = useWriteContract();
  const handlePlaceTrade = async (
    amount: number,
    tokenAddress: `0x${string}`,
    action: "buy" | "sell"
  ) => {
    const result = await writeContractAsync({
      address: BONDING_ADDRESS,
      abi: BONDING_CONTRACT_ABI,
      functionName: action,
      args: [
        action === "buy"
          ? BigInt(parseEther(amount.toString()))
          : BigInt(parseEther(amount.toString())),
        tokenAddress,
      ],
      chainId: DESIRED_CHAIN_ID,
    });
    return result;
  };

  return {
    placeTrade: {
      writeContractAsync,
      data: hash,
      error,
    },
    handlePlaceTrade,
  };
};
