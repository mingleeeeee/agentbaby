import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const characterData = req.body.character;
  if (!characterData || !characterData.name) {
    return res.status(400).json({ error: "Character name is required" });
  }

  // Construct Eliza-compatible JSON format
  const elizaCharacter = {
    name: characterData.name,
    clients: ["twitter"],
    modelProvider: "openai",
    settings: {
      secrets: {},
      voice: {
        model: "ja_JP-female-soft"
      }
    },
    plugins: ["@elizaos/plugin-twitter"],
    bio: characterData.bio ? [characterData.bio] : [],
    lore: characterData.lore ? [characterData.lore] : [],
    knowledge: characterData.knowledge ? [characterData.knowledge] : [],
    topics: characterData.topics ? characterData.topics.split(",").map(t => t.trim()) : [],
    adjectives: characterData.adjectives ? characterData.adjectives.split(",").map((a: string) => a.trim()) : [],
    messageExamples: [],
    postExamples: [],
    style: {
      all: ["Friendly, helpful, and approachable"],
      chat: ["Answers questions clearly and concisely"],
      post: ["Shares engaging and informative posts"]
    }
  };

  const characterFilePath = `/home/ubuntu/eliza/characters/${characterData.name}.json`;

  try {
    // Save character JSON file
    fs.writeFileSync(characterFilePath, JSON.stringify(elizaCharacter, null, 2));

    // Start Eliza agent using PNPM
    const startCommand = `cd /home/ubuntu/eliza && pnpm start --characters="${characterFilePath}"`;
    const process = exec(startCommand);

    process.stdout?.on("data", (data) => console.log(data));
    process.stderr?.on("data", (data) => console.error(data));

    return res.json({ message: `AI Agent ${characterData.name} started!` });
  } catch (error) {
    console.error("Error starting AI:", error);
    return res.status(500).json({ error: "Failed to start AI" });
  }
}
