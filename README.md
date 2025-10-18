# 📝 SmartNote AI - Chrome Extension

A privacy-first, offline-capable Chrome Extension that empowers users to summarize, proofread, rephrase, translate, and simplify text — all powered by **Chrome's built-in AI APIs (Gemini Nano)**.

## ✨ Features

- **📋 Summarize** - Condense long text into key points
- **✏️ Proofread** - Fix grammar and spelling errors
- **🔄 Rephrase** - Rewrite text in different tones (Professional/Academic/Friendly)
- **🌍 Translate** - Translate text to multiple languages
- **🧠 Simplify** - Explain complex concepts in simple terms (ELI5 style)
- **💾 SmartBoard** - Save and organize all your AI-processed notes
- **🎨 Dark Mode** - Full dark/light theme support
- **📥 Export** - Download your notes as JSON
- **⚡ Offline** - All processing happens on your device, no cloud uploads
- **🔒 Privacy-First** - No tracking, no analytics, no data collection

## 📁 Installation

### Step 1: Create Folder Structure

Create this exact structure on your computer:

```
smartnote-ai/
├── manifest.json
├── background.js
├── content.js
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── dashboard/
│   ├── dashboard.html
│   ├── dashboard.css
│   └── dashboard.js
└── README.md
```

### Step 2: Copy All Files

Download all files from the artifacts:
- `manifest.json` → Root folder
- `background.js` → Root folder
- `content.js` → Root folder
- `popup.html` → `popup/` folder
- `popup.css` → `popup/` folder
- `popup.js` → `popup/` folder
- `dashboard.html` → `dashboard/` folder
- `dashboard.css` → `dashboard/` folder
- `dashboard.js` → `dashboard/` folder
- `README.md` → Root folder

### Step 3: Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select your `smartnote-ai` folder
5. ✅ SmartNote AI is now installed!

### Step 4: Enable Chrome AI APIs

1. Go to `chrome://flags`
2. Search for "experimental web platform features"
3. Set to **Enabled**
4. Restart Chrome

## 🚀 Usage

### From the Popup

1. Click the SmartNote AI icon in your Chrome toolbar
2. Enter or paste text into the input box
3. Choose an AI action:
   - 📋 **Summarize** - Get concise summary
   - ✏️ **Proofread** - Fix grammar & spelling
   - 🔄 **Rephrase** - Rewrite in selected tone
   - 🧠 **Simplify** - Explain in simple terms
   - 🌍 **Translate** - Translate to Spanish
4. View the result and copy or save to SmartBoard

### From Right-Click Context Menu

1. Select any text on a webpage
2. Right-click and choose:
   - 📋 **Summarize with AI**
   - ✏️ **Proofread**
   - 🧠 **Simplify Concept**
   - 🌍 **Translate**
   - 🔄 **Rephrase**

### SmartBoard Dashboard

1. Click **📊 Open SmartBoard** from the popup
2. View all saved notes in a searchable grid
3. Features:
   - **Search** - Find notes by text or action
   - **Copy** - Copy result to clipboard
   - **Delete** - Remove individual notes
   - **Export** - Download all notes as JSON
   - **Clear All** - Delete all notes at once
   - **Theme Toggle** - Switch dark/light mode

## 🛠️ Technical Details

### Technology Stack

- **Manifest V3** - Latest Chrome Extension standard
- **Chrome Gemini Nano API** - On-device AI processing
- **Chrome Storage API** - Local note persistence
- **Vanilla JavaScript** - No external dependencies
- **Material Design** - Google-style UI

### How It Works

1. User enters or selects text
2. Selects an AI action (Summarize, Proofread, etc.)
3. Message sent to background service worker
4. Background script calls Chrome's Gemini Nano API
5. AI processes text on-device (no cloud upload)
6. Result displayed in popup
7. User can copy result or save to SmartBoard
8. Notes saved to Chrome's local storage

### File Structure

