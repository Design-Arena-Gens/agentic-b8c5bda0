# YouTube Upload Agent

Automated YouTube video uploader with AI-powered SEO optimization.

## Features

- 🚀 **Automated Uploads**: Upload videos directly to YouTube
- 🤖 **AI-Powered SEO**: Generate optimized titles, descriptions, tags, and hashtags
- 📅 **Schedule Publishing**: Set future publish dates for your videos
- 💰 **Monetization Control**: Enable/disable monetization per video
- 🌍 **Multi-Language**: Support for 11+ languages
- 🎨 **Thumbnail Prompts**: Get AI-generated prompts for creating thumbnails
- 📊 **Category Optimization**: Specialized SEO for tech, vlog, shorts, gaming, tutorial, and more

## Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment Variables**

Create a `.env` file with:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
OPENAI_API_KEY=your_openai_api_key (optional, has demo fallback)
```

3. **Setup Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable YouTube Data API v3
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback`
   - Copy Client ID and Client Secret to `.env`

4. **Run Development Server**
```bash
npm run dev
```

5. **Build for Production**
```bash
npm run build
npm start
```

## Usage

1. **Connect Google Account**: Click "Connect Google Account" to authorize YouTube access
2. **Upload Video**: Choose a video file or paste a video URL
3. **Configure Settings**:
   - Select category (tech, vlog, shorts, gaming, tutorial, etc.)
   - Choose language
   - Enable/disable monetization
   - Set schedule time (optional)
4. **Generate Metadata**: Click "Generate SEO Metadata" for AI-optimized content
5. **Review & Edit**: Review and customize the generated metadata
6. **Upload**: Click "Upload to YouTube" to publish your video

## API Endpoints

- `POST /api/generate-metadata`: Generate SEO metadata for video
- `POST /api/upload`: Upload video to YouTube
- `GET /api/auth/google`: Initiate Google OAuth flow
- `GET /api/auth/callback`: Handle OAuth callback
- `GET /api/auth/status`: Check authentication status

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **APIs**: YouTube Data API v3, OpenAI GPT-4
- **Authentication**: Google OAuth 2.0

## Deployment

Deploy to Vercel:

```bash
vercel deploy --prod
```

Make sure to add environment variables in Vercel project settings.

## License

MIT
