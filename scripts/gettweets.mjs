import { Scraper } from "agent-twitter-client";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const TWEETS_FILE = "public/data/tweets.json"; // ✅ 存 public，前端能直接 fetch

(async () => {
    try {
        const scraper = new Scraper();

        await scraper.login(
            process.env.TWITTER_USERNAME,
            process.env.TWITTER_PASSWORD
        );

        if (await scraper.isLoggedIn()) {
            console.log("Logged in successfully!");

            const tweets = scraper.getTweets("pmarca", 100); // ✅ 替換成目標帳號
            let fetchedTweets = [];

            if (fs.existsSync(TWEETS_FILE)) {
                const fileContent = fs.readFileSync(TWEETS_FILE, "utf-8");
                fetchedTweets = JSON.parse(fileContent);
            }

            let count = 0;

            for await (const tweet of tweets) {
                if (count < 10) { // 跳過前10
                    count++;
                    continue;
                }

                console.log("--------------------");
                console.log("Tweet ID:", tweet.id);
                console.log("Text:", tweet.text);
                console.log("Created At:", tweet.createdAt);

                fetchedTweets.push({
                    id: tweet.id,
                    text: tweet.text,
                    createdAt: tweet.createdAt
                });

                fs.writeFileSync(
                    TWEETS_FILE,
                    JSON.stringify(fetchedTweets, null, 2)
                );
            }

            console.log("All tweets fetched and saved to", TWEETS_FILE);
            await scraper.logout();
            console.log("Logged out successfully!");
        } else {
            console.log("Login failed. Check credentials.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
})();
