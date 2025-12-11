import asyncio
import yt_dlp

async def get_video_info(query: str):
    ydl_opts = {
        'format': 'bestaudio/best',
        'noplaylist': True,
        'quiet': True,
        'key': 'FFmpegExtractAudio',
        'extractor_args': {'youtube': {'player_client': ['web']}},
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            if "http" in query:
                info = await asyncio.to_thread(ydl.extract_info, query, download=False)
            else:
                info = await asyncio.to_thread(ydl.extract_info, f"ytsearch1:{query}", download=False)
                if 'entries' in info:
                    info = info['entries'][0]

            return {
                "url": info.get('url'),
                "duration": info.get('duration')
            }
    except Exception as e:
        print(f"YTDLP Error: {e}")
        return None