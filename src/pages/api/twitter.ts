import { NextApiRequest, NextApiResponse } from 'next';
import { TwitterApi } from 'twitter-api-v2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY as string,
      appSecret: process.env.TWITTER_API_SECRET as string,
      accessToken: process.env.TWITTER_ACCESS_TOKEN as string,
      accessSecret: process.env.TWITTER_ACCESS_SECRET as string,
    });

    // Step 1: 用 username 換 userId
    const user = await client.v2.userByUsername('monado528993');
    const userId = user.data.id; // 拿到真正的 user ID (一串數字)

    // Step 2: 再用 userId 取得貼文
    const tweets = await client.v2.userTimeline(userId, {
      max_results: 5, // 抓最新 5 則
      'tweet.fields': ['created_at', 'text'],
    });

    // 成功返回
    res.status(200).json({ tweets: tweets.data });
  } catch (error) {
    console.error('Error fetching tweets:', error);
    res.status(500).json({ error: 'Failed to fetch tweets' });
  }
}
