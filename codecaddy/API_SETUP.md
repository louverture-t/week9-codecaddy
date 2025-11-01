# Google Books API Setup

This application uses the Google Books API to search for and display book information.

## 🔑 Getting Your API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Books API**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

## 🏠 Local Development Setup

1. Create a `.env.local` file in the `codecaddy/` directory:
```bash
VITE_GOOGLE_BOOKS_API_KEY=your_api_key_here
```

2. The `.env.local` file is already in `.gitignore` and will NOT be committed to Git

3. Start the development server:
```bash
npm run dev
```

## 🚀 GitHub Pages Deployment Setup

For the deployed site to work with the Google Books API:

1. Go to your repository settings: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
2. Click **"New repository secret"**
3. Add the secret:
   - **Name:** `VITE_GOOGLE_BOOKS_API_KEY`
   - **Value:** Your Google Books API key
4. Click **"Add secret"**

The GitHub Actions workflow will automatically use this secret during the build process.

## 🔒 Security Notes

- ✅ API keys are stored in GitHub Secrets (encrypted)
- ✅ `.env.local` files are ignored by Git
- ✅ API keys are injected at build time, not committed to the repository
- ⚠️ The API key will be visible in the built JavaScript files (client-side)
- 💡 For production apps, consider using a backend proxy to hide API keys

## 🧪 Testing Without API Key

If no API key is configured, the app will automatically fall back to mock data with 5 sample books.

## 📚 API Documentation

- [Google Books API Documentation](https://developers.google.com/books/docs/v1/using)
- [API Reference](https://developers.google.com/books/docs/v1/reference)

