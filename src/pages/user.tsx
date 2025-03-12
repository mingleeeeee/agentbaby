import "../styles/globals.css";
import ProgressBar from "../components/ProgressBar";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useReadTokenInfoData } from "@/blockchain/useReadTokenInfo";
import {
  ConnectWalletButton,
  truncateAddress,
} from "@shared-components/atom/buttons/ConnectWalletButton";
import { useAccount } from "wagmi";
import { useGetPairReserves } from "@/blockchain/useGetPairReserves";
import { ZeroAddress } from "ethers";
import { useApprove } from "@/blockchain/useApproveToken";
import {
  BASE_TOKEN_ADDRESS,
  BASE_TOKEN_CONTRACT_ABI,
  FERC20_CONTRACT_ABI,
  FROUTER_ADDRESS,
  MAX_UINT256,
} from "@/blockchain/cosntant";
import { usePlaceTrade } from "@/blockchain/useInternalPlaceTrade";
import { Abi } from "viem";
import { useTokenAllowance } from "@/blockchain/useTokenAllowance";

export default function UserPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const avatarUrl = "/mascotImage.webp"; // Default avatar image

  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputAmount, setInputAmount] = useState<number>(0);

  const { tokenInfoList, isLoading } = useReadTokenInfoData();

  const { nativeReserve } = useGetPairReserves(
    tokenInfoList && tokenInfoList.length > 0 && tokenInfoList[0]?.data
      ? (tokenInfoList[0].data.pair as `0x${string}`)
      : (ZeroAddress as `0x${string}`)
  );

  const { handleApprove } = useApprove();
  const { handlePlaceTrade } = usePlaceTrade();
  const { allowance: baseTokenAllowance } = useTokenAllowance(
    BASE_TOKEN_ADDRESS as `0x${string}`,
    FROUTER_ADDRESS as `0x${string}`,
    BASE_TOKEN_CONTRACT_ABI as Abi,
    address as `0x${string}`
  );

  const { allowance: memeTokenAllowance } = useTokenAllowance(
    tokenInfoList && tokenInfoList.length > 0 && tokenInfoList[0]?.data
      ? (tokenInfoList[0].data.token as `0x${string}`)
      : (ZeroAddress as `0x${string}`),
    FROUTER_ADDRESS as `0x${string}`,
    FERC20_CONTRACT_ABI as Abi,
    address as `0x${string}`
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputAmount(Number(e.target.value));
  };

  // Fetch Twitter posts when component loads
  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const res = await fetch("/api/twitter"); // Backend API to get tweets
        const data = await res.json();
        setTweets(data.tweets || []);
      } catch (error) {
        console.error("Error fetching tweets", error);
      } finally {
        setLoading(false);
      }
    };
    if (mounted) {
      fetchTweets();
    }
  }, [mounted, tokenInfoList]);

  const handleBuy = async () => {
    // alert("Buy button clicked");
    if (baseTokenAllowance !== MAX_UINT256) {
      handleApprove(
        BASE_TOKEN_ADDRESS as `0x${string}`,
        FROUTER_ADDRESS as `0x${string}`,
        BASE_TOKEN_CONTRACT_ABI as Abi
      );
    }

    await handlePlaceTrade(
      inputAmount,
      tokenInfoList[0].data?.token as `0x${string}`,
      "buy"
    );

    console.log("handleBuy", inputAmount);
  };

  const handleSell = async () => {
    // alert("Sell button clicked");
    if (memeTokenAllowance !== MAX_UINT256) {
      handleApprove(
        tokenInfoList[0].data?.token as `0x${string}`,
        FROUTER_ADDRESS,
        FERC20_CONTRACT_ABI
      );
    }

    console.log("memeTokenAllowance2", memeTokenAllowance);
    console.log("MAX_UINT2562", MAX_UINT256);

    await handlePlaceTrade(
      inputAmount,
      tokenInfoList[0].data?.token as `0x${string}`,
      "sell"
    );
  };

  if (!mounted || isLoading) {
    return <div>Loading...</div>;
  }

  console.log("nativeReserve", nativeReserve);

  return (
    <div
      className="main-container"
      style={{ display: "flex", gap: "30px", justifyContent: "center" }}
    >
      {/* ✅ Left Section */}
      <div className="avatar-container">
        {/* Avatar - Circular */}
        <Image
          src={avatarUrl}
          alt="Character Avatar"
          width={100}
          height={100}
          style={{ borderRadius: "50%" }}
        />

        {/* AI Card */}
        <div className="ai-card">
          <div className="developer">
            <span>Developer</span>
            <a href="#" className="developer-address">
              <img src={avatarUrl} alt="avatar" className="developer-avatar" />
              {tokenInfoList[0].data
                ? truncateAddress(tokenInfoList[0].data?.creator)
                : ZeroAddress}
            </a>
          </div>

          <hr className="divider" />

          <h2 className="ai-name">{tokenInfoList[0].data?.name}</h2>
          <p className="ai-address">
            {tokenInfoList[0].data?.agentToken ===
            "0x0000000000000000000000000000000000000000"
              ? tokenInfoList[0].data?.token
              : tokenInfoList[0].data?.agentToken}
          </p>

          <div className="description">
            <span className="label">Description:</span>
            <span className="desc-text">
              {tokenInfoList[0].data?.description}
            </span>
          </div>

          <div className="price">
            <span className="label">Price:</span>
            <span className="price-value">
              {(
                Number(tokenInfoList[0].data?.marketCap || 1) /
                Number(tokenInfoList[0].data?.supply || 1)
              ).toFixed(10)}{" "}
              WMON
            </span>
          </div>
          <ProgressBar
            percentage={
              Number(((35000 - Number(nativeReserve)) / 35000).toFixed(3)) * 100
            }
          />
        </div>

        {/* Swap Section */}
        <div className="swap-container" style={{ marginTop: "20px" }}>
          <div className="swap-options">
            <button className="swap-btn active" onClick={handleBuy}>
              Buy
            </button>
            <button className="swap-btn" onClick={handleSell}>
              Sell{" "}
            </button>
          </div>

          <div className="swap-info">
            <span>Swap Fee:</span> <span className="fee">1%</span>
          </div>

          <div className="swap-info2">
            <div>Buy: input WMOD amount</div>
          </div>

          <div className="swap-info2">
            <div>Sell: input fun Token amount</div>
          </div>

          <div className="swap-input-wrapper">
            <input
              type="text"
              className="swap-input"
              placeholder="0.00"
              value={inputAmount}
              onChange={handleInputChange}
            />
            <div className="swap-token">AMOUNT</div>
          </div>
        </div>
      </div>

      {/* ✅ Right Twitter Section */}
      <div
        className="avatar-container"
        style={{
          justifyContent: "flex-start",
          alignItems: "flex-start",
          padding: "20px",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h3
            style={{
              color: "#5a4a42",
              fontSize: "18px",
              marginBottom: "12px",
              fontWeight: "bold",
            }}
          >
            Latest Posts
          </h3>

          {loading && (
            <p style={{ color: "#8a6d5e", fontStyle: "italic" }}>Loading...</p>
          )}

          {!loading && tweets.length === 0 && (
            <p style={{ color: "#8a6d5e", fontStyle: "italic" }}>
              No posts found.
            </p>
          )}

          {tweets.map((tweet, index) => (
            <div
              key={index}
              style={{
                background: "#fffaf0",
                padding: "16px",
                borderRadius: "12px",
                boxShadow: "0 4px 8px rgba(90, 74, 66, 0.1)",
                color: "#5a4a42",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                wordBreak: "break-word",
              }}
            >
              <p style={{ margin: 0 }}>{tweet.text}</p>
              <small style={{ color: "#8a6d5e", fontSize: "12px" }}>
                {new Date(tweet.created_at).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      </div>
      <div>
        <ConnectWalletButton address={address} isConnected={isConnected} />
      </div>
    </div>
  );
}
