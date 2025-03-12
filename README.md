# 🧠 Monado + ElizaOS AI Agent Generator

## 🌐 Overview

**Monado** (Frontend) + **ElizaOS** (AI Agent Backend System) allow users to generate AI agents and **automatically launch tokens** onchain to support their agents' ecosystems. Tokens are launched following the pump.fun model, enabling a fully integrated AI + Token economy.

## ⚙️ Tech Stack

- **Next.js** (Monado frontend)
- **Node.js** & **Typescript** (ElizaOS backend)
- **Solidity** Smart Contracts (Token launch system)
- **Hardhat / Ethers.js** (Blockchain interaction)
- **KuruDex** for listing graduated tokens

## 🚀 Key Features

- AI Agent creation with unique settings (name, avatar, personality, lore, knowledge, topics, etc.)
- Automatic Token Launch when AI Agent is created (following pump.fun style)
- Token economy system linked with each AI agent
- Supporters can purchase tokens to engage with the AI Agent's ecosystem
- Once token reaches a defined threshold (100%), it will be graduated and listed on **KuruDex**

## 💻 Installation

```bash
git clone https://github.com/your-repo/monado.git
cd monado-frontend
yarn install
yarn dev
```

## 🏗️ System Structure

- **Monado (Frontend)**
  - AI Agent Creator interface
  - Automatic on-chain token launch interface
  - Token progress bar with real-time percentage

- **ElizaOS (Backend)**
  - AI Agents' lifecycle management
  - Autonomous operation of agents based on defined personality/lore
  - Handles Twitter posting and other automated actions

## 🛠️ Blockchain Components

- **Token Contract**
  - Follows pump.fun minting model
  - Supports price curve for token minting/buying

- **Bonding/Listing**
  - Tokens that reach 100% progress are automatically listed on **KuruDex**

## ✅ Current System Flow

1. **Create AI Agent**
   - Set AI agent's profile (name, avatar, personality, etc.)

2. **Token Launch**
   - Smart contract auto-mints and launches token paired with the AI agent

3. **Progress Bar (Community Driven)**
   - Community can buy tokens to push percentage progress

4. **Graduation**
   - At 100%, the token is listed on KuruDex for open trading

## 🔗 Related Repos / Integrations

- **KuruDex**: Token DEX for trading graduated AI tokens
- **Pump.fun-inspired Token Contract**
- **ElizaOS**: AI backend system

## 📈 Example Use Case

- **Creator** makes a unique AI Agent (e.g., "Crypto Cat")
- **Crypto Cat Token** is automatically launched
- Fans of "Crypto Cat" buy tokens to support and join the ecosystem
- If the AI gains enough popularity (tokens reach 100%), **Crypto Cat Token** will be officially listed on **KuruDex**

---

**Contact / Community**: [Add your Discord, Telegram, Twitter links]

> Building the AI-powered, token-driven future.
