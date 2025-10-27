import { describe, it, expect } from 'vitest';
import { mapGoogleBookToBook } from '../bookMappers';
import type { GoogleBookItem } from '../../shared/types';

describe('bookMappers', () => {
  describe('mapGoogleBookToBook', () => {
    it('should map a complete Google Book item to Book', () => {
      const googleBook: GoogleBookItem = {
        id: 'test-id',
        volumeInfo: {
          title: 'Test Book',
          authors: ['Author One', 'Author Two'],
          publishedDate: '2021-01-01',
          description: 'This is a test book description',
          imageLinks: {
            thumbnail: 'https://example.com/thumbnail.jpg'
          }
        }
      };

      const result = mapGoogleBookToBook(googleBook);

      expect(result.id).toBe('test-id');
      expect(result.title).toBe('Test Book');
      expect(result.author).toBe('Author One, Author Two');
      expect(result.publishedDate).toBe('2021-01-01');
      expect(result.description).toBe('This is a test book description');
      expect(result.thumbnail).toBe('https://example.com/thumbnail.jpg');
      expect(result.status).toBe('want-to-read');
    });

    it('should use default values for missing optional fields', () => {
      const googleBook: GoogleBookItem = {
        id: 'test-id',
        volumeInfo: {
          title: 'Test Book'
        }
      };

      const result = mapGoogleBookToBook(googleBook);

      expect(result.id).toBe('test-id');
      expect(result.title).toBe('Test Book');
      expect(result.author).toBe('Unknown Author');
      expect(result.publishedDate).toBe('Unknown Date');
      expect(result.description).toBe('No description available');
      expect(result.thumbnail).toContain('placeholder');
    });

    it('should accept custom status', () => {
      const googleBook: GoogleBookItem = {
        id: 'test-id',
        volumeInfo: {
          title: 'Test Book'
        }
      };

      const result = mapGoogleBookToBook(googleBook, 'currently-reading');

      expect(result.status).toBe('currently-reading');
    });

    it('should handle empty authors array', () => {
      const googleBook: GoogleBookItem = {
        id: 'test-id',
        volumeInfo: {
          title: 'Test Book',
          authors: []
        }
      };

      const result = mapGoogleBookToBook(googleBook);

      expect(result.author).toBe('Unknown Author');
    });

    it('should handle single author', () => {
      const googleBook: GoogleBookItem = {
        id: 'test-id',
        volumeInfo: {
          title: 'Test Book',
          authors: ['Single Author']
        }
      };

      const result = mapGoogleBookToBook(googleBook);

      expect(result.author).toBe('Single Author');
    });
  });
});
