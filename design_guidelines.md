# Design Guidelines: "مين برا السالفة" Game

## Design Approach
**Selected System:** Material Design with RTL-first Arabic optimization
**Rationale:** Game requires clear visual hierarchy, instant feedback, and straightforward interaction patterns. Material Design provides excellent RTL support and proven components for interactive applications.

## Typography (Arabic-First)
- **Primary Font:** 'Noto Sans Arabic' via Google Fonts CDN
- **Hierarchy:**
  - Game Title: text-4xl font-bold (الشاشة الرئيسية)
  - Section Headers: text-2xl font-semibold (أسماء المراحل)
  - Player Names: text-lg font-medium (كروت اللاعبين)
  - Body/Chat: text-base font-normal (الشات والتعليمات)
  - Timer/Stats: text-3xl font-bold tabular-nums (العداد والإحصائيات)
- **Direction:** Apply `dir="rtl"` to html element, ensure all text alignment is text-right by default

## Layout System
**Spacing Units:** Tailwind units of 3, 4, 6, 8, 12
- Component gaps: gap-4
- Section padding: p-6, p-8
- Card spacing: p-4
- Button padding: px-6 py-3

**Container Strategy:**
- Game container: max-w-6xl mx-auto
- Lobby/Waiting: max-w-2xl mx-auto
- Player grid: Grid system for 4-8 players
- Chat sidebar: Fixed width 320px on desktop, full-width drawer on mobile

## Component Library

### Core Game Components

**1. Player Cards (Grid Layout)**
- Grid: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`
- Card structure: Rounded-lg elevation with padding p-4
- Elements per card: Avatar circle (size-16), name, status indicator, vote badge (when applicable)
- Host badge: Absolute positioned top-right corner
- Active states: Elevated shadow, subtle scale transform

**2. Room Code Display**
- Large centered display: text-6xl tracking-widest font-mono
- Copy button integrated beside code
- Container: Bordered card with p-8

**3. Game Timer**
- Circular progress indicator (SVG-based)
- Size: w-32 h-32 centered above main content
- Time remaining: Large numbers inside circle
- Phase label below timer

**4. Chat Interface**
- Fixed height: h-96 with overflow-y-auto
- Message bubbles: Self (bg treatment) vs Others (alternate treatment)
- Rounded-2xl for message bubbles, p-3
- Input: Sticky bottom with rounded-full input field, send button integrated

**5. Voting Interface**
- Player selection: Same grid as player cards but interactive
- Selected state: Ring-4 border treatment
- Confirm button: Full-width below grid
- Disabled state for already-voted players

**6. Results/Reveal Screen**
- Hero-style reveal: Large centered card
- "الغريب كان..." with dramatic spacing
- Revealed player highlighted with scale-110 transform
- Voting breakdown: Simple list showing who voted for whom
- Next round button: Prominent CTA

### Navigation & Controls

**Primary Actions:**
- Full-width on mobile: w-full
- Auto-width on desktop: px-8
- Height: h-12
- Rounded: rounded-lg
- Icon + text combinations where appropriate

**Secondary Actions:**
- Outlined style with border-2
- Same sizing as primary

### Form Inputs (Lobby/Join)
- Input fields: h-12 rounded-lg px-4
- Labels: text-sm font-medium mb-2
- Error states: Border treatment + helper text below
- Full-width on mobile, max-w-md on desktop

## Page Layouts

**Lobby (Pre-game):**
- Centered layout: Vertical stack with gap-8
- Room code prominent at top
- Waiting players: Grid of player cards (max-w-2xl)
- Start game button: Only visible to host, sticky bottom on mobile

**Game Phase (Discussion/Voting):**
- Two-column on desktop: Main area (2/3) + Chat sidebar (1/3)
- Mobile: Tabbed interface switching between game view and chat
- Timer: Fixed at top of main area
- Your word display: Centered card below timer with large text
- Player grid: Below word card

**Results Phase:**
- Single column centered
- Reveal animation area: Full attention on outcome
- Stats summary: Simple grid showing round statistics
- Action buttons: Continue/New Game stacked with gap-4

## Animations (Minimal)
- Phase transitions: Fade in/out (300ms)
- Timer pulse: Subtle scale when < 10 seconds
- Vote submission: Brief checkmark animation
- Card selection: Immediate ring appearance (no transition)
- **No scroll animations, no complex interactions**

## Responsive Breakpoints
- Mobile-first approach
- md: 768px (Switch to 2-column chat layout)
- lg: 1024px (Expand player grid to 4 columns)
- Chat: Slide-over drawer on mobile, fixed sidebar on md+

## RTL-Specific Considerations
- All icons flip direction (arrows, etc.)
- Chat messages align right (sender) vs left (others)
- Grid layouts maintain visual balance in RTL
- Timer rotation: Clockwise remains clockwise in RTL
- Flexbox: Use justify-end instead of justify-start for right alignment