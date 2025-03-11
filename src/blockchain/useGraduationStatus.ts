import { useReadContract } from "wagmi";
import { BONDING_ADDRESS, BONDING_CONTRACT_ABI } from "./cosntant";

export const useGetGradThreshold = () => {
  const { data, error, isLoading } = useReadContract({
    address: BONDING_ADDRESS,
    abi: BONDING_CONTRACT_ABI,
    functionName: "gradThreshold",
  });

  return {
    threshold: data ? data : undefined,
    error,
    isLoading,
  };
};
