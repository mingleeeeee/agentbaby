import { useEffect, useState } from "react";

interface Tweet {
  text: string;
  createdAt: string;
}

export default function TwitterFeed() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const response = await fetch("api/tweets"); // ✅ Correct path for public folder
        const data = await response.json();
        setTweets(data.slice(0, 10)); // ✅ Keep the latest 10 (assuming file already sorted)
      } catch (error) {
        console.error("Failed to fetch tweets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTweets();
  }, []);

  if (loading) return <p style={{ color: '#8a6d5e', fontStyle: 'italic' }}>Loading tweets...</p>;

  return (
    <div className="tweet-feed-container">
      <h2 className="tweet-feed-title">Latest Tweets</h2>
      <div className="tweet-list">
        {tweets.map((tweet, index) => (
          <div key={index} className="tweet-card">
            <p className="tweet-text">{tweet.text}</p>
            <p className="tweet-date">{new Date(tweet.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
