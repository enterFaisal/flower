# MEWA Corporate Culture Gamification Platform

## Project Overview

Create a complete Next.js web platform for the Ministry of Environment, Water & Agriculture (MEWA) featuring three gamified activities to engage employees in corporate culture values. The platform includes real-time Socket.IO functionality for live event display.

## Technology Stack

- Next.js with JavaScript/JSX
- Tailwind CSS with RTL support
- Socket.IO for real-time communication
- localStorage for progress tracking
- Arabic typography with full RTL layout

## Brand Identity

- Primary Color: Castleton Green 80-90% (#0F6A58 / #117A65)
- Accent: Green variations with wave patterns
- Font: Clean Arabic sans-serif (Cairo or Tajawal)
- Clean, minimalist, mobile-responsive design

## Implementation Steps

### 1. Project Setup & Configuration

Initialize Next.js project with all dependencies and configuration files:

- Create [`package.json`](package.json) with Next.js, React, Tailwind CSS, Socket.IO dependencies
- Setup [`next.config.js`](next.config.js) with i18n support for Arabic
- Configure [`tailwind.config.js`](tailwind.config.js) with custom green colors and RTL plugin
- Create [`postcss.config.js`](postcss.config.js) for Tailwind processing
- Setup [`styles/globals.css`](styles/globals.css) with Arabic fonts (Cairo), RTL base styles, and custom animations

### 2. Content Library

Create [`lib/content.js`](lib/content.js) with all game data extracted from Arabic content files:

- **Flower Game**: 5 plants (نبتات), each with 3 questions (Water/Light/Care categories), result quotes, and emoji placeholders
- **Personality Quiz**: 8 questions with 5 answer options each, mapping to 5 personalities (صخر, فلاح, ندى, عبير, وعد) with descriptions
- **Commitment Quiz**: 5 questions (Excellence, Commitment, Responsibility, Collaboration, Innovation) with 3 answers each (3/2/1 points), scoring system with 5 result tiers

### 3. Reusable Components

Create [`components/GameCard.js`](components/GameCard.js):

- Card component displaying game title, description, completion status
- Visual checkmark for completed games
- Hover effects and responsive design
- RTL-aware layout with Arabic text

### 4. Main Portal Page

Create [`pages/index.js`](pages/index.js):

- Ministry header with logo area
- Three GameCard components with links to each game
- Progress tracking using localStorage (`gameProgress` key)
- Congratulatory message when all games completed (raffle entry notification)
- Background with wave patterns (CSS)
- Full RTL layout with Arabic typography

### 5. Flower Game (Real-time)

Create [`pages/flower-game.js`](pages/flower-game.js):

- Multi-step flow: Name entry → Plant selection (5 options) → 3 questions per plant
- Socket.IO client connection on final step
- Emit `flower:new` event with {userName, seedName, flowerEmoji}
- Update localStorage progress on completion
- Display result quote
