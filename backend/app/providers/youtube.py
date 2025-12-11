import asyncio
import yt_dlp

async def get_video_info(query: str):
    ydl_opts = {
        'format': 'bestaudio[ext=m4a]/bestaudio/best',
        'noplaylist': True,
        'quiet': True,
        'no_warnings': False,
        'extractor_args': {
            'youtube': {
                'player_client': ['ios', 'web'],
            }
        },
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            if "http" in query:
                info = await asyncio.to_thread(ydl.extract_info, query, download=False)
            else:
                info = await asyncio.to_thread(ydl.extract_info, f"ytsearch1:{query}", download=False)
                if 'entries' in info:
                    info = info['entries'][0]

            # Get the actual URL from formats if direct url not available
            url = info.get('url')
            if not url and info.get('formats'):
                # Find best audio format
                for fmt in reversed(info['formats']):
                    if fmt.get('url') and fmt.get('acodec') != 'none':
                        url = fmt['url']
                        break
                # Fallback to any format with url
                if not url:
                    for fmt in reversed(info['formats']):
                        if fmt.get('url'):
                            url = fmt['url']
                            break

            return {
                "url": url,
                "duration": info.get('duration')
            }
    except Exception as e:
        print(f"YTDLP Error: {e}")
        return None
