import { useReadContract } from "wagmi";
import { Abi } from "viem";

export const useTokenAllowance = (
  tokenContractAddress: `0x${string}`,
  accessorContractAddress: `0x${string}`,
  abi: Abi,
  userAddress: `0x${string}`,
) => {
  const { data, error, isLoading } = useReadContract({
    address: tokenContractAddress,
    abi,
    functionName: "allowance",
    args: [userAddress, accessorContractAddress],
  });

  return {
    allowance: data,
    error,
    isLoading,
  };
};
