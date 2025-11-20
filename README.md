# Spotify Top Tracks

A privacy-first web application that lets you upload your Spotify Extended Streaming History data, filter by playtime, and discover your true listening time processed locally in your browser.


## How to Use

### 1. Get Your Spotify Data
1. Go to [Spotify Privacy Settings](https://www.spotify.com/account/privacy/)
2. Request your **Extended Streaming History**
3. Wait for Spotify to email you (can take up to 30 days, but it's usually much faster)
4. Download the ZIP file from the email

### 2. Upload Your Data
- **Option A**: Upload the entire ZIP file directly
- **Option B**: Extract the ZIP and upload individual `Streaming_History_Audio_*.json` files

### 3. View your aggregated listening data

---

## Important Note

> **This project is ~95% vibe-coded** and served as a demonstration of Google's Antigravity IDE capabilities.



## Development Notes

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nischolas/antigravity-spotify.git
   cd antigravity-spotify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**

   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The optimized build will be available in the `dist/` directory.



## Acknowledgments

- Built with [Google Antigravity IDE](https://deepmind.google/technologies/gemini/antigravity/)
- Using Gemini 3 Pro and Claude Sonnet 4.5 LLMs
- Data processing powered by [JSZip](https://stuk.github.io/jszip/)
