# Nanofacet (Gem Compare)

Nanofacet is a React-based tool designed to analyze images and generate highly detailed prompts for image reproduction. It features a comparison interface ("Gem Compare") that allows users to test different "Gem" personalities or system prompts against the same source image.

## Features

-   **Multi-Perspective Analysis**: Run an image through multiple "Gem" personas simultaneously.
-   **Visual Architect Logic**: Forensically analyze images for anatomy, lighting, and composition.
-   **Image Generation**: (Optional) Generate new images based on the analyzed prompts using Google Gemini or Wavespeed AI.
-   **Library**: Save and compare your favorite results.

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Run Locally**
    ```bash
    npm run dev
    ```

3.  **Configuration**
    -   Open the app in your browser.
    -   Click the "Settings" or Key icon to enter your Google Gemini API Key.
    -   Keys are stored in your browser's **Session Storage** for security (they will be cleared when you close the tab).

## Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS (implied/styled components)
-   **State Management**: Zustand
-   **AI Integration**: Google Generative AI SDK, Wavespeed API (optional)

## Deployment

Build for production:

```bash
npm run build
```
