# StyleShift AI

🎨 AI-powered virtual try-on app for clothing using Gemini AI for intelligent style transformation and outfit visualization.

## Features

- **Camera & Upload**: Capture live photos or upload existing images
- **AI Style Transfer**: Transform outfits using Gemini AI
- **Style Catalog**: Choose from casual, business, summer, cyber, and more styles
- **Sensitive Content Toggle**: Optional NSFW filtering
- **Download Results**: Save generated images

## Tech Stack

- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS
- Google Gemini AI
- Lucide React (Icons)

## Setup

### Local Development

```bash
git clone https://github.com/joaoccaldas/styleshift-ai.git
cd styleshift-ai
npm install
```

Create `.env` file:
```
REACT_APP_GEMINI_API_KEY=your_api_key_here
```

Run development server:
```bash
npm run dev
```

## Deploy to Render

1. Connect this GitHub repo to Render
2. Create a **Static Site**
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Add environment variable: `REACT_APP_GEMINI_API_KEY`

## Entry Point

`index.tsx` → `App.tsx` → Main application

## License

MIT
