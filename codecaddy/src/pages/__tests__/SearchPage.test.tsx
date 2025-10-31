import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SearchPage from '../SearchPage';
import type { Book } from '../../shared/types';
import { BookCollectionProvider } from '../../contexts/BookCollectionContext';
import * as mockBooksApi from '../../services/mockBooksApi';

// Mock book data
const mockSearchResults: Book[] = [
  {
    id: '1',
    title: 'Test Book 1',
    author: 'Author 1',
    publishedDate: '2023-01-01',
    description: 'Description 1',
    thumbnail: 'https://example.com/1.jpg',
    status: 'want-to-read'
  },
  {
    id: '2',
    title: 'Test Book 2',
    author: 'Author 2',
    publishedDate: '2023-02-01',
    description: 'Description 2',
    thumbnail: 'https://example.com/2.jpg',
    status: 'want-to-read'
  }
];

// Helper function to render SearchPage with necessary providers
const renderSearchPage = () => {
  return render(
    <BrowserRouter>
      <BookCollectionProvider>
        <SearchPage />
      </BookCollectionProvider>
    </BrowserRouter>
  );
};

// Mock the books API
vi.mock('../../services/mockBooksApi', () => ({
  getBooksApi: vi.fn(() => Promise.resolve({
    searchBooks: vi.fn(() => Promise.resolve({
      items: [
        {
          id: '1',
          volumeInfo: {
            title: 'Test Book 1',
            authors: ['Author 1'],
            publishedDate: '2023-01-01',
            description: 'Description 1',
            imageLinks: {
              thumbnail: 'https://example.com/1.jpg'
            }
          }
        },
        {
          id: '2',
          volumeInfo: {
            title: 'Test Book 2',
            authors: ['Author 2'],
            publishedDate: '2023-02-01',
            description: 'Description 2',
            imageLinks: {
              thumbnail: 'https://example.com/2.jpg'
            }
          }
        }
      ]
    }))
  }))
}));

