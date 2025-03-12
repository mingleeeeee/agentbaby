import { Address } from "abitype";
import { useReadContract } from "wagmi";
import { formatEther } from "ethers";
import { formatUnits } from "ethers";
import { FPAIR_CONTRACT_ABI } from "./cosntant";

export const useGetPairReserves = (pairAddress: Address) => {
  const { data, error, isLoading, refetch } = useReadContract({
    address: pairAddress,
    abi: FPAIR_CONTRACT_ABI,
    functionName: "getReserves",
  });

  return {
    memeReserve: data ? formatUnits(data[0], 0) : undefined,
    nativeReserve: data ? formatEther(data[1]) : undefined,
    error,
    isLoading,
    refetchPairReserves: refetch,
  };
};

export const useGetExchangeRate = (
  action: "buy" | "sell",
  pairAddress: `0x${string}`,
  inputAmount?: number | null
) => {
  const { memeReserve, nativeReserve, refetchPairReserves } =
    useGetPairReserves(pairAddress);

  if (!memeReserve || !nativeReserve || !inputAmount) {
    return {
      exchangeRate: undefined,
      refetchPairReserves,
    };
  }

  const memeReserveNum = Number(memeReserve);
  const nativeReserveNum = Number(nativeReserve);

  //Remarks: Buy: Input base token amount, output meme token amount
  //Remarks: Sell: Input meme token amount, output base token amount
  if (action === "buy") {
    const afterTaxInputAmount = Number((inputAmount * 0.99).toFixed(10));
    const outputMemeTokens = (
      (memeReserveNum * afterTaxInputAmount) /
      (nativeReserveNum + afterTaxInputAmount)
    ).toFixed(10);

    return {
      exchangeRate: Number(outputMemeTokens),
      refetchPairReserves,
    };
  } else {
    const outputNativeTokens = Number(
      (
        (nativeReserveNum * inputAmount) /
        (memeReserveNum + inputAmount)
      ).toFixed(10)
    );
    const afterTaxOutputAmount = (outputNativeTokens * 0.99).toFixed(10);

    return {
      exchangeRate: Number(afterTaxOutputAmount),
      refetchPairReserves,
    };
  }
};

export const useGetMemeTokenPrice = (
  pairAddress: `0x${string}`,
  action: "buy" | "sell",
  inputAmount: number
) => {
  // if action is buy, output is meme token amount
  // if action is sell, output is base token amount
  const { exchangeRate: output } = useGetExchangeRate(
    action,
    pairAddress,
    inputAmount
  );

  // input is base token amount
  if (action === "buy") {
    const afterTaxInputAmount = Number((inputAmount * 0.99).toFixed(10));
    const price = (afterTaxInputAmount / Number(output)).toFixed(10);

    return Number(price);
  }

  // input is meme token amount
  if (action === "sell") {
    const beforeTaxOutputAmount = (Number(output) / 0.99).toFixed(10);
    const price = (Number(beforeTaxOutputAmount) / Number(inputAmount)).toFixed(
      10
    );

    return Number(price);
  }
};
