<div align="center">
<img src="learned_logo.png" alt="Learned Logo" width="200" />
</div>

# Learned - Legal Education Platform

AI-powered legal education platform for Nigerian law students. Practice questions, study assistance, and educational resources.

**Built by:** REFORMA DIGITAL SOLUTIONS LIMITED (RC: 8801487)

## Features

- 📚 **Practice Area**: AI-generated quiz questions covering all law school levels (100-500 Level + Law School)
- 💬 **Study Room**: Interactive AI tutor powered by Google Gemini
- 📖 **Blog**: Educational content and learning strategies
- 🎯 **Personalized Learning**: Tailored to your university, level, and courses

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **AI**: Google Gemini 2.5 Flash
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Run Locally

**Prerequisites:** Node.js 18+ and npm

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd learned
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
   - Add it to `.env.local`:
     ```
     VITE_GEMINI_API_KEY=your_actual_api_key_here
     ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

## Deploy to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

### Manual Deployment

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration

3. **Configure Environment Variables**
   - In Vercel project settings → Environment Variables
   - Add: `VITE_GEMINI_API_KEY` = `your_api_key`
   - Make sure to add it for Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Your app will be live in ~2 minutes!

### Environment Variables for Vercel

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key for AI features | Yes |

## Project Structure

```
learned/
├── components/        # Reusable UI components
├── data/             # Course content and MCQ data
├── services/         # API services (Gemini integration)
├── views/            # Main application views
│   ├── Onboarding.tsx
│   ├── Practice.tsx
│   ├── Study.tsx
│   └── Blog.tsx
├── App.tsx           # Main app component
├── types.ts          # TypeScript type definitions
├── index.css         # Global styles
└── vite.config.ts    # Vite configuration

```

## Courses Covered

- Constitutional Law
- Criminal Law
- Law of Contract
- Law of Torts
- Land Law
- Equity and Trusts
- Commercial Law
- Evidence
- Jurisprudence
- Company Law
- Nigerian Legal System
- Administrative Law
- And more...

## Contributing

This is a proprietary project by REFORMA DIGITAL SOLUTIONS LIMITED.

## License

© 2024 REFORMA DIGITAL SOLUTIONS LIMITED. All rights reserved.

## Support

For issues or questions, please contact REFORMA DIGITAL SOLUTIONS LIMITED.

---

**Made with ❤️ for Nigerian Law Students**
