import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 使用有效的 pkill 指令
  exec('pkill -f eliza', (error, stdout, stderr) => {
    if (error) { 
      console.error('Failed to stop Eliza:', stderr);
      return res.status(500).json({ error: 'Failed to stop AI', stderr });
    }

    console.log('Eliza stopped successfully');
    return res.status(200).json({ message: 'AI stopped successfully' });
  });
}
