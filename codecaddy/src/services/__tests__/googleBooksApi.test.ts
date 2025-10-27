import { describe, it, expect, vi, beforeEach } from 'vitest';
import { googleBooksApi } from '../googleBooksApi';
import type { GoogleBooksResponse } from '../../shared/types';

// Mock the fetch function
global.fetch = vi.fn();

// Mock the import.meta.env
vi.mock('import.meta', () => ({
  env: {
    VITE_GOOGLE_BOOKS_API_KEY: 'test-api-key'
  }
}));

describe('googleBooksApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchBooks', () => {
    it('should successfully search for books', async () => {
      const mockResponse: GoogleBooksResponse = {
        kind: 'books#volumes',
        totalItems: 1,
        items: [
          {
            id: 'test-id',
            volumeInfo: {
              title: 'Test Book',
              authors: ['Test Author'],
              publishedDate: '2021',
              description: 'Test description',
              imageLinks: {
                thumbnail: 'https://example.com/thumbnail.jpg'
              }
            }
          }
        ]
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await googleBooksApi.searchBooks({
        q: 'test',
        maxResults: 10,
        startIndex: 0
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('q=test')
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('maxResults=10')
      );
    });

    it('should throw error when API request fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(
        googleBooksApi.searchBooks({ q: 'test' })
      ).rejects.toThrow('API request failed with status 404');
    });

    it('should throw error when network request fails', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        googleBooksApi.searchBooks({ q: 'test' })
      ).rejects.toThrow('Network error');
    });
  });

  describe('getBookById', () => {
    it('should successfully get book by ID', async () => {
      const mockBook = {
        id: 'test-id',
        volumeInfo: {
          title: 'Test Book',
          authors: ['Test Author'],
          publishedDate: '2021',
          description: 'Test description'
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBook
      });

      const result = await googleBooksApi.getBookById('test-id');

      expect(result).toEqual(mockBook);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('test-id')
      );
    });

    it('should throw error when book is not found', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(googleBooksApi.getBookById('invalid-id')).rejects.toThrow(
        'API request failed with status 404'
      );
    });
  });
});
