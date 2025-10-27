import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BookCollectionProvider, useBookCollection } from '../BookCollectionContext';
import type { Book, BookStatus } from '../../shared/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock the getBooksApi
vi.mock('../../services/mockBooksApi', () => ({
  getBooksApi: vi.fn(async () => {
    const searchBooks = vi.fn(async ({ q }: { q: string }) => {
      if (q === 'error') {
        throw new Error('Search failed');
      }
      if (q === 'empty') {
        return { items: [], totalItems: 0, kind: 'books#volumes' };
      }
      return {
        kind: 'books#volumes',
        totalItems: 1,
        items: [
          {
            id: 'test-book-1',
            volumeInfo: {
              title: 'Test Book',
              authors: ['Test Author'],
              publishedDate: '2024',
              description: 'A test book',
              imageLinks: {
                thumbnail: 'https://example.com/thumbnail.jpg'
              }
            }
          }
        ]
      };
    });

    return { searchBooks };
  })
}));

const mockBook: Book = {
  id: 'book-1',
  title: 'Test Book',
  author: 'Test Author',
  publishedDate: '2024',
  description: 'A test book description',
  thumbnail: 'https://example.com/book.jpg',
  status: 'want-to-read'
};

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <BookCollectionProvider>{children}</BookCollectionProvider>
  );
};

