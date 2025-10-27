# Google Books API Service

## Overview

This directory contains the Google Books API integration for CodeCaddy, including:

- **googleBooksApi.ts**: Real API service using Google Books API
- **mockBooksApi.ts**: Mock API service for testing and fallback
- **getBooksApi()**: Helper function to automatically select the appropriate API

## Setup

1. Copy `.env.local.example` to `.env.local`
2. Add your Google Books API key:
   ```
   VITE_GOOGLE_BOOKS_API_KEY=your_api_key_here
   ```

## Usage

### Basic Search

```typescript
import { googleBooksApi } from './services/googleBooksApi';

// Search for books
const results = await googleBooksApi.searchBooks({
  q: 'javascript programming',
  maxResults: 10,
  startIndex: 0
});

console.log(results.items); // Array of GoogleBookItem
```

### Get Book by ID

```typescript
import { googleBooksApi } from './services/googleBooksApi';

// Get a specific book
const book = await googleBooksApi.getBookById('book-id-here');
console.log(book.volumeInfo.title);
```

### Using with Automatic Fallback

```typescript
import { getBooksApi } from './services/mockBooksApi';

// Automatically uses real API if key exists, otherwise mock API
const api = await getBooksApi();
const results = await api.searchBooks({ q: 'react' });
```

### Mapping to Book Type

```typescript
import { mapGoogleBookToBook } from '../utils/bookMappers';
import type { GoogleBookItem } from '../shared/types';

// Convert Google Books API response to our Book interface
const googleBook: GoogleBookItem = results.items[0];
const book = mapGoogleBookToBook(googleBook, 'want-to-read');

console.log(book.title); // string
console.log(book.author); // string (comma-separated if multiple)
console.log(book.status); // BookStatus
```

## Mock Data

If no API key is configured, the system automatically falls back to mock data with 5 sample books:

- React - The Complete Guide
- JavaScript: The Good Parts
- Clean Code
- The Pragmatic Programmer
- You Don't Know JS

Mock data includes:
- 500ms simulated delay for search
- 300ms simulated delay for getBookById
- Query filtering by title and author

## Error Handling

Both services throw errors for:
- Missing API key (real API only)
- Failed network requests
- Invalid API responses
- Non-existent book IDs

Always wrap API calls in try-catch blocks:

```typescript
try {
  const results = await googleBooksApi.searchBooks({ q: 'javascript' });
  // Handle results
} catch (error) {
  console.error('Failed to search books:', error);
  // Handle error
}
```

## Testing

Run tests with:
```bash
npm test -- src/services/__tests__
npm test -- src/utils/__tests__
```

Test coverage includes:
- API request construction
- Error handling
- Mock data filtering
- Book mapping
- Fallback behavior
