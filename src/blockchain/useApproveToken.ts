import { useWriteContract } from "wagmi";
import { Abi } from "viem";
import { DESIRED_CHAIN_ID, MAX_UINT256 } from "./cosntant";

export const useApprove = () => {
  const approve = useWriteContract();
  const handleApprove = (
    tokenContractAddress: `0x${string}`,
    accessorContractAddress: `0x${string}`,
    abi: Abi
  ) => {
    console.log("Approving token");
    approve.writeContract({
      address: tokenContractAddress,
      abi: abi,
      functionName: "approve",
      args: [accessorContractAddress, MAX_UINT256],
      chainId: DESIRED_CHAIN_ID,
    });
  };

  return {
    approve,
    handleApprove,
  };
};
