# NoteZ - Electron Note-Taking App

A lightweight, cross-platform desktop note-taking application built with Electron.

## Project Structure

```
/
├── main.js             # Main process (Electron entry point)
├── package.json        # Project configuration and scripts
├── renderer.js         # Renderer process (frontend logic)
├── index.html          # App window HTML
├── styles.css          # Basic styles
└── notes.json         # Local storage for notes
```

## Features

- 📝 Create, edit, and delete notes
- 💾 Automatic saving
- 🔍 Search functionality
- 🌙 Light/Dark theme support
- 📱 Responsive design

## Development Setup

1. **Prerequisites:**
   - Node.js (v14 or higher)
   - npm (v6 or higher)

2. **Install dependencies:**
   ```bash
   npm install electron electron-builder --save-dev
   npm install
   ```

3. **Run in development:**
   ```bash
   npm start
   ```

4. **Build for distribution:**
   ```bash
   npm run dist
   ```

## Configuration

### electron-builder Setup

Add to your `package.json`:
```json
{
  "build": {
    "appId": "com.yourdomain.notez",
    "productName": "NoteZ",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": ["nsis", "portable"]
    },
    "mac": {
      "target": ["dmg"]
    },
    "linux": {
      "target": ["AppImage", "deb"]
    }
  }
}
```

## Distribution

### Desktop App
1. Run `npm run dist`
2. Find executables in the `dist` folder
3. Share via:
   - GitHub Releases
   - Direct download links
   - App stores

### Web Version
To deploy as a web app:
1. Remove Electron-specific code
2. Deploy frontend files to:
   - GitHub Pages
   - Netlify
   - Vercel

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

---
