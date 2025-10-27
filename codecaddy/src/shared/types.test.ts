import { describe, it, expect } from 'vitest';
import type {
  Book,
  BookStatus,
  BookCollectionState,
  BookCollectionContextType,
  SearchParams,
  GoogleBooksResponse,
  GoogleBookItem,
  GoogleBooksError
} from './types';

describe('TypeScript Interfaces', () => {
  describe('Book Interface', () => {
    it('should accept valid book object', () => {
      const validBook: Book = {
        id: '1',
        title: 'Test Book',
        author: 'Test Author',
        publishedDate: '2024-01-01',
        description: 'Test description',
        thumbnail: 'https://example.com/thumbnail.jpg',
        status: 'want-to-read'
      };

      expect(validBook).toBeDefined();
      expect(validBook.id).toBe('1');
      expect(validBook.status).toBe('want-to-read');
    });

    it('should enforce BookStatus type', () => {
      const statuses: BookStatus[] = ['want-to-read', 'currently-reading', 'have-read'];
      expect(statuses).toHaveLength(3);
    });
  });

  describe('BookCollectionState Interface', () => {
    it('should accept valid state object', () => {
      const validState: BookCollectionState = {
        books: [],
        searchResults: [],
        isLoading: false,
        error: null,
        currentlyReading: [],
        wantToRead: [],
        haveRead: []
      };

      expect(validState).toBeDefined();
      expect(validState.books).toEqual([]);
      expect(validState.isLoading).toBe(false);
    });

    it('should handle error state', () => {
      const errorState: BookCollectionState = {
        books: [],
        searchResults: [],
        isLoading: false,
        error: 'Test error',
        currentlyReading: [],
        wantToRead: [],
        haveRead: []
      };

      expect(errorState.error).toBe('Test error');
    });
  });

  describe('SearchParams Interface', () => {
    it('should accept valid search params', () => {
      const validParams: SearchParams = {
        q: 'test query',
        startIndex: 0,
        maxResults: 10,
        printType: 'books',
        orderBy: 'relevance'
      };

      expect(validParams).toBeDefined();
      expect(validParams.q).toBe('test query');
    });

    it('should accept minimal search params', () => {
      const minimalParams: SearchParams = {
        q: 'test'
      };

      expect(minimalParams).toBeDefined();
      expect(minimalParams.q).toBe('test');
    });
  });

  describe('GoogleBooksResponse Interface', () => {
    it('should accept valid Google Books API response', () => {
      const validResponse: GoogleBooksResponse = {
        kind: 'books#volumes',
        totalItems: 1,
        items: [{
          id: 'test-id',
          volumeInfo: {
            title: 'Test Book',
            authors: ['Test Author'],
            publishedDate: '2024-01-01',
            description: 'Test description',
            imageLinks: {
              thumbnail: 'https://example.com/thumbnail.jpg'
            }
          }
        }]
      };

      expect(validResponse).toBeDefined();
      expect(validResponse.totalItems).toBe(1);
      expect(validResponse.items).toHaveLength(1);
    });
  });

  describe('GoogleBookItem Interface', () => {
    it('should accept valid book item', () => {
      const validItem: GoogleBookItem = {
        id: 'test-id',
        volumeInfo: {
          title: 'Test Book',
          authors: ['Author 1', 'Author 2'],
          publishedDate: '2024-01-01',
          description: 'Test description',
          imageLinks: {
            thumbnail: 'https://example.com/thumb.jpg',
            smallThumbnail: 'https://example.com/small.jpg'
          },
          categories: ['Fiction'],
          publisher: 'Test Publisher',
          industryIdentifiers: [
            { type: 'ISBN_13', identifier: '1234567890123' }
          ]
        }
      };

      expect(validItem).toBeDefined();
      expect(validItem.volumeInfo.authors).toHaveLength(2);
    });

    it('should accept minimal book item', () => {
      const minimalItem: GoogleBookItem = {
        id: 'test-id',
        volumeInfo: {
          title: 'Test Book'
        }
      };

      expect(minimalItem).toBeDefined();
      expect(minimalItem.volumeInfo.title).toBe('Test Book');
    });
  });

  describe('GoogleBooksError Interface', () => {
    it('should accept valid error response', () => {
      const validError: GoogleBooksError = {
        error: {
          code: 400,
          message: 'Bad Request',
          errors: [
            {
              message: 'Invalid query',
              domain: 'global',
              reason: 'invalidParameter'
            }
          ]
        }
      };

      expect(validError).toBeDefined();
      expect(validError.error?.code).toBe(400);
    });

    it('should accept empty error object', () => {
      const emptyError: GoogleBooksError = {};
      expect(emptyError).toBeDefined();
    });
  });

  describe('BookCollectionContextType Interface', () => {
    it('should define context type with all required methods', () => {
      const mockContext: BookCollectionContextType = {
        state: {
          books: [],
          searchResults: [],
          isLoading: false,
          error: null,
          currentlyReading: [],
          wantToRead: [],
          haveRead: []
        },
        addBook: () => {},
        removeBook: () => {},
        updateBookStatus: () => {},
        searchBooks: async () => {},
        clearSearch: () => {},
        getBooksByStatus: () => []
      };

      expect(mockContext).toBeDefined();
      expect(typeof mockContext.addBook).toBe('function');
      expect(typeof mockContext.searchBooks).toBe('function');
    });
  });
});
