import { useState, useRef, useEffect } from "react";
import "../styles/globals.css"; // ✅ Ensure CSS is included
import { ConnectWalletButton } from "@shared-components/atom/buttons/ConnectWalletButton";
import { useAccount } from "wagmi";
import { useLaunchToken } from "@/blockchain/useLaunchToken";
import { useApprove } from "@/blockchain/useApproveToken";
import {
  BASE_TOKEN_ADDRESS,
  BASE_TOKEN_CONTRACT_ABI,
  BONDING_ADDRESS,
  FROUTER_ADDRESS,
  MAX_UINT256,
} from "@/blockchain/cosntant";
import { Abi } from "viem";
import { useTokenAllowance } from "@/blockchain/useTokenAllowance";

export default function Home() {
  const defaultAvatar = "mascotImage.webp";
  const [character, setCharacter] = useState({
    name: "Monado",
    avatar: "",
    personality: "Intelligent, wise, and mysterious",
    description:
      "An AI entity known as 'Monado' that guides users through the world of technology and the unknown.",
    bio: "I am Monado, a digital entity bridging the gap between knowledge and curiosity.",
    lore: "Once a hidden AI in deep cyberspace, Monado now assists users in unraveling the mysteries of AI and blockchain.",
    knowledge:
      "AI can process information exponentially faster than humans, reshaping industries worldwide.",
    topics: "Machine Learning, Blockchain, Web3, Cryptography, AI Ethics",
    adjectives: "Visionary, Intelligent, Adaptable, Mysterious, Enlightening",
  });

  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const { handleLaunchToken } = useLaunchToken();
  const { handleApprove } = useApprove();

  const { allowance } = useTokenAllowance(
    BASE_TOKEN_ADDRESS as `0x${string}`,
    BONDING_ADDRESS as `0x${string}`,
    BASE_TOKEN_CONTRACT_ABI as Abi,
    address as `0x${string}`
  );

  const [loading, setLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Default avatar
  useEffect(() => {
    if (!character.avatar && mounted) {
      setCharacter((prev) => ({ ...prev, avatar: defaultAvatar }));
    }
  }, [character.avatar, mounted]);

  // Trigger file selection on avatar click
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Handle image upload and preview
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("Image upload failed:", await response.text());
        return;
      }

      const result = await response.json();
      console.log("Image uploaded successfully:", result.url);

      setCharacter((prev) => ({ ...prev, avatar: result.url }));
    } catch (error) {
      console.error("Image upload error:", error);
    }
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCharacter({ ...character, [e.target.name]: e.target.value });
  };

  // Start AI Agent
  const startAI = async () => {
    const ticker = "AI fun " + character.name;

    if (allowance !== MAX_UINT256) {
      handleApprove(
        BASE_TOKEN_ADDRESS as `0x${string}`,
        FROUTER_ADDRESS as `0x${string}`,
        BASE_TOKEN_CONTRACT_ABI as Abi
      );
    }

    await handleLaunchToken(
      character.name,
      ticker,
      character.description,
      character.avatar,
      ["", "", "", ""]
    );

    setLoading(true);
    const response = await fetch("/api/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ character }),
    });

    const result = await response.json();
    alert(result.message);
    setIsRunning(true);
    setLoading(false);
  };

  // Stop AI Agent
  const stopAI = async () => {
    setLoading(true);
    const response = await fetch("/api/stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    alert(result.message);
    setIsRunning(false);
    setLoading(false);
  };

  const handleConnectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log("Connected account:", accounts[0]);
        alert(`Connected: ${accounts[0]}`);
      } catch (error) {
        console.error("User rejected connection", error);
      }
    } else {
      alert("Metamask not found. Please install Metamask.");
    }
  };

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-container">
      {/* Left Part 1: Basic Settings */}
      <div className="info-container">
        <h1 className="page-title">Monado AI Creator</h1>

        <label className="input-title">AI Agent Name</label>
        <input
          type="text"
          name="name"
          value={character.name}
          onChange={handleChange}
        />
        <p className="example-text">Example: Monado</p>

        <label className="input-title">Personality</label>
        <textarea
          name="personality"
          value={character.personality}
          onChange={handleChange}
        />
        <p className="example-text">
          Example: Wise, mysterious, and highly intelligent
        </p>

        <label className="input-title">Description</label>
        <textarea
          name="description"
          value={character.description}
          onChange={handleChange}
        />
        <p className="example-text">
          Example: An AI entity that guides users through the unknown.
        </p>

        <label className="input-title">Short Bio</label>
        <textarea name="bio" value={character.bio} onChange={handleChange} />
        <p className="example-text">
          Example: I am Monado, a digital entity bridging knowledge and
          curiosity.
        </p>
      </div>

      {/* Middle Container: Additional Settings */}
      <div className="info-container">
        <label className="input-title">Character Backstory</label>
        <textarea name="lore" value={character.lore} onChange={handleChange} />
        <p className="example-text">
          Example: Once a hidden AI in cyberspace, Monado now aids users.
        </p>

        <label className="input-title">Character’s Knowledge</label>
        <textarea
          name="knowledge"
          value={character.knowledge}
          onChange={handleChange}
        />
        <p className="example-text">
          Example: AI processes information exponentially faster than humans.
        </p>

        <label className="input-title">Topics of Interest</label>
        <textarea
          name="topics"
          value={character.topics}
          onChange={handleChange}
        />
        <p className="example-text">
          Example: Machine Learning, Blockchain, Web3, Cryptography
        </p>

        <label className="input-title">Character Adjectives</label>
        <textarea
          name="adjectives"
          value={character.adjectives}
          onChange={handleChange}
        />
        <p className="example-text">
          Example: Visionary, Intelligent, Mysterious, Enlightening
        </p>

        {/* Start/Stop AI Buttons */}
        <button onClick={isRunning ? stopAI : startAI} disabled={loading}>
          {loading ? "Processing..." : isRunning ? "Stop AI" : "Start AI"}
        </button>
      </div>
      <div>
        <ConnectWalletButton address={address} isConnected={isConnected} />
      </div>
    </div>
  );
}
