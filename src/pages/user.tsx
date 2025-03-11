import "../styles/globals.css";
import ProgressBar from '../components/ProgressBar';
import TwitterFeed from "../components/TwitterFeed"; 
import { useState, useEffect } from "react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function UserPage() {
  const avatarUrl = "/mascotImage.webp"; // Default avatar image
  const percentage = 37.08; // Progress percentage

  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    fetchTweets();
  }, []);

  const handleConnectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("Connected account:", accounts[0]);
        alert(`Connected: ${accounts[0]}`);
      } catch (error) {
        console.error("User rejected connection");
      }
    } else {
      alert("Metamask not found. Please install Metamask.");
    }
  };

  return (
    <div className="main-container" style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
      
      {/* ✅ Left Section */}
      <div className="avatar-container">
        {/* Avatar - Circular */}
        <div className="avatar-box">
          <img src={avatarUrl} alt="Character Avatar" style={{ borderRadius: '50%' }} />
        </div>

        {/* AI Card */}
        <div className="ai-card">
          <div className="developer">
            <span>Developer</span>
            <a href="#" className="developer-address">
              <img src={avatarUrl} alt="avatar" className="developer-avatar" />
              0xa2...4a8b
            </a>
          </div>

          <hr className="divider" />

          <h2 className="ai-name">AltcoinChad</h2>
          <p className="ai-address">0xE57Af2C0674B2Fa993346c34BB2832E897754aAD</p>

          <div className="description">
            <span className="label">Description:</span>
            <span className="desc-text">AltcoinChad</span>
          </div>

          <div className="price">
            <span className="label">Price:</span>
            <span className="price-value">$113.49</span>
          </div>

          <ProgressBar percentage={percentage} />
        </div>

        {/* Swap Section */}
        <div className="swap-container" style={{ marginTop: "20px" }}>
          <div className="swap-options">
            <button className="swap-btn active">Buy Monado</button>
            <button className="swap-btn">Sell Monado</button>
          </div>

          <div className="swap-info">
            <span>Swap Fee:</span> <span className="fee">1%</span>
          </div>

          <div className="swap-input-wrapper">
            <input type="number" className="swap-input" placeholder="0.00" />
            <div className="swap-token">WOAS</div>
          </div>

          <button className="connect-wallet-btn" onClick={handleConnectWallet}>Connect Wallet</button>
        </div>
      </div>

      {/* ✅ Right Twitter Section */}
      <div className="avatar-container" style={{ justifyContent: 'flex-start', alignItems: 'flex-start', padding: '20px' }}>

  <TwitterFeed /> {/* ✅ 渲染推文 */}

      </div>

    </div>
  );
}
