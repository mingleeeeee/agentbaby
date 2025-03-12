"use client";
import { FC } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { useChainModal } from "@rainbow-me/rainbowkit";
import { Icon } from "../icons/Icons";
import { Image } from "../image/Image";
import { DESIRED_CHAIN_ID } from "@/blockchain/cosntant";
import styles from '../styles/ConnectWalletButton.module.css';

export const truncateAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

type Props = {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  closeSidebar?: () => void;
  isIconState?: boolean;
};

export const ConnectWalletButton: FC<Props> = ({
  address,
  isConnected,
  closeSidebar = () => {},
  isIconState = false,
}) => {
  const { openChainModal } = useChainModal();
  const { disconnect } = useDisconnect();
  const { chainId } = useAccount();

  const handleDisconnectWallet = () => disconnect();

  const renderContent = () => {
    if (!isConnected || (isConnected && chainId !== DESIRED_CHAIN_ID)) {
      return (
        <ConnectButton.Custom>
          {({ account, chain, openConnectModal, authenticationStatus, mounted }) => {
            const ready = mounted;
            const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");

            if (!ready) {
              return <div aria-hidden="true" style={{ opacity: 0, pointerEvents: "none", userSelect: "none", zIndex: 1000 }} />;
            }

            if (!connected) {
              return isIconState ? (
                <div onClick={() => { openConnectModal(); closeSidebar(); }} className={styles["icon-wallet-btn"]}>
                  <Icon icon="wallet" size="sm" color="--color-White" />
                </div>
              ) : (
                <button onClick={() => { openConnectModal(); closeSidebar(); }} className={styles["connect-wallet-btn"]}>
                  Connect Wallet
                </button>
              );
            }

            if (chainId !== DESIRED_CHAIN_ID) {
              return isIconState ? (
                <div onClick={openChainModal} className={styles["icon-error-btn"]}>
                  <Icon icon="exclamation" size="xs" color="--color-Error" />
                </div>
              ) : (
                <button onClick={openChainModal} className={styles["connect-wallet-btn"]} style={{ background: 'var(--color-Error)', color: 'white' }}>
                  Wrong Network
                </button>
              );
            }

            return isIconState ? (
              <div onClick={handleDisconnectWallet} className={styles["icon-image-btn"]}>
                <Image src="/images/default-creator-icon.svg" fill alt="default-creator-icon" />
              </div>
            ) : (
              <button onClick={handleDisconnectWallet} className={styles["connect-wallet-btn"]}>
                {truncateAddress(account.address)}
              </button>
            );
          }}
        </ConnectButton.Custom>
      );
    }

    // Optional: If you need verified wallet logic here, you can uncomment and adjust
    // if (isWalletVerifiedRes.fetching) { return <button className={styles["connect-wallet-btn"]} disabled>Loading...</button>; }
    // if (!isWalletVerifiedRes.data?.isWalletVerified) { return <VerifySignatureButton reexecuteQuery={reexecuteQuery} address={address} />; }

    return isIconState ? (
      <div onClick={handleDisconnectWallet} className={styles["icon-image-btn"]}>
        <Image src="/images/default-creator-icon.svg" fill alt="default-creator-icon" style={{ borderRadius: "50%" }} />
      </div>
    ) : (
      <button onClick={handleDisconnectWallet} className={styles["connect-wallet-btn"]}>
        {truncateAddress(address!)}
      </button>
    );
  };

  return renderContent();
};
