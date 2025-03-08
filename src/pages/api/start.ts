import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

const CHARACTER_PATH = "/home/ubuntu/eliza/characters/monado.json";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { character } = req.body;
  if (!character) {
    return res.status(400).json({ error: "Invalid character data" });
  }

  // **1️⃣ 產生 JSON 文件**
  fs.writeFileSync(CHARACTER_PATH, JSON.stringify(character, null, 2));

  // **2️⃣ 執行 `pnpm start`**
  const command = `cd /home/ubuntu/eliza && pnpm start --characters="${CHARACTER_PATH}"`;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Failed to start AI:", stderr);
      return res.status(500).json({ error: "AI failed to start" });
    }
    console.log("AI started successfully:", stdout);
    return res.json({ message: "AI Agent started successfully!" });
  });
}