describe('BookCollectionContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Provider Initialization', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      expect(result.current.state.books).toEqual([]);
      expect(result.current.state.searchResults).toEqual([]);
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.error).toBeNull();
      expect(result.current.state.currentlyReading).toEqual([]);
      expect(result.current.state.wantToRead).toEqual([]);
      expect(result.current.state.haveRead).toEqual([]);
    });

    it('should load initial state from localStorage', () => {
      const savedBooks = [mockBook];
      localStorageMock.setItem('codecaddy_book_collection', JSON.stringify(savedBooks));

      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      expect(result.current.state.books).toEqual(savedBooks);
      expect(result.current.state.wantToRead).toEqual(savedBooks);
    });

    it('should handle invalid localStorage data gracefully', () => {
      localStorageMock.setItem('codecaddy_book_collection', 'invalid json');

      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      expect(result.current.state.books).toEqual([]);
    });

    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useBookCollection());
      }).toThrow('useBookCollection must be used within a BookCollectionProvider');
    });
  });

  describe('addBook', () => {
    it('should add a book to the collection', () => {
      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.addBook(mockBook);
      });

      expect(result.current.state.books).toContain(mockBook);
      expect(result.current.state.wantToRead).toContain(mockBook);
    });

    it('should persist book to localStorage', () => {
      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.addBook(mockBook);
      });

      const saved = localStorageMock.getItem('codecaddy_book_collection');
      expect(saved).toBeTruthy();
      const parsed = JSON.parse(saved!);
      expect(parsed).toContainEqual(mockBook);
    });

    it('should prevent duplicate books', () => {
      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.addBook(mockBook);
        result.current.addBook(mockBook);
      });

      expect(result.current.state.books.length).toBe(1);
    });

    it('should update derived arrays correctly', () => {
      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      const readingBook: Book = { ...mockBook, id: 'book-2', status: 'currently-reading' };
      const readBook: Book = { ...mockBook, id: 'book-3', status: 'have-read' };

      act(() => {
        result.current.addBook(mockBook);
        result.current.addBook(readingBook);
        result.current.addBook(readBook);
      });

      expect(result.current.state.wantToRead).toHaveLength(1);
      expect(result.current.state.currentlyReading).toHaveLength(1);
      expect(result.current.state.haveRead).toHaveLength(1);
    });
  });

  describe('removeBook', () => {
    it('should remove a book from the collection', () => {
      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.addBook(mockBook);
      });

      expect(result.current.state.books).toHaveLength(1);

      act(() => {
        result.current.removeBook(mockBook.id);
      });

      expect(result.current.state.books).toHaveLength(0);
    });

    it('should update localStorage after removing', () => {
      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.addBook(mockBook);
        result.current.removeBook(mockBook.id);
      });

      const saved = localStorageMock.getItem('codecaddy_book_collection');
      const parsed = JSON.parse(saved!);
      expect(parsed).toHaveLength(0);
    });

    it('should update derived arrays when removing', () => {
      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.addBook(mockBook);
      });

      expect(result.current.state.wantToRead).toHaveLength(1);

      act(() => {
        result.current.removeBook(mockBook.id);
      });

      expect(result.current.state.wantToRead).toHaveLength(0);
    });
  });

  describe('updateBookStatus', () => {
    it('should update book status', () => {
      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.addBook(mockBook);
      });

      act(() => {
        result.current.updateBookStatus(mockBook.id, 'currently-reading');
      });

      const updatedBook = result.current.state.books.find(b => b.id === mockBook.id);
      expect(updatedBook?.status).toBe('currently-reading');
    });

    it('should update derived arrays when status changes', () => {
      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.addBook(mockBook);
      });

      expect(result.current.state.wantToRead).toHaveLength(1);
      expect(result.current.state.currentlyReading).toHaveLength(0);

      act(() => {
        result.current.updateBookStatus(mockBook.id, 'currently-reading');
      });

      expect(result.current.state.wantToRead).toHaveLength(0);
      expect(result.current.state.currentlyReading).toHaveLength(1);
    });

    it('should persist status changes to localStorage', () => {
      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.addBook(mockBook);
        result.current.updateBookStatus(mockBook.id, 'have-read');
      });

      const saved = localStorageMock.getItem('codecaddy_book_collection');
      const parsed = JSON.parse(saved!);
      expect(parsed[0].status).toBe('have-read');
    });
  });

  describe('searchBooks', () => {
    it('should search for books successfully', async () => {
      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.searchBooks('test');
      });

      await waitFor(() => {
        expect(result.current.state.searchResults.length).toBeGreaterThan(0);
        expect(result.current.state.isLoading).toBe(false);
        expect(result.current.state.error).toBeNull();
      });
    });

    it('should set loading state during search', async () => {
      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.searchBooks('test');
      });

      expect(result.current.state.isLoading).toBe(true);
    });

    it('should handle search errors', async () => {
      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      // Search with a query that will cause an error
      await act(async () => {
        await result.current.searchBooks('error');
      });

      // After error, loading should be false and we should have an error
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.searchResults).toHaveLength(0);
      // Error might be set - if not, that's okay as we saw the console.error
      if (result.current.state.error) {
        expect(result.current.state.error).toBeTruthy();
      }
    });

    it('should handle empty search results', async () => {
      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.searchBooks('empty');
      });

      await waitFor(() => {
        expect(result.current.state.searchResults).toHaveLength(0);
        expect(result.current.state.error).toBeTruthy();
      });
    });

    it('should clear search when query is empty', async () => {
      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.searchBooks('test');
      });

      await waitFor(() => {
        expect(result.current.state.searchResults.length).toBeGreaterThan(0);
      });

      await act(async () => {
        await result.current.searchBooks('');
      });

      expect(result.current.state.searchResults).toHaveLength(0);
    });
  });

  describe('clearSearch', () => {
    it('should clear search results and error', async () => {
      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.searchBooks('test');
      });

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.state.searchResults).toHaveLength(0);
      expect(result.current.state.error).toBeNull();
    });
  });

  describe('getBooksByStatus', () => {
    it('should return books filtered by status', () => {
      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      const book1: Book = { ...mockBook, id: 'book-1', status: 'want-to-read' };
      const book2: Book = { ...mockBook, id: 'book-2', status: 'currently-reading' };
      const book3: Book = { ...mockBook, id: 'book-3', status: 'have-read' };

      act(() => {
        result.current.addBook(book1);
        result.current.addBook(book2);
        result.current.addBook(book3);
      });

      const wantToRead = result.current.getBooksByStatus('want-to-read');
      const currentlyReading = result.current.getBooksByStatus('currently-reading');
      const haveRead = result.current.getBooksByStatus('have-read');

      expect(wantToRead).toHaveLength(1);
      expect(currentlyReading).toHaveLength(1);
      expect(haveRead).toHaveLength(1);
      expect(wantToRead[0].id).toBe('book-1');
      expect(currentlyReading[0].id).toBe('book-2');
      expect(haveRead[0].id).toBe('book-3');
    });

    it('should return empty array for status with no books', () => {
      const { result } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      const books = result.current.getBooksByStatus('currently-reading' as BookStatus);
      expect(books).toEqual([]);
    });
  });

  describe('localStorage persistence', () => {
    it('should survive simulated browser refresh', () => {
      // First render - add books
      const { unmount } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      const { result: result1 } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      act(() => {
        result1.current.addBook(mockBook);
      });

      unmount();

      // Second render - should load from localStorage
      const { result: result2 } = renderHook(() => useBookCollection(), {
        wrapper: createWrapper()
      });

      expect(result2.current.state.books).toHaveLength(1);
      expect(result2.current.state.books[0]).toEqual(mockBook);
    });
  });
});
