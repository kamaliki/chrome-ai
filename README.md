# CBC Tutor 🧠

A privacy-first AI tutoring assistant that helps students take notes, understand content, and test their knowledge — all powered by Chrome's built-in AI with secure local authentication.

## ✨ Features

- **Smart Note Editor**: AI-powered text editing with rewriting, cleaning, and markdown formatting
- **Language Detection**: Auto-detect text language with confidence levels using Chrome AI
- **OCR Text Extraction**: Extract and clean text from images with AI formatting
- **AI Summarization**: Generate summaries, insights, and action items with markdown support
- **Understanding Quizzes**: Test comprehension with AI-generated questions and progress tracking
- **Smart Translation**: Translate with auto-detection and confidence indicators
- **Secure Authentication**: Local username/password protection with encrypted storage
- **Export & Import**: Backup and sync notes across devices with JSON export
- **Privacy-First**: All AI processing and data storage happens locally in your browser

## 🚀 Chrome AI APIs Used

- **Summarizer API**: Generate concise summaries of notes and text
- **Writer API**: Create study prompts and clean extracted text
- **Rewriter API**: Improve clarity and tone of selected text
- **Translator API**: Translate content between multiple languages
- **Language Detector API**: Auto-detect source language with confidence levels

## 📋 Requirements

- **Chrome Browser**: Version 127+ with built-in AI features enabled
- **HTTPS**: Required for Chrome AI APIs to function
- **Experimental Features**: Enable Chrome's AI features in `chrome://flags`

### Enabling Chrome AI Features

1. Open `chrome://flags` in Chrome
2. Search for and enable:
   - `#optimization-guide-on-device-model`
   - `#prompt-api-for-gemini-nano`
   - `#summarization-api-for-gemini-nano`
   - `#rewriter-api-for-gemini-nano`
   - `#translator-api-for-gemini-nano`
3. Restart Chrome
4. Visit `chrome://components` and update "Optimization Guide On Device Model"

## 🛠️ Setup & Installation

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cbc-tutor
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Open Chrome and navigate to `http://localhost:4173`
   - Enable Chrome AI features (see requirements above)

### Option 2: Manual Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cbc-tutor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📱 PWA Installation

1. Open the app in Chrome
2. Click the install icon in the address bar
3. Follow the installation prompts
4. Use CBC Tutor as a standalone app

## 🎯 Usage Guide

### Getting Started
- Create a secure local account on first use
- All data is encrypted and stored locally
- Export/import notes to sync across devices

### Smart Note Editor
- Create and edit notes with autosave
- Upload images to extract text with OCR
- Select text to rewrite, clean, or translate
- Auto-detect language with confidence levels
- View AI activity history for each note

### AI Summarizer
- Click on any note to generate AI summaries
- Get markdown-formatted insights and action items
- Take comprehension quizzes based on your notes
- Track quiz performance over time

### Translator
- Translate text between 10+ languages
- Auto-detect source language with confidence
- Real-time language detection as you type
- Copy translations with one click

## 🏗️ Architecture

```
src/
├── components/          # React components
│   ├── Editor.tsx      # Smart note editor with AI features
│   ├── SummarizerPanel.tsx # AI summarization and quizzes
│   ├── Translator.tsx  # Language translation
│   ├── LoginForm.tsx   # Authentication interface
│   └── OnboardingWelcome.tsx # Welcome screen
├── hooks/              # Custom React hooks
│   └── useAI.ts       # Chrome AI API wrapper
├── utils/              # Utility functions
│   ├── chrome-ai.ts   # AI API helpers
│   ├── storage.ts     # IndexedDB operations
│   ├── auth.ts        # Local authentication
│   └── textFormatter.ts # Markdown formatting
├── types/              # TypeScript definitions
└── styles/             # CSS and styling
```

## 🔒 Privacy & Security

- **Local Authentication**: Secure username/password with SHA-256 hashing
- **Encrypted Storage**: All user data encrypted locally
- **No Data Collection**: All processing happens locally
- **No Server Required**: Completely client-side application
- **Offline Capable**: Works without internet connection
- **Local Storage**: Notes stored in browser's IndexedDB
- **No Tracking**: No analytics or external requests
- **Export Control**: Users control their data with JSON export/import

## 🎨 Customization

### Themes
- Light and dark mode support
- Automatic system theme detection
- Manual theme toggle in header

### Study Features
- Organize notes by topics and tags
- Auto-complete for existing topics/tags
- Markdown formatting for rich text
- Language detection with confidence levels

## 🐛 Troubleshooting

### AI Features Not Working
1. Ensure Chrome version 127+
2. Enable required flags in `chrome://flags`
3. Update AI model in `chrome://components`
4. Restart Chrome completely

### PWA Installation Issues
1. Ensure HTTPS connection
2. Check service worker registration
3. Clear browser cache and try again

### Authentication Issues
1. Passwords are stored locally with encryption
2. Clear browser data to reset account
3. Use export/import to backup before reset

### Performance Issues
1. Clear IndexedDB data in DevTools
2. Export notes before clearing data
3. Restart the application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Chrome AI team for the built-in AI APIs
- React and Vite communities
- Tailwind CSS for styling
- Framer Motion for animations

---

**Note**: This application requires Chrome's experimental AI features. Functionality may vary based on Chrome version and AI model availability.