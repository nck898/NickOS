# NickOS 🍎

A retro Y2K-inspired web operating system built with React and TypeScript. Inspired by both RyoOS and PostHog's website, this was built with Cursor, Codex, and my own codin skills :)

<img width="1778" height="982" alt="NickOS_screenshot" src="https://github.com/user-attachments/assets/13f4d3ec-08db-4ad1-b408-1f56a16dd5d5" />


## Features

- 🖥️ **Desktop Interface** - Clickable desktop icons for launching apps
- 📊 **Top Menu Bar** - Classic menu bar with dropdown menus (NickOS, File, Edit, View)
- 🎯 **Dock Bar** - Bottom dock with hover magnification effects (just like Mac OS!)
- 🗑️ **Trash App** - Empty your trash with style
- 🎬 **Video Player** - Watch funny YouTube videos
- 🎮 **Pong Game** - Classic retro game with AI opponent

## Getting Started

### Prerequisites

- Node.js (v20.13.1 or higher recommended)
- npm

### Installation

1. Clone or navigate to this directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

### Deploy to Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod
   ```

### Deploy to GitHub Pages

1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS3** - Styling with retro Y2K aesthetics

## Controls

- **Desktop Icons**: Double-click to open apps
- **Dock Icons**: Click to open apps, hover to see magnification effect
- **Menu Bar**: Click menu items to see dropdown options
- **Pong Game**: Use ↑↓ arrow keys or W/S to move your paddle

## License

MIT

Enjoy your retro computing experience! 🎉
