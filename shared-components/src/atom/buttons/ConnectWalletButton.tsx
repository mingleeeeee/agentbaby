"use client";
import { FC } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { useChainModal } from "@rainbow-me/rainbowkit";
import { Button } from "./Button";
import { Texts } from "@shared-components/Texts";
import { Icon } from "../icons/Icons";
import { Image } from "../image/Image";
import { DESIRED_CHAIN_ID } from "@/blockchain/cosntant";

export const truncateAddress = (addr: string) => {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
};

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

  const handleDisconnectWallet = () => {
    disconnect();
  };

  const renderContent = () => {
    if (!isConnected || (isConnected && chainId !== DESIRED_CHAIN_ID)) {
      return (
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            const ready = mounted;
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === "authenticated");

            return (
              <div
                {...(!ready && {
                  "aria-hidden": true,
                  style: {
                    opacity: 0,
                    pointerEvents: "none",
                    userSelect: "none",
                    zIndex: 1000,
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <>
                        {isIconState ? (
                          <div
                            onClick={() => {
                              openConnectModal();
                              closeSidebar();
                            }}
                            style={{
                              backgroundColor: "var(--color-Primary)",
                              borderRadius: "50%",
                              padding: "0.5rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Icon
                              icon="wallet"
                              size="sm"
                              color="--color-White"
                            />
                          </div>
                        ) : (
                          <Button
                            borderRadius="2.4rem"
                            padding="1.2rem 1.6rem"
                            backgroundColor="--color-Primary"
                            border="2px solid var(--color-White)"
                            loaderColor="--color-White"
                            boxShadow="0px 0px 8px rgba(235, 136, 239, 0.4)"
                            height="4.8rem"
                            onClick={() => {
                              openConnectModal();
                              closeSidebar();
                            }}
                            width="100%"
                          >
                            <Texts
                              kind="BodyXS"
                              color="--color-White"
                              style={{ textTransform: "initial" }}
                            >
                              connectWalletBtn
                            </Texts>
                          </Button>
                        )}
                      </>
                    );
                  }
                  if (chainId !== DESIRED_CHAIN_ID) {
                    return (
                      <>
                        {isIconState ? (
                          <div
                            onClick={openChainModal}
                            style={{
                              backgroundColor: "white",
                              borderRadius: "50%",
                              padding: "0.5rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              border: "2px solid var(--color-Error)",
                            }}
                          >
                            <Icon
                              icon="exclamation"
                              size="xs"
                              color="--color-Error"
                            />
                          </div>
                        ) : (
                          <Button
                            backgroundColor="--color-Error"
                            loaderColor="--color-White"
                            onClick={openChainModal}
                            width="100%"
                            borderRadius="2.4rem"
                            padding="1.2rem 1.6rem"
                            border="2px solid var(--color-White)"
                            height="4.8rem"
                          >
                            <Texts
                              kind="BodyXS"
                              color="--color-ButtonWhiteText"
                              style={{ textTransform: "initial" }}
                            >
                              wrongNetworkTxt
                            </Texts>
                          </Button>
                        )}
                      </>
                    );
                  }
                  return (
                    <>
                      {isIconState ? (
                        <div
                          onClick={handleDisconnectWallet}
                          style={{
                            borderRadius: "50%",
                            height: "2.8rem",
                            width: "2.8rem",
                            cursor: "pointer",
                          }}
                        >
                          <Image
                            src="/images/default-creator-icon.svg"
                            fill
                            alt="default-creator-icon"
                          />
                        </div>
                      ) : (
                        <Button
                          onClick={handleDisconnectWallet}
                          width="100%"
                          borderRadius="2.4rem"
                          padding="1.2rem 1.6rem"
                          backgroundColor="--color-Primary"
                          border="2px solid var(--color-White)"
                          loaderColor="--color-White"
                          boxShadow="0px 0px 8px rgba(235, 136, 239, 0.4)"
                          height="4.8rem"
                        >
                          <Texts
                            kind="BodyXS"
                            color="--color-White"
                            style={{ textTransform: "initial" }}
                          >
                            {truncateAddress(account.address)}
                          </Texts>
                        </Button>
                      )}
                    </>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      );
    }

    // if (isWalletVerifiedRes.fetching) {
    //   return (
    //     <Button
    //       loaderColor="--color-White"
    //       disabledColor="--color-Primary"
    //       disabled
    //       fetching={true}
    //       width="100%"
    //       borderRadius="2.4rem"
    //       padding="1.2rem 1.6rem"
    //       backgroundColor="--color-Primary"
    //       border="2px solid var(--color-White)"
    //       boxShadow="0px 0px 8px rgba(235, 136, 239, 0.4)"
    //       height="4.8rem"
    //     ></Button>
    //   );
    // }

    // if (!isWalletVerifiedRes.data?.isWalletVerified) {
    //   return (
    //     <VerifySignatureButton
    //       reexecuteQuery={reexecuteQuery}
    //       address={address}
    //     />
    //   );
    // }

    return (
      <>
        {isIconState ? (
          <div
            onClick={handleDisconnectWallet}
            style={{
              borderRadius: "50%",
              height: "2.8rem",
              width: "2.8rem",
              cursor: "pointer",
            }}
          >
            <Image
              src="/images/default-creator-icon.svg"
              fill
              alt="default-creator-icon"
              style={{ borderRadius: "50%" }}
            />
          </div>
        ) : (
          <Button
            onClick={handleDisconnectWallet}
            width="100%"
            borderRadius="2.4rem"
            padding="1.2rem 1.6rem"
            backgroundColor="--color-Primary"
            border="2px solid var(--color-White)"
            loaderColor="--color-White"
            boxShadow="0px 0px 8px rgba(235, 136, 239, 0.4)"
            height="4.8rem"
          >
            <Texts
              kind="BodyXS"
              color="--color-White"
              style={{ textTransform: "initial" }}
            >
              {truncateAddress(address!)}
            </Texts>
          </Button>
        )}
      </>
    );
  };

  return renderContent();
};
