# LyricGen

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)

**LyricGen** is an experimental, immersive lyric visualizer that transforms standard synced lyrics (LRC) into dynamic, kinetic typography experiences in real-time. 

Designed to bridge the gap between static music players and high-effort motion graphic lyric videos, LyricGen utilizes advanced timing algorithms to simulate "word-by-word" synchronization from line-level data.

---

## Features

### 1. Dynamic Lyric Engines
LyricGen features three distinct visualization engines, each with unique algorithms for timing and animation:

*   **Story Mode (Instagram Style)**
    *   **Inspiration:** Instagram Stories & modern typography posters.
    *   **Behavior:** Renders lyrics as tight, block-justified paragraphs with dynamic font sizing (Small to Huge) based on word count and visual weight.
    *   **Tech:** Uses a "Hybrid Kinetic" timing model with a safe 85% reveal window and smart 0.1s offsets to ensure lyrics flow naturally with the vocals without feeling rushed.

*   **Drill Mode**
    *   **Inspiration:** UK/NY Drill lyric videos and aggressive rap edits.
    *   **Behavior:** Single-word stream that hits hard. Features aggressive 3D transforms, blurs, and shaking effects.
    *   **Tech:** Utilizes a strict "Staccato" timing profile with short attack and fast release to match high-BPM tracks.

*   **Kinetic Mode**
    *   **Inspiration:** Apple Music & Spotify's live lyrics.
    *   **Behavior:** A balanced, smooth word-by-word reveal that emphasizes readability and flow.
    *   **Tech:** Standard weighted timing logic based on word length and punctuation pauses.

### 2. Smart Audio & Sync
*   **YouTube Integration:** Fetches audio and metadata directly from YouTube via `yt-dlp`.
*   **Auto-Sync:** Automatically scrapes and synchronizes LRC data using `syncedlyrics`.
*   **Immersive Player:** A clean, distraction-free UI that focuses entirely on the typography.

---

## Tech Stack

### Frontend
*   **Framework:** React 18 + TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **Animation:** Framer Motion (Complex physics-based transitions)
*   **State Management:** Zustand
*   **Icons:** Lucide React

### Backend
*   **Server:** Python (Flask)
*   **Audio Processing:** yt-dlp
*   **Lyrics:** syncedlyrics (LRC scraping)

---

## Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)
*   ffmpeg (for audio processing)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/lyricgen.git
    cd lyricgen
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```

3.  **Setup Frontend**
    ```bash
    # Open a new terminal in the root directory
    npm install
    ```

### Running the App

1.  **Start Backend API**
    ```bash
    cd backend
    python run.py
    ```

2.  **Start Frontend**
    ```bash
    npm run dev
    ```

3.  Open `http://localhost:5173` to start the experience.

---

## The "Smart Timing" Algorithm

One of the biggest challenges in this project was converting **Line-Synced Data** (standard LRC files) into a **Word-Synced Experience**. 

Since we don't have per-word timestamps, LyricGen uses a custom heuristic algorithm:
1.  **Weighting:** Assigns "visual weight" to words based on length. Short words (e.g., "I", "to") are faster; longer words get more time.
2.  **Punctuation:** Adds calculated delays for commas and periods to simulate natural breath pauses.
3.  **Density Calculation:** Detects song tempo (Rap vs. Ballad) based on characters-per-second and adjusts the animation window (80% vs 95%) dynamically to prevent "rushing" or "dragging".

---

## Inspiration

*   **Instagram Stories:** For the "Story" mode's layout and variable font sizing.
*   **Kinetic Typography:** For the motion principles used in Drill mode.
*   **Apple Music:** For the blurred, immersive background aesthetic.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
