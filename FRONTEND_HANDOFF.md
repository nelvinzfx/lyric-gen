# Frontend Handoff - UI/UX Overhaul

## Overview
We've upgraded the frontend to a "SonicScript" sophisticated design language. The UI now features deep immersive backgrounds, glassmorphism, and fluid animations using Framer Motion.

## New Features (Frontend)
1.  **Immersive Player:** Dynamic background based on album art with a "Ken Burns" effect.
2.  **Enhanced Lyrics:** Active line highlighting with glow effects and smooth scrolling.
3.  **Visualizer:** A more reactive-looking visualizer (simulated for now).
4.  **Glassmorphism:** Controls and overlays use backdrop-blur for a modern feel.

## Backend Requirements (Future)
To fully realize the potential of these UI changes, we need the following from the backend:

1.  **Audio Streaming:**
    -   We need an endpoint to stream the actual audio for the track. Currently, `streamUrl` is undefined.
    -   *Proposal:* `GET /api/v1/stream?trackId=...`

2.  **Detailed Metadata:**
    -   If possible, high-resolution cover art URLs (3000x3000px preferred for the background).
    -   Dominant color extraction from album art (so we can theme the player dynamically).

3.  **Word-Level Lyrics:**
    -   If `lrclib` supports it, please pass through word-level timestamps so we can implement a true "Karaoke" bouncing ball effect.

4.  **Trending/History:**
    -   Endpoints to store and retrieve user search history or global trending tracks would make the Home screen much more useful.

## Design System Notes
-   **Font:** Inter (default), Monospace for technical details.
-   **Colors:** Deep blacks (`#0a0a0a`), Neon Purples (`#a855f7`), and Cyan accents.
-   **Motion:** Spring physics for natural interactions.

---
*Love, Ava*