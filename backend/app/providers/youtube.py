import asyncio
import yt_dlp

async def get_stream_url(video_id: str) -> dict | None:
    """Get audio stream URL using yt-dlp"""
    vid = video_id.replace("ytm_", "")
    url = f"https://www.youtube.com/watch?v={vid}"
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = await asyncio.to_thread(ydl.extract_info, url, download=False)
            
            stream_url = info.get('url')
            
            # Fallback: get from formats
            if not stream_url and info.get('formats'):
                for fmt in reversed(info['formats']):
                    if fmt.get('url') and fmt.get('acodec') != 'none':
                        stream_url = fmt['url']
                        break
            
            if not stream_url:
                return None
                
            return {
                "url": stream_url,
                "duration": info.get('duration')
            }
    except Exception as e:
        print(f"yt-dlp error: {e}")
        return None
