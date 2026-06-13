from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp
import logging

# Initialize Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Universal Media Extractor API", version="1.0.0")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with ['https://yourusername.github.io'] in production
    allow_credentials=True,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/api")
async def extract_media(url: str = Query(..., description="The media URL to extract")):
    if not url:
        raise HTTPException(status_code=400, detail="Missing required 'url' parameter.")
  
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cookie_path = os.path.join(current_dir, 'cookies.txt')

    # High-compatibility configuration to mimic organic user traffic
    ydl_opts = {
        'format': 'best',
        'noplaylist': True,
        'quiet': True,
        'no_warnings': True,
        'socket_timeout': 15,
        
        # BYPASS FIX: Force YouTube to process via Safari & Embedded pipelines
        # This completely skips the strict desktop bot-verification layers!
        'extractor_args': {
            'youtube': {
                'player_client': ['web_safari', 'web_embedded']
            },
            'instagram': {'allow_anonymous': True}
        },
        
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        }
    }

    if os.path.exists(cookie_path):
        logger.info(f"Authenticating session using local configuration file: {cookie_path}")
        ydl_opts['cookiefile'] = cookie_path
    else:
        logger.warning("No authentication cookie file detected. Proceeding with raw connection parameters.")

    try:
        logger.info(f"Processing extraction request for URL: {url}")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Extract metadata without downloading actual file payloads to the server
            info = ydl.extract_info(url, download=False)
            
            # Resolve dynamic video streams
            download_url = info.get('url')
            if not download_url and 'formats' in info:
                # Prioritize pre-muxed streams containing both video and audio tracks
                valid_formats = [f for f in info['formats'] if f.get('vcodec') != 'none' and f.get('acodec') != 'none']
                download_url = valid_formats[-1].get('url') if valid_formats else info['formats'][-1].get('url')

            if not download_url:
                raise ValueError("No direct media streams found for this URL.")

            return {
                "success": True,
                "provider": info.get('extractor_key', 'Unknown'),
                "title": info.get('title', 'Extracted Media Content'),
                "duration": info.get('duration'),
                "thumbnail": info.get('thumbnail'),
                "download_url": download_url
            }

    except Exception as e:
        logger.error(f"Extraction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process media resource: {str(e)}")