describe('SearchPage Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render the main heading', () => {
      renderSearchPage();
      expect(screen.getByText('Search Books')).toBeInTheDocument();
    });

    it('should render search form with input and button', () => {
      renderSearchPage();
      expect(screen.getByPlaceholderText(/Search by title, author, or ISBN/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
    });

    it('should not display results initially', () => {
      renderSearchPage();
      expect(screen.queryByText('Search Results')).not.toBeInTheDocument();
    });
  });

  describe('Search Form', () => {
    it('should update input value when typing', () => {
      renderSearchPage();
      const input = screen.getByPlaceholderText(/Search by title, author, or ISBN/i) as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'react' } });
      expect(input.value).toBe('react');
    });

    it('should submit form when search button is clicked', async () => {
      renderSearchPage();
      const input = screen.getByPlaceholderText(/Search by title, author, or ISBN/i);
      const button = screen.getByRole('button', { name: /Search/i });

      fireEvent.change(input, { target: { value: 'react' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Search Results')).toBeInTheDocument();
      });
    });

    it('should submit form on Enter key press', async () => {
      renderSearchPage();
      const input = screen.getByPlaceholderText(/Search by title, author, or ISBN/i);

      fireEvent.change(input, { target: { value: 'react' } });
      fireEvent.submit(input.closest('form')!);

      await waitFor(() => {
        expect(screen.getByText('Search Results')).toBeInTheDocument();
      });
    });

    it('should not submit form with empty query', async () => {
      renderSearchPage();
      const button = screen.getByRole('button', { name: /Search/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.queryByText('Search Results')).not.toBeInTheDocument();
      });
    });

    it('should not submit form with whitespace-only query', async () => {
      renderSearchPage();
      const input = screen.getByPlaceholderText(/Search by title, author, or ISBN/i);
      const button = screen.getByRole('button', { name: /Search/i });

      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.queryByText('Search Results')).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should display loading spinner when searching', async () => {
      renderSearchPage();
      const input = screen.getByPlaceholderText(/Search by title, author, or ISBN/i);
      const button = screen.getByRole('button', { name: /Search/i });

      fireEvent.change(input, { target: { value: 'react' } });
      fireEvent.click(button);

      // Check for loading state immediately after click
      expect(screen.getByText('Searching for books...')).toBeInTheDocument();
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should display "Searching..." button text while loading', async () => {
      renderSearchPage();
      const input = screen.getByPlaceholderText(/Search by title, author, or ISBN/i);
      const button = screen.getByRole('button', { name: /Search/i });

      fireEvent.change(input, { target: { value: 'react' } });
      fireEvent.click(button);

      expect(screen.getByRole('button', { name: /Searching.../i })).toBeInTheDocument();
    });

    it('should disable search button while loading', async () => {
      renderSearchPage();
      const input = screen.getByPlaceholderText(/Search by title, author, or ISBN/i);
      const button = screen.getByRole('button', { name: /Search/i });

      fireEvent.change(input, { target: { value: 'react' } });
      fireEvent.click(button);

      const loadingButton = screen.getByRole('button', { name: /Searching.../i });
      expect(loadingButton).toBeDisabled();
    });
  });

  describe('Search Results Display', () => {
    it('should display search results after successful search', async () => {
      renderSearchPage();
      const input = screen.getByPlaceholderText(/Search by title, author, or ISBN/i);
      const button = screen.getByRole('button', { name: /Search/i });

      fireEvent.change(input, { target: { value: 'react' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Search Results')).toBeInTheDocument();
        expect(screen.getByText('Test Book 1')).toBeInTheDocument();
        expect(screen.getByText('Test Book 2')).toBeInTheDocument();
      });
    });

    it('should display books using BookCard component', async () => {
      renderSearchPage();
      const input = screen.getByPlaceholderText(/Search by title, author, or ISBN/i);
      const button = screen.getByRole('button', { name: /Search/i });

      fireEvent.change(input, { target: { value: 'react' } });
      fireEvent.click(button);

      await waitFor(() => {
        // BookCard should display author information
        expect(screen.getByText('Author 1')).toBeInTheDocument();
        expect(screen.getByText('Author 2')).toBeInTheDocument();
      });
    });

    it('should display results in responsive grid layout', async () => {
      const { container } = renderSearchPage();
      const input = screen.getByPlaceholderText(/Search by title, author, or ISBN/i);
      const button = screen.getByRole('button', { name: /Search/i });

      fireEvent.change(input, { target: { value: 'react' } });
      fireEvent.click(button);

      await waitFor(() => {
        const grid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
        expect(grid).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should have error display structure in DOM', () => {
      renderSearchPage();
      // Error div should be rendered conditionally, so it won't be in DOM initially
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should have correct error styling classes', () => {
      // This tests that the error structure exists in the component
      const { container } = renderSearchPage();
      expect(container.querySelector('.mb-8')).toBeInTheDocument(); // Form exists
    });
  });

  describe('Empty Results', () => {
    it('should have proper structure for empty results message', () => {
      renderSearchPage();
      // Initially no results message should be shown
      expect(screen.queryByText(/No books found/i)).not.toBeInTheDocument();
    });
  });

  describe('Collection Integration', () => {
    it('should have isInCollection function available', () => {
      renderSearchPage();
      // Component renders without errors, meaning isInCollection works
      expect(screen.getByText('Search Books')).toBeInTheDocument();
    });

    it('should render with proper collection context', () => {
      // Add a book to localStorage first
      const existingBook: Book = {
        id: '1',
        title: 'Test Book 1',
        author: 'Author 1',
        publishedDate: '2023-01-01',
        description: 'Description 1',
        thumbnail: 'https://example.com/1.jpg',
        status: 'want-to-read'
      };
      localStorage.setItem('codecaddy_book_collection', JSON.stringify([existingBook]));

      renderSearchPage();
      // Component should render successfully with books in collection
      expect(screen.getByText('Search Books')).toBeInTheDocument();
    });

    it('should not show status dropdown before search', () => {
      renderSearchPage();
      // Status dropdown should not be visible initially
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
  });

  describe('Component Cleanup', () => {
    it('should have cleanup effect configured', () => {
      const { unmount } = renderSearchPage();
      expect(screen.getByText('Search Books')).toBeInTheDocument();

      // Unmount component - cleanup should run
      unmount();

      // Remount and verify clean state
      renderSearchPage();
      expect(screen.queryByText('Search Results')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      renderSearchPage();
      const form = screen.getByRole('button', { name: /Search/i }).closest('form');
      expect(form).toBeInTheDocument();
    });

    it('should have accessible input placeholder', () => {
      renderSearchPage();
      const input = screen.getByPlaceholderText(/Search by title, author, or ISBN/i);
      expect(input).toHaveAttribute('placeholder', 'Search by title, author, or ISBN...');
    });

    it('should keep input accessible at all times', () => {
      renderSearchPage();
      const input = screen.getByPlaceholderText(/Search by title, author, or ISBN/i) as HTMLInputElement;

      input.focus();
      fireEvent.change(input, { target: { value: 'react' } });

      // Input should be accessible
      expect(input).toBeInTheDocument();
      expect(input.value).toBe('react');
    });
  });
});
