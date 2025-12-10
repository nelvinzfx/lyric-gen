import asyncio
from app.providers import ytmusic

async def test():
    print("Testing YTMusic search...")
    try:
        results = await ytmusic.search("coldplay yellow")
        print(f"Found {len(results)} results")
        for r in results:
            print(f"- {r.title} by {r.artist}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
