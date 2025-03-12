// pages/api/tweets.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  //const filePath = path.join('/home/ubuntu/eliza/output', 'tweets.json'); // eliza
  const filePath = path.join('public/data', 'tweets.json'); // test

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    res.status(200).json(jsonData);
  } catch (error) {
    console.error('Error reading tweets.json:', error);
    res.status(500).json({ error: 'Failed to read tweets.json' });
  }
}
