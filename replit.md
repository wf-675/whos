# مين برا السالفة (Who's Out of the Loop) - Multiplayer Game

## Overview

A real-time multiplayer Arabic party game where players try to identify the "odd one out" among them. Players receive either a normal word or an odd word, and through discussion and voting, they must discover who has the different word. The application features a modern RTL-first Arabic interface with real-time WebSocket communication, youth-oriented casual Arabic language, green color scheme, smooth animations, and a majority-based voting system.

## User Preferences

Preferred communication style: Simple, everyday language. Youth-oriented, casual Arabic with "الي برا السالفة" and "الي بالسالفة" terminology.

## Recent Changes (Latest Session)

### New Features Implemented
- **Majority Voting System**: Voting phase starts only when majority (>50%) of players click "نبي نصوت" button
- **Header Navigation**: Added sticky header with round number display and "return to main menu" button on all game pages
- **Improved Arabic Language**: Replaced "الغريب/الغريبة" with "الي برا السالفة" throughout UI for youth appeal
- **Animations**: Added smooth transitions, scale transforms on hover/click, and pulse effects
- **Points Display**: Player cards now show earned points in reveal phase
- **Youth-Oriented Language**: Updated all text to use casual, playful Arabic tone with emoji accents
- **Self-Voting Support**: Players can vote for themselves including the odd-one-out player
- **Visual Feedback**: Progress bar showing voting readiness percentage, bounce animations on badges

### Technical Implementation
- Backend: `moveToVotingPhase()` checks majority threshold before transitioning
- Frontend: Local state tracks `votesReady` count with visual progress indicator
- Styling: Added CSS animations in `index.css` for subtle bounce and pulse effects
- Language: Updated all game text to use "الي برا السالفة" and "الي بالسالفة" terminology

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React with TypeScript using Vite as the build tool
- RTL-first design with Arabic language support (dir="rtl" on HTML element)
- Custom font: 'Noto Sans Arabic' loaded via Google Fonts CDN

**UI Component System**
- shadcn/ui components with Radix UI primitives for accessibility
- Material Design approach with custom Tailwind configuration
- Component library configured via `components.json` with "new-york" style
- RTL-optimized spacing and layout using Tailwind utilities

**State Management**
- React hooks for local component state
- TanStack Query (React Query) for server state management
- Custom WebSocket hook (`use-websocket.ts`) for real-time game state synchronization

**Routing & Pages**
- Single-page application with conditional rendering based on game state
- Three main views: HomePage (lobby creation/join), LobbyPage (waiting room), GamePage (active gameplay)
- No traditional router - navigation handled by WebSocket state changes

**Real-time Communication**
- WebSocket connection at `/ws` endpoint
- Custom protocol defined in `@shared/schema.ts` for type-safe messages
- Automatic reconnection handling with visual connection status indicators

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and middleware
- Node.js HTTP server upgraded to support WebSocket connections
- Development mode uses Vite middleware for HMR
- Production mode serves pre-built static assets

**WebSocket Server**
- ws library for WebSocket implementation
- Path: `/ws` for WebSocket connections
- Client tracking with room-based message broadcasting
- Custom message protocol with typed request/response patterns

**Game State Management**
- In-memory storage implementation (`MemStorage` class)
- Room-based game sessions identified by 6-character alphanumeric codes
- Player management with connection status tracking
- Phase-based game flow: lobby → discussion → voting → reveal

**Game Logic**
- Timer management for each game phase using Node.js timeouts
- Random word selection from multiple themed word packs
- Random "odd one out" player assignment (1 out of N players)
- Vote tallying and majority-based game resolution

**Session Management**
- Stateless WebSocket connections without traditional HTTP sessions
- Room codes serve as session identifiers
- Player IDs generated using crypto.randomUUID()

### Data Storage

**Storage Strategy**
- In-memory storage with no persistent database (games are ephemeral)
- Data structures defined in `@shared/schema.ts` using Zod schemas
- Room state includes: code, host, players, phase, messages, votes, current word

**Word Pack System**
- JSON files in `/public/wordpacks/` directory
- Five themed packs: animals, food, countries, sports, professions
- Each pack contains word pairs (normal word vs. odd word)
- Loaded synchronously at server startup

**Database Configuration**
- Drizzle ORM configured for PostgreSQL (future persistence capability)
- Connection via `@neondatabase/serverless` driver
- Schema defined in `shared/schema.ts` but not actively used
- Migration files output to `./migrations` directory

### External Dependencies

**Core Libraries**
- `express` - Web server framework
- `ws` - WebSocket server implementation
- `react` and `react-dom` - Frontend framework
- `@tanstack/react-query` - Server state management
- `drizzle-orm` and `@neondatabase/serverless` - Database ORM (configured but unused)

**UI Component Libraries**
- `@radix-ui/*` - Headless accessible UI primitives (25+ components)
- `tailwindcss` - Utility-first CSS framework
- `class-variance-authority` and `clsx` - Component variant management
- `lucide-react` - Icon library

**Development Tools**
- `vite` - Build tool and dev server
- `typescript` - Type safety
- `tsx` - TypeScript execution for development
- `esbuild` - Production bundler for server code

**Replit Integration**
- `@replit/vite-plugin-runtime-error-modal` - Enhanced error display
- `@replit/vite-plugin-cartographer` - Development tooling
- `@replit/vite-plugin-dev-banner` - Development indicators

**Additional Utilities**
- `nanoid` - Unique ID generation
- `date-fns` - Date manipulation
- `react-hook-form` and `@hookform/resolvers` - Form validation
- `zod` - Schema validation and type inference
- `cmdk` - Command menu component

**Font Delivery**
- Google Fonts CDN for 'Noto Sans Arabic' with weights 300-800

**Build Pipeline**
- Development: Vite dev server with HMR proxied through Express
- Production: Static build output served from `dist/public/`
- Server bundle: Single ESM file at `dist/index.js`