# FocusFlow 🧠

A privacy-first, offline-capable productivity and writing assistant that helps users stay focused, summarize their thoughts, rewrite messy notes, and track progress — all client-side with Chrome's built-in AI.

## ✨ Features

- **Focus Journal**: Minimal text editor with AI-powered proofreading, rewriting, and translation
- **AI Summarizer**: Generate summaries, key insights, and next actions from your notes
- **Multilingual Support**: Real-time translation using Chrome's Translator API
- **Offline-First**: Works completely offline with PWA support
- **Privacy-First**: All AI processing happens locally in your browser

## 🚀 Chrome AI APIs Used

- **Summarizer API**: Generate concise summaries of notes and text
- **Writer API**: Create motivational prompts and session recaps
- **Rewriter API**: Improve clarity and tone of selected text
- **Translator API**: Translate content between multiple languages
- **Language Detector API**: Auto-detect source language for translation

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

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd focusflow
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
4. Use FocusFlow as a standalone app

## 🎯 Usage Guide

### Focus Journal
- Create and edit notes with autosave
- Select text and use AI to rewrite or translate
- All notes are stored locally in IndexedDB

### AI Summarizer
- Click on any note to generate AI summaries
- Get key insights and suggested next actions
- Summarize all daily notes at once

### Focus Timer
- Use the Pomodoro technique (25-minute sessions)
- Get AI-generated motivational messages after sessions
- Track daily progress and focus time

### Daily Prompts
- Generate focus questions, motivational messages, or reflection prompts
- Save favorite prompts for later reference
- Switch between different prompt types

### Translator
- Translate text between 10+ languages
- Auto-detect source language
- Copy translations with one click

## 🏗️ Architecture

```
src/
├── components/          # React components
│   ├── Editor.tsx      # Main note editor
│   ├── SummarizerPanel.tsx
│   ├── Timer.tsx       # Pomodoro timer
│   ├── PromptGenerator.tsx
│   └── Translator.tsx
├── hooks/              # Custom React hooks
│   ├── useAI.ts       # Chrome AI API wrapper
│   └── useTimer.ts    # Timer functionality
├── utils/              # Utility functions
│   ├── chrome-ai.ts   # AI API helpers
│   └── storage.ts     # IndexedDB operations
├── types/              # TypeScript definitions
└── styles/             # CSS and styling
```

## 🔒 Privacy & Security

- **No Data Collection**: All processing happens locally
- **No Server Required**: Completely client-side application
- **Offline Capable**: Works without internet connection
- **Local Storage**: Notes stored in browser's IndexedDB
- **No Tracking**: No analytics or external requests

## 🎨 Customization

### Themes
- Light and dark mode support
- Automatic system theme detection
- Manual theme toggle in header

### Timer Duration
- Default 25-minute Pomodoro sessions
- Customizable in timer component
- Progress tracking and statistics

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

### Performance Issues
1. Clear IndexedDB data in DevTools
2. Reduce number of stored notes
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