- **manifest.json** - Extension configuration & permissions
- **background.js** - Service worker handling AI processing & storage
- **content.js** - Web page interaction & notifications
- **popup/** - Main UI (HTML, CSS, JS)
- **dashboard/** - SmartBoard UI (HTML, CSS, JS)

## 🔒 Privacy & Security

✅ **100% Offline** - All AI processing happens on your device  
✅ **No Cloud Uploads** - Your text never leaves your computer  
✅ **No Tracking** - Zero analytics or telemetry  
✅ **Local Storage Only** - Notes stored in Chrome's local storage  
✅ **Open Source Ready** - Full transparency

## 📝 Example Use Cases

- **Students** - Simplify complex academic papers
- **Writers** - Proofread and rephrase content
- **Professionals** - Translate emails and documents
- **Content Creators** - Generate summaries for social media
- **Non-native Speakers** - Quick translation and simplification

## 🐛 Troubleshooting

### Issue: "AI API not available"

- Ensure Chrome version is 123+
- Go to `chrome://flags`
- Search for "Experimental web platform features"
- Set to **Enabled**
- Restart Chrome

### Issue: Extension won't load

- Verify folder structure matches exactly
- Check manifest.json for syntax errors
- Clear Chrome cache: Settings → Privacy → Clear browsing data
- Reload the extension

### Issue: Context menu not showing

- Refresh the webpage
- Ensure extension is enabled in `chrome://extensions/`
- Check that extension has permission for the domain

## 🎨 Customization

### Change Theme Colors

Edit `:root` variables in `popup/popup.css`:

```css
:root {
  --primary: #5F6EF5;        /* Main brand color */
  --success: #34A853;         /* Success color */
  --danger: #EA4335;          /* Danger color */
}
```

### Modify AI Prompts

Edit the `processWithAI()` function in `background.js` to customize AI behavior and prompts.

## 📊 Dashboard Features

- **Search** - Real-time filtering of notes
- **Stats** - View total notes and action counts
- **Export** - Download notes as JSON backup
- **Delete** - Remove single notes or all at once
- **Theme** - Toggle between dark and light mode
- **Responsive** - Works on desktop and tablet

## ✅ Implemented Features

✅ Summarize text via AI  
✅ Proofread & grammar fix  
✅ Rephrase with tone selection  
✅ Translate text  
✅ Simplify concepts (ELI5 style)  
✅ Context menu integration  
✅ SmartBoard dashboard  
✅ Search & filter notes  
✅ Export as JSON  
✅ Dark/light theme  
✅ Copy to clipboard  
✅ Character counter  
✅ 100% offline (on-device AI)  
✅ Privacy-first design  
✅ Responsive UI  

## 📄 License

Open source - Free to use, modify, and distribute.

## 🤝 Contributing

Feel free to fork, modify, and submit improvements!

---

**Made for the Google Chrome Built-in AI Challenge 2025** 🚀

**Questions?** Check the troubleshooting section above or review the code comments for details.

## 🧭 Troubleshooting & Testing (new)

If you're developing or testing SmartNote AI locally, these notes explain where the AI runs, what to do when the API isn't available, and a quick checklist to verify the extension works.

### Where the AI runs

- Primary: the background service worker (Manifest V3) will attempt to call the browser's built-in AI API first.
- Fallback: if the background/service worker can't access the AI API (common in some Chrome versions or runtimes), the extension will try to delegate the AI call to the currently active tab. The content script injects a small page script to call `window.ai` from the page context and returns the result.

This fallback is defensive and designed to keep the extension working on more Chrome builds. If neither context has the AI API, the extension will surface a clear error explaining that the AI API is not available.

### Flags / Requirements

- Chrome/Chromium: use a recent build (Chrome 123+ recommended for Gemini Nano APIs).
- Enable Experimental Web Platform Features: `chrome://flags` → search `Experimental Web Platform Features` → **Enabled** → restart browser.
- Note: Some sites use strict Content Security Policies (CSP) that block script injection. In those cases, the page-delegation fallback may fail with a timeout — the popup will show a friendly error.

### Quick manual test checklist

1. Open `chrome://extensions/` and enable **Developer mode**.
2. Click **Load unpacked** and select the repository root (folder with `manifest.json`).
3. Open the extension popup: enter a sample sentence and click **Summarize**. Observe loading state and result or a clear error message.
4. Save a result to SmartBoard, then click **Open SmartBoard** and confirm the note appears (action badges are capitalized for readability). Verify search, copy, delete, and export features.
5. On any webpage, select text, right-click and pick a context-menu action (Summarize, Proofread, etc.). If the background cannot access the AI API, the content script will try to run it in the page.
6. If AI calls time out or fail, check `chrome://flags` and ensure experimental features are enabled, and test again on a different page (some pages block script injection).

### Known limitations

- CSP: Pages with restrictive Content Security Policy may prevent the content script from injecting the page script; this will cause the fallback to fail and an error to be returned to the user.
- Non-availability of API: If neither the background nor the active page exposes the AI API, no local processing is possible — the extension will show an error prompting you to enable the experimental flag or try on a different page.

If you'd like, I can add an in-extension UI fallback that opens a prefilled popup with the selected text when both automatic options fail. This would let users manually trigger processing from the popup.