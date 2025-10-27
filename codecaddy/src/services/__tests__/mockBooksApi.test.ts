import { describe, it, expect } from 'vitest';
import { mockBooksApi, getBooksApi } from '../mockBooksApi';

describe('mockBooksApi', () => {
  describe('searchBooks', () => {
    it('should return all mock books when no query provided', async () => {
      const result = await mockBooksApi.searchBooks({ q: '' });

      expect(result.totalItems).toBe(5);
      expect(result.items).toHaveLength(5);
      expect(result.kind).toBe('books#volumes');
    });

    it('should filter books by title query', async () => {
      const result = await mockBooksApi.searchBooks({ q: 'React' });

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items[0].volumeInfo.title).toContain('React');
    });

    it('should filter books by author query', async () => {
      const result = await mockBooksApi.searchBooks({ q: 'Crockford' });

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items[0].volumeInfo.authors).toContain('Douglas Crockford');
    });

    it('should return empty array for non-matching query', async () => {
      const result = await mockBooksApi.searchBooks({
        q: 'NonExistentBook123'
      });

      expect(result.totalItems).toBe(0);
      expect(result.items).toHaveLength(0);
    });

    it('should simulate API delay', async () => {
      const startTime = Date.now();
      await mockBooksApi.searchBooks({ q: '' });
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(500);
    });
  });

  describe('getBookById', () => {
    it('should return book by ID', async () => {
      const book = await mockBooksApi.getBookById('mock1');

      expect(book.id).toBe('mock1');
      expect(book.volumeInfo.title).toBe('React - The Complete Guide');
    });

    it('should throw error for non-existent book ID', async () => {
      await expect(mockBooksApi.getBookById('invalid-id')).rejects.toThrow(
        'Book with ID invalid-id not found'
      );
    });

    it('should simulate API delay', async () => {
      const startTime = Date.now();
      await mockBooksApi.getBookById('mock1');
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(300);
    });
  });

  describe('getBooksApi', () => {
    it('should return mock API when no API key is configured', async () => {
      const api = await getBooksApi();

      expect(api).toBeDefined();
      expect(api.searchBooks).toBeDefined();
      expect(api.getBookById).toBeDefined();
    });
  });
});
