# Monado AI Creator

Monado AI Creator is a **React + Next.js** application for designing AI agent profiles. Users can customize an AI entity with descriptions, traits, and knowledge, and also upload an avatar. The system integrates OpenAI API and Twitter authentication details for seamless functionality.

## 🚀 Features

- **Customizable AI agent**: Input personality, knowledge, and traits.
- **Dynamic Avatar Upload**: Upload or use a default image (`mascotImage.webp`).
- **Organized Input Sections**: Clean layout with categorized text areas.
- **API & Twitter Integration**: Fields for OpenAI API Key and Twitter credentials.
- **Fully Responsive UI**: Styled for accessibility and ease of use.

---

## 🛠 Installation

### 1️⃣ Clone the repository
```bash
$ git clone https://github.com/your-repo/monado-ai-creator.git
$ cd monado-ai-creator
```

### 2️⃣ Install dependencies
```bash
$ yarn install  # Or npm install
```

### 3️⃣ Start the development server
```bash
$ yarn dev  # Or npm run dev
```

The app should now be running at **http://localhost:3000** 🚀

---

## 🖼 UI Layout

### **1️⃣ AI Agent Information (Left Column)**
- **AI Name** (e.g., Monado)
- **Personality Traits**
- **Agent Description**
- **Short Bio**

### **2️⃣ AI Character Customization (Middle Column)**
- **Backstory**
- **Knowledge Base**
- **Topics of Interest**
- **Adjectives**

### **3️⃣ Avatar Upload & Account Settings (Right Column)**
- **Upload AI Avatar**
- **OpenAI API Key**
- **Twitter Email, Username, Password**

---

## 📸 Default Avatar
If no image is uploaded, the system will use the default avatar `mascotImage.webp` from the `public/` folder.

---

## 🔧 Configuration
### Environment Variables (Optional)
You can store API keys and authentication details in a `.env.local` file:
```env
NEXT_PUBLIC_OPENAI_API_KEY=your-api-key-here
NEXT_PUBLIC_TWITTER_EMAIL=your-email-here
NEXT_PUBLIC_TWITTER_USERNAME=your-username-here
NEXT_PUBLIC_TWITTER_PASSWORD=your-password-here
```

---

## 📜 License
This project is licensed under the **MIT License**.

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss.

1. Fork the project 🍴
2. Create your feature branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add a new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a Pull Request 🚀

---

## 🔗 Contact
For support or collaboration, reach out at **your-email@example.com**.

---

🎉 **Enjoy building your AI with Monado AI Creator!**