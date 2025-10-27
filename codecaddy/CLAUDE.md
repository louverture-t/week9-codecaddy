# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CodeCaddy is a personal book collection manager built with React 19, TypeScript, and Vite. Users can search for books via Google Books API, manage their collection, and track reading status with localStorage persistence.

## Build/Development Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build for production: `npm run build` (runs TypeScript compiler then Vite build)
- Run linting: `npm run lint`
- Preview production build: `npm run preview`

## Tech Stack

- **React 19** with TypeScript
- **Vite 7** for build tooling and dev server with HMR
- **React Router DOM v6** for client-side routing
- **Tailwind CSS 4** for styling (PostCSS configured)
- **Google Books API** integration with mock data fallback

## Architecture & Key Patterns

### Planned Application Structure (from PRD)

The application will follow this architecture once implemented:

**State Management:**
- Context API with `useReducer` for global state
- `BookCollectionContext` managing books, search results, and filtered arrays
- localStorage integration for persistence

**Routing Structure:**
- `/` - Home page with dashboard and statistics
- `/search` - Book search interface
- `/collection` - Collection management with status filters
- `/book/:id` - Individual book details page

**Component Organization:**
```
src/
├── contexts/
│   └── BookCollectionContext.tsx    # Global state with useReducer
├── pages/
│   ├── HomePage.tsx                 # Dashboard with stats
│   ├── SearchPage.tsx               # Search interface
│   ├── CollectionPage.tsx           # Collection with filters
│   └── BookDetailsPage.tsx          # Book details
├── components/
│   ├── Navigation.tsx               # Router Links navigation
│   └── BookCard.tsx                 # Reusable book display
└── services/
    └── googleBooksApi.ts            # API service class
```

### TypeScript Interfaces

**Core Types:**
```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  publishedDate: string;
  description: string;
  thumbnail: string;
  status: BookStatus;
}

type BookStatus = 'want-to-read' | 'currently-reading' | 'have-read';
```

**Context Pattern:**
```typescript
interface BookCollectionState {
  books: Book[];
  searchResults: Book[];
  isLoading: boolean;
  error: string | null;
  // Filtered arrays computed in reducer
  currentlyReading: Book[];
  wantToRead: Book[];
  haveRead: Book[];
}

interface BookCollectionContextType {
  state: BookCollectionState;
  addBook: (book: Book) => void;
  removeBook: (bookId: string) => void;
  updateBookStatus: (bookId: string, status: BookStatus) => void;
  searchBooks: (query: string) => Promise<void>;
  clearSearch: () => void;
  getBooksByStatus: (status: BookStatus) => Book[];
}
```

### Google Books API Integration

**Environment Setup:**
Create `.env.local` file:
```bash
VITE_GOOGLE_BOOKS_API_KEY=your_api_key_here
VITE_GOOGLE_BOOKS_BASE_URL=https://www.googleapis.com/books/v1
```

**Service Pattern:**
- Singleton `GoogleBooksApiService` class
- Error handling with typed `GoogleBooksError`
- Query builder for advanced search filters (author, subject, publisher, ISBN)
- Mock data fallback when API key not configured

### State Persistence Strategy

**localStorage Pattern:**
- Save collection on state changes (skip initial mount)
- Load initial state from localStorage on app start
- Store only `books` array, recompute filtered arrays
- Key: `codecaddy-collection` (or similar)

### Design System

**Color Scheme:**
- Primary: Blue (#3b82f6)
- Accent: Orange (#f97316)
- Background: Light gray (#f8fafc)
- Status-based color coding for book states

## Development Notes

### TypeScript Configuration
- Uses project references with `tsconfig.app.json` and `tsconfig.node.json`
- Strict type checking enabled
- React 19 types configured

### ESLint Setup
- ESLint 9 with flat config (`eslint.config.js`)
- React Hooks plugin for rules enforcement
- React Refresh plugin for HMR compatibility
- Can be extended with type-aware lint rules (see README.md)

### Vite Configuration
- Uses `@vitejs/plugin-react` for Fast Refresh with Babel
- HMR enabled for rapid development
- TypeScript compilation happens before Vite build

### React Router Usage
- `BrowserRouter` wraps application
- `useParams` for dynamic route parameters (`/book/:id`)
- `useNavigate` for programmatic navigation
- `Link` components for client-side navigation

## Important Implementation Details

### Context Provider Pattern
- Wrap `App` in `BookCollectionProvider`
- Use `useCallback` for memoized action functions
- Compute filtered arrays in reducer, not in components

### Book Card Component
- Should be reusable across search results, collection, and details pages
- Handle both "Add to Collection" and "Remove" states
- Show status dropdown only in collection view

### Navigation Component
- Use `NavLink` for active state styling
- Responsive design with mobile hamburger menu

### localStorage Best Practices
- Use `useEffect` to sync state to localStorage
- Handle JSON parse errors gracefully
- Don't store computed/derived state

## Current State

The repository currently contains only the Vite + React + TypeScript template. Implementation should follow the PRD architecture detailed above.
