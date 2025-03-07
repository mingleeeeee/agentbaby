import { NextApiRequest, NextApiResponse } from "next";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { character } = req.body;
  if (!character || !character.name) return res.status(400).json({ error: "缺少角色設定" });

  // 設定角色 JSON 存檔路徑
  const characterPath = path.join("/home/ubuntu/eliza/characters", `${character.name}.json`);

  // 儲存角色 JSON
  fs.writeFileSync(characterPath, JSON.stringify(character, null, 2));

  // 執行 AI 代理
  const command = `pnpm start --characters="${characterPath}"`;
  exec(command, (error, stdout, stderr) => {
    if (error) return res.status(500).json({ error: "AI 啟動失敗", details: error.message });
    res.json({ message: "AI 代理已啟動！" });
  });
}
