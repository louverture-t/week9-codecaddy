# BookCollectionContext

React Context implementation for global state management in CodeCaddy.

## Overview

The `BookCollectionContext` provides centralized state management for:
- Book collection (user's library)
- Search results
- Loading and error states
- Derived arrays for quick access by status

## Features

### ✅ useReducer Pattern
- Predictable state updates through reducer actions
- Clean separation of state logic
- Type-safe action dispatch

### ✅ localStorage Persistence
- Automatic save to localStorage when books change
- Loads from localStorage on initialization
- Handles quota exceeded errors gracefully
- Validates saved data before loading

### ✅ Derived Arrays
- `currentlyReading`: Books with status 'currently-reading'
- `wantToRead`: Books with status 'want-to-read'
- `haveRead`: Books with status 'have-read'
- Automatically updated on every state change

### ✅ Optimized Performance
- All action creators wrapped in `useCallback`
- Prevents unnecessary re-renders
- Efficient localStorage operations

## Usage

### 1. Wrap your app with the provider

```tsx
import { BookCollectionProvider } from './contexts/BookCollectionContext';

function App() {
  return (
    <BookCollectionProvider>
      {/* Your app components */}
    </BookCollectionProvider>
  );
}
```

### 2. Use the hook in components

```tsx
import { useBookCollection } from '../contexts/BookCollectionContext';

function MyComponent() {
  const {
    state,
    addBook,
    removeBook,
    updateBookStatus,
    searchBooks,
    clearSearch,
    getBooksByStatus
  } = useBookCollection();

  // Access state
  const { books, searchResults, isLoading, error } = state;

  // Use derived arrays for fast filtering
  const reading = state.currentlyReading;
  const wantToRead = state.wantToRead;
  const read = state.haveRead;

  // Perform actions
  const handleSearch = async (query: string) => {
    await searchBooks(query);
  };

  const handleAddBook = (book: Book) => {
    addBook(book);
  };

  const handleStatusChange = (bookId: string, status: BookStatus) => {
    updateBookStatus(bookId, status);
  };

  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
}
```

## API Reference

### State Structure

```typescript
interface BookCollectionState {
  books: Book[];                    // All books in the collection
  searchResults: Book[];            // Current search results
  isLoading: boolean;               // Loading state for async operations
  error: string | null;             // Error message if any
  currentlyReading: Book[];         // Derived: books being read
  wantToRead: Book[];               // Derived: books to read
  haveRead: Book[];                 // Derived: books already read
}
```

### Action Creators

- **`addBook(book: Book)`**: Add a book to the collection (prevents duplicates)
- **`removeBook(bookId: string)`**: Remove a book from the collection
- **`updateBookStatus(bookId: string, status: BookStatus)`**: Change a book's status
- **`searchBooks(query: string)`**: Search for books using the API
- **`clearSearch()`**: Clear search results and errors
- **`getBooksByStatus(status: BookStatus)`**: Get books filtered by status

## localStorage

### Storage Key
`codecaddy_book_collection`

### Stored Data
Only the `books` array is persisted. Derived arrays are recalculated on load.

### Error Handling
- Invalid JSON: Logs error and returns empty state
- Quota exceeded: Displays error message to user
- Array validation: Ensures loaded data is an array

## Testing

Comprehensive test suite covering:
- ✅ Provider initialization
- ✅ localStorage persistence and recovery
- ✅ Book operations (add, remove, update)
- ✅ Derived array updates
- ✅ Search functionality
- ✅ Error handling
- ✅ Edge cases

Run tests:
```bash
npm test -- src/contexts/__tests__/BookCollectionContext.test.tsx
```

## Implementation Details

### Reducer Actions
- `ADD_BOOK`: Add or replace a book
- `REMOVE_BOOK`: Remove by ID
- `UPDATE_BOOK_STATUS`: Change status
- `SET_SEARCH_RESULTS`: Update search results
- `SET_LOADING`: Toggle loading state
- `SET_ERROR`: Set error message
- `CLEAR_SEARCH`: Clear search data
- `LOAD_FROM_STORAGE`: Initialize from localStorage

### Performance Optimizations
1. **useCallback**: All action creators memoized
2. **Derived Arrays**: Computed once per state change
3. **Duplicate Prevention**: Filters existing books before adding
4. **Lazy Initialization**: useState lazy initializer for localStorage

### Security
- No sensitive data stored in localStorage
- XSS protection through React's built-in escaping
- Type validation on all operations

## Future Enhancements

Potential improvements:
- [ ] IndexedDB support for larger collections
- [ ] Sync across tabs/windows
- [ ] Undo/redo functionality
- [ ] Search history
- [ ] Pagination for large collections
- [ ] Import/export functionality
