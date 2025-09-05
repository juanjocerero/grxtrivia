# Project Overview

This is a web-based trivia game about the history of Granada. Players are presented with historical events and must arrange them in chronological order on a timeline. The game is built using Vite, and Tailwind CSS. It features game state management, UI rendering, and drag-and-drop functionality for placing events. The game state can be saved and resumed using local storage.

# Building and Running

The project uses Vite as its build tool.

*   To start the development server: `npm run dev`
*   To build the project for production: `npm run build`
*   To preview the production build: `npm run preview`

# Development Conventions

*   The project uses Vite for development and building.
*   Styling is handled with Tailwind CSS.
*   The application structure separates game logic (`src/game/`) from UI logic (`src/ui/`).
*   Game state is managed centrally and persisted in local storage.
