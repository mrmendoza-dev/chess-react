# React Chess Game

A modern chess game implementation built with React, TypeScript, and TailwindCSS. Features a responsive design with dark/light mode support.

## Current Features

### Game Mechanics
- Full chess board with proper piece movement validation
- Turn-based gameplay (white/black alternating)
- Move history tracking with standard chess notation
- Valid move checking for all pieces:
  - Pawn: Basic moves, captures, initial two-square advance
  - Rook: Horizontal and vertical movements
  - Knight: L-shaped movements
  - Bishop: Diagonal movements
  - Queen: Combined rook and bishop movements
  - King: Single square movements

### UI/UX
- Responsive design that works on mobile and desktop
- Dark/light mode support using Tailwind
- Automatic board sizing based on viewport
- Visual feedback for selected pieces
- Game status display
- Move history panel
- Reset game functionality

### Technical Features
- React Context for state management
- TypeScript for type safety
- FontAwesome chess piece icons
- Modular component architecture

## Planned Features (TODO)

### Short Term
- [ ] Castling implementation
- [ ] En passant capture for pawns
- [ ] Pawn promotion
- [ ] Check detection
- [ ] Checkmate detection
- [ ] Stalemate detection
- [ ] Move validation considering check
- [ ] Highlight valid moves for selected piece
- [ ] Add sound effects for moves
- [ ] Add move animations

### Medium Term
- [ ] Save game state to localStorage
- [ ] Undo/redo moves
- [ ] Export game in PGN format
- [ ] Timer/clock support
- [ ] Move suggestion hints
- [ ] Board position analysis
- [ ] Keyboard controls support
- [ ] Accessibility improvements
- [ ] Move confirmation dialog
- [ ] Captured pieces display

### Long Term
- [ ] Multiplayer support
- [ ] AI opponent integration
- [ ] Opening book/database
- [ ] Game analysis tools
- [ ] Save games to database
- [ ] User accounts
- [ ] Leaderboard system
- [ ] Tournament support
- [ ] Chat system
- [ ] Spectator mode

## Tech Stack

- React
- TypeScript
- TailwindCSS
- Vite
- FontAwesome
- Shadcn/UI Components

## Project Structure

```
src/
├── components/
│   └── Chess.tsx       # Main chess board component
├── contexts/
│   └── ChessContext.ts # Game state management
├── utils/
│   └── chess.ts        # Chess logic and move validation
└── types/
    └── chess.ts        # TypeScript definitions
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Build for production: `npm run build`

## Contributing

Contributions are welcome! Please check the TODO list for features that need implementation.

## License

MIT License

## Acknowledgments

- Chess piece icons from FontAwesome
- UI components from Shadcn/UI
- Styling system from TailwindCSS
