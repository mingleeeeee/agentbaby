"use client";
import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactNode } from "react";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import "@rainbow-me/rainbowkit/styles.css";
import { monadTestnet } from "wagmi/chains";

const queryClient = new QueryClient();

const connectors = connectorsForWallets(
  [
    {
      groupName: "Available Wallets",
      wallets: [metaMaskWallet],
    },
  ],
  {
    appName: "monad-test",
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  }
);
const desiredChain = monadTestnet;

export const desiredChainId = desiredChain.id;

export const config = createConfig({
  connectors,
  chains: [desiredChain],
  transports: {
    [monadTestnet.id]: http("https://testnet-rpc.monad.xyz"),
  },
});

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          showRecentTransactions={false}
          appInfo={{ appName: "Oasys Launchpad" }}
          initialChain={desiredChain}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
