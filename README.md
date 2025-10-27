# CBC Tutor 🧠

A privacy-first AI tutoring assistant that helps students take notes, understand content, and test their knowledge — all powered by Chrome's built-in AI with secure local authentication.

## ✨ Features

### 📝 Smart Note Editor
- **AI-Powered Text Editing**: Rewrite, clean, and enhance text with Chrome AI
- **Dedicated Note Titles**: Separate title field for better organization
- **OCR Text Extraction**: Upload images to extract and clean text automatically
- **Language Detection**: Auto-detect text language with confidence levels
- **AI Activity History**: Track all AI operations with recover functionality
- **Topic & Tag Organization**: Categorize notes with auto-complete suggestions
- **Required Field Validation**: Ensures complete note information before saving

### 🧠 AI Summarization & Learning
- **Individual Note Summaries**: Generate summaries, insights, and action items per note
- **Understanding Quizzes**: AI-generated 5-question multiple choice tests
- **Quiz Review System**: Detailed review of all questions with correct/incorrect answers
- **Progress Tracking**: Visual progress charts showing quiz performance over time
- **Quiz History**: Complete history of all quiz attempts with timestamps
- **Mobile-Responsive**: Floating quiz panel for mobile devices

### 🌐 Smart Translation
- **Multi-Language Support**: Translate between 10+ languages
- **Translation History**: Persistent history of all translations
- **Auto-Detection**: Source language detection with confidence indicators
- **Real-Time Detection**: Language detection as you type

### 🔒 Privacy & Security
- **Local Authentication**: Secure username/password protection
- **Encrypted Storage**: All data encrypted and stored locally
- **No Data Collection**: Complete privacy with local-only processing
- **Export & Import**: Full control over your data with JSON backup

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
   docker compose up -d
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

## 💻 Desktop Web Application

**Note**: CBC Tutor is designed as a desktop web application since Chrome AI APIs are currently only available on desktop Chrome browsers.

1. Open Chrome desktop browser (version 127+)
2. Navigate to the application URL
3. Enable Chrome AI features in `chrome://flags`
4. Use CBC Tutor directly in your browser

## 🎯 Usage Guide

### Getting Started
- Create a secure local account on first use
- All data is encrypted and stored locally
- Export/import notes to sync across devices

### Creating Notes
1. **Fill Required Fields**: Enter title, topic, tags, and content
2. **Use AI Features**: Select text to rewrite, clean, or translate
3. **Upload Images**: Extract text from images with OCR
4. **Track AI History**: View all AI operations in the side panel
5. **Recover Text**: Click recover on any AI result to restore it

### Taking Quizzes
1. **Generate Summary**: Click on any note to create AI summary
2. **Start Quiz**: Click "Test Your Understanding" for 5 questions
3. **Review Results**: See detailed breakdown of correct/incorrect answers
4. **Track Progress**: View progress charts to monitor improvement
5. **Review History**: Click on any past quiz to see full details

### Smart Note Editor
- **Structured Note Creation**: Separate fields for title, topic, tags, and content
- **AI Text Enhancement**: Select text to rewrite, clean, or translate
- **OCR Integration**: Upload images to automatically extract and format text
- **AI Activity Tracking**: Complete history of all AI operations per note
- **Recovery System**: Restore any previous AI result with one click
- **Validation System**: Required field warnings prevent incomplete notes
- **Auto-Complete**: Smart suggestions for topics and tags

### AI Summarizer & Quizzes
- **Note-Specific Summaries**: Individual summaries for each note with persistent storage
- **Comprehensive Quizzes**: 5-question multiple choice tests based on action items
- **Detailed Quiz Review**: Full question-by-question analysis with correct answers
- **Progress Visualization**: Color-coded progress bars showing improvement over time
- **Performance Analytics**: Average scores and attempt tracking
- **Mobile Quiz Access**: Floating button interface for mobile devices
- **Topic Organization**: Notes grouped by topics for better study organization

### Advanced Translation
- **Translation History**: Persistent storage of all translation attempts
- **Clickable History**: Reuse previous translations with one click
- **Multi-Language Detection**: Support for 10+ languages with confidence scoring
- **Real-Time Processing**: Instant language detection as you type

## 🏗️ Architecture

```
src/
├── components/          # React components
│   ├── Editor.tsx      # Smart note editor with AI features & recovery
│   ├── SummarizerPanel.tsx # AI summarization, quizzes & progress charts
│   ├── Translator.tsx  # Language translation with history
│   ├── LoginForm.tsx   # Authentication interface
│   ├── ModelLoadingAnimation.tsx # AI loading states
│   └── OnboardingWelcome.tsx # Welcome screen
├── hooks/              # Custom React hooks
│   └── useAI.ts       # Chrome AI API wrapper
├── utils/              # Utility functions
│   ├── chrome-ai.ts   # AI API helpers
│   ├── storage.ts     # IndexedDB operations with quiz/summary storage
│   ├── auth.ts        # Local authentication
│   └── textFormatter.ts # Markdown & text processing
├── types/              # TypeScript definitions
│   └── chrome-ai.d.ts # Extended Note interface with quizzes & summaries
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
- **Topic-Based Organization**: Notes automatically grouped by topics
- **Smart Auto-Complete**: Suggestions for existing topics and tags
- **Progress Tracking**: Visual charts showing quiz performance trends
- **Comprehensive Review**: Detailed analysis of quiz attempts
- **Mobile Learning**: Responsive design for studying on any device
- **Recovery System**: Restore any AI-processed text from history
- **Validation Helpers**: Visual indicators for required fields

## 🐛 Troubleshooting

### AI Features Not Working
1. Ensure Chrome version 127+
2. Enable required flags in `chrome://flags`
3. Update AI model in `chrome://components`
4. Restart Chrome completely

### Quiz & Progress Issues
1. Ensure notes have action items for quiz generation
2. Check that summaries are generated before taking quizzes
3. Clear browser data if quiz history is corrupted
4. Refresh page if progress charts don't load

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