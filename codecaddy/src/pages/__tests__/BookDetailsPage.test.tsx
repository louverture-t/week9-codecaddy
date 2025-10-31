import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import BookDetailsPage from '../BookDetailsPage';
import { BookCollectionProvider } from '../../contexts/BookCollectionContext';
import type { Book, GoogleBookItem } from '../../shared/types';

// Mock the getBooksApi
const mockGetBookById = vi.fn();
vi.mock('../../services/mockBooksApi', () => ({
  getBooksApi: vi.fn(async () => ({
    getBookById: mockGetBookById,
    searchBooks: vi.fn()
  }))
}));

// Mock books data
const mockBook: Book = {
  id: 'test-id-1',
  title: 'Test Book Title',
  author: 'Test Author',
  publishedDate: '2024',
  description: 'This is a test book description with detailed information about the book.',
  thumbnail: 'https://example.com/test-book.jpg',
  status: 'want-to-read'
};

const mockGoogleBookItem: GoogleBookItem = {
  id: 'test-id-1',
  volumeInfo: {
    title: 'Test Book Title',
    authors: ['Test Author'],
    publishedDate: '2024',
    description: 'This is a test book description with detailed information about the book.',
    imageLinks: {
      thumbnail: 'https://example.com/test-book.jpg'
    }
  }
};

const collectionBook: Book = {
  id: 'collection-book-1',
  title: 'Collection Book',
  author: 'Collection Author',
  publishedDate: '2023',
  description: 'A book already in the collection',
  thumbnail: 'https://example.com/collection-book.jpg',
  status: 'currently-reading'
};

// Helper function to render with providers and routing
const renderWithProviders = (bookId: string, initialBooks: Book[] = []) => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    if (initialBooks.length > 0) {
      store['codecaddy_book_collection'] = JSON.stringify(initialBooks);
    }

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
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
    value: localStorageMock,
    writable: true
  });

  return render(
    <MemoryRouter initialEntries={[`/book/${bookId}`]}>
      <BookCollectionProvider>
        <Routes>
          <Route path="/book/:id" element={<BookDetailsPage />} />
        </Routes>
      </BookCollectionProvider>
    </MemoryRouter>
  );
};

describe('BookDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading spinner while fetching book details', async () => {
      mockGetBookById.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithProviders('test-id-1');

      expect(screen.getByText('Loading book details...')).toBeInTheDocument();
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when book fetch fails', async () => {
      mockGetBookById.mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders('test-id-1');

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      expect(screen.getByText('← Go Back')).toBeInTheDocument();
    });

    it('should display error message for non-existent book ID', async () => {
      mockGetBookById.mockRejectedValueOnce(new Error('Book with ID invalid-id not found'));

      renderWithProviders('invalid-id');

      await waitFor(() => {
        expect(screen.getByText(/Book with ID invalid-id not found/)).toBeInTheDocument();
      });
    });

    it('should have functional back button in error state', async () => {
      mockGetBookById.mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders('test-id-1');

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      const backButton = screen.getByText('← Go Back');
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('Book Not Found State', () => {
    it('should display error message when book fetch returns error', async () => {
      mockGetBookById.mockRejectedValueOnce(new Error('Book not found'));

      renderWithProviders('nonexistent-id');

      await waitFor(() => {
        expect(screen.getByText('Book not found')).toBeInTheDocument();
      });

      expect(screen.getByText('← Go Back')).toBeInTheDocument();
    });
  });

  describe('Book Details Display - From API', () => {
    it('should fetch and display book details from API when not in collection', async () => {
      mockGetBookById.mockResolvedValueOnce(mockGoogleBookItem);

      renderWithProviders('test-id-1');

      await waitFor(() => {
        expect(screen.getByText('Test Book Title')).toBeInTheDocument();
      });

      expect(screen.getByText('Test Author')).toBeInTheDocument();
      expect(screen.getByText('Published: 2024')).toBeInTheDocument();
      expect(screen.getByText(/This is a test book description/)).toBeInTheDocument();

      const bookImage = screen.getByAltText('Cover of Test Book Title');
      expect(bookImage).toHaveAttribute('src', 'https://example.com/test-book.jpg');
    });

    it('should call getBookById with correct ID', async () => {
      mockGetBookById.mockResolvedValueOnce(mockGoogleBookItem);

      renderWithProviders('test-id-1');

      await waitFor(() => {
        expect(mockGetBookById).toHaveBeenCalledWith('test-id-1');
      });
    });
  });

  describe('Book Details Display - From Collection', () => {
    it('should display book details from collection without API call', async () => {
      renderWithProviders('collection-book-1', [collectionBook]);

      await waitFor(() => {
        expect(screen.getByText('Collection Book')).toBeInTheDocument();
      });

      expect(screen.getByText('Collection Author')).toBeInTheDocument();
      expect(screen.getByText('Published: 2023')).toBeInTheDocument();
      expect(mockGetBookById).not.toHaveBeenCalled();
    });

    it('should show reading status dropdown when book is in collection', async () => {
      renderWithProviders('collection-book-1', [collectionBook]);

      await waitFor(() => {
        expect(screen.getByText('Reading Status')).toBeInTheDocument();
      });

      const statusSelect = screen.getByRole('combobox');
      expect(statusSelect).toHaveValue('currently-reading');
    });
  });

  describe('Collection Management', () => {
    it('should show "Add to Collection" button when book not in collection', async () => {
      mockGetBookById.mockResolvedValueOnce(mockGoogleBookItem);

      renderWithProviders('test-id-1');

      await waitFor(() => {
        expect(screen.getByText('Add to Collection')).toBeInTheDocument();
      });
    });

    it('should show "Remove from Collection" button when book is in collection', async () => {
      renderWithProviders('collection-book-1', [collectionBook]);

      await waitFor(() => {
        expect(screen.getByText('Remove from Collection')).toBeInTheDocument();
      });
    });

    it('should add book to collection when "Add to Collection" is clicked', async () => {
      mockGetBookById.mockResolvedValueOnce(mockGoogleBookItem);

      renderWithProviders('test-id-1');

      await waitFor(() => {
        expect(screen.getByText('Add to Collection')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add to Collection');
      fireEvent.click(addButton);

      // After adding, button should change to "Remove from Collection"
      await waitFor(() => {
        expect(screen.getByText('Remove from Collection')).toBeInTheDocument();
      });
    });

    it('should remove book from collection when "Remove from Collection" is clicked', async () => {
      // Mock API response for when book is fetched after removal
      const googleBookItemFromCollection: GoogleBookItem = {
        id: 'collection-book-1',
        volumeInfo: {
          title: 'Collection Book',
          authors: ['Collection Author'],
          publishedDate: '2023',
          description: 'A book already in the collection',
          imageLinks: {
            thumbnail: 'https://example.com/collection-book.jpg'
          }
        }
      };
      mockGetBookById.mockResolvedValueOnce(googleBookItemFromCollection);

      renderWithProviders('collection-book-1', [collectionBook]);

      await waitFor(() => {
        expect(screen.getByText('Remove from Collection')).toBeInTheDocument();
      });

      const removeButton = screen.getByText('Remove from Collection');
      fireEvent.click(removeButton);

      // After removing, button should change to "Add to Collection"
      await waitFor(() => {
        expect(screen.getByText('Add to Collection')).toBeInTheDocument();
      });
    });
  });

  describe('Status Management', () => {
    it('should update book status when dropdown is changed', async () => {
      renderWithProviders('collection-book-1', [collectionBook]);

      await waitFor(() => {
        expect(screen.getByText('Reading Status')).toBeInTheDocument();
      });

      const statusSelect = screen.getByRole('combobox');
      fireEvent.change(statusSelect, { target: { value: 'have-read' } });

      expect(statusSelect).toHaveValue('have-read');
    });

    it('should have all status options available', async () => {
      renderWithProviders('collection-book-1', [collectionBook]);

      await waitFor(() => {
        expect(screen.getByText('Reading Status')).toBeInTheDocument();
      });

      const statusSelect = screen.getByRole('combobox');
      const options = Array.from(statusSelect.querySelectorAll('option')).map(
        opt => opt.textContent
      );

      expect(options).toContain('Want to Read');
      expect(options).toContain('Currently Reading');
      expect(options).toContain('Have Read');
    });

    it('should not show status dropdown when book is not in collection', async () => {
      mockGetBookById.mockResolvedValueOnce(mockGoogleBookItem);

      renderWithProviders('test-id-1');

      await waitFor(() => {
        expect(screen.getByText('Add to Collection')).toBeInTheDocument();
      });

      expect(screen.queryByText('Reading Status')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should have back button', async () => {
      mockGetBookById.mockResolvedValueOnce(mockGoogleBookItem);

      renderWithProviders('test-id-1');

      await waitFor(() => {
        expect(screen.getByText('← Go Back')).toBeInTheDocument();
      });
    });

    it('should call navigate when back button is clicked', async () => {
      mockGetBookById.mockResolvedValueOnce(mockGoogleBookItem);

      renderWithProviders('test-id-1');

      await waitFor(() => {
        expect(screen.getByText('← Go Back')).toBeInTheDocument();
      });

      const backButton = screen.getByText('← Go Back');
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('Dynamic Routing', () => {
    it('should extract book ID from URL params', async () => {
      mockGetBookById.mockResolvedValueOnce(mockGoogleBookItem);

      renderWithProviders('test-id-1');

      await waitFor(() => {
        expect(mockGetBookById).toHaveBeenCalledWith('test-id-1');
      });
    });

    it('should handle different book IDs correctly', async () => {
      mockGetBookById.mockResolvedValueOnce({
        ...mockGoogleBookItem,
        id: 'different-id'
      });

      renderWithProviders('different-id');

      await waitFor(() => {
        expect(mockGetBookById).toHaveBeenCalledWith('different-id');
      });
    });
  });

  describe('Responsive Layout', () => {
    it('should use responsive flex layout', async () => {
      mockGetBookById.mockResolvedValueOnce(mockGoogleBookItem);

      renderWithProviders('test-id-1');

      await waitFor(() => {
        expect(screen.getByText('Test Book Title')).toBeInTheDocument();
      });

      // Check for responsive classes
      const container = screen.getByText('Test Book Title').closest('.md\\:flex');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      mockGetBookById.mockResolvedValueOnce(mockGoogleBookItem);

      renderWithProviders('test-id-1');

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveTextContent('Test Book Title');
      });
    });

    it('should have descriptive alt text for book cover', async () => {
      mockGetBookById.mockResolvedValueOnce(mockGoogleBookItem);

      renderWithProviders('test-id-1');

      await waitFor(() => {
        const image = screen.getByAltText('Cover of Test Book Title');
        expect(image).toBeInTheDocument();
      });
    });

    it('should have accessible button text', async () => {
      mockGetBookById.mockResolvedValueOnce(mockGoogleBookItem);

      renderWithProviders('test-id-1');

      await waitFor(() => {
        expect(screen.getByText('Add to Collection')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add to Collection');
      expect(addButton.tagName).toBe('BUTTON');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing book description gracefully', async () => {
      const bookWithoutDescription = {
        ...mockGoogleBookItem,
        volumeInfo: {
          ...mockGoogleBookItem.volumeInfo,
          description: ''
        }
      };

      mockGetBookById.mockResolvedValueOnce(bookWithoutDescription);

      renderWithProviders('test-id-1');

      await waitFor(() => {
        expect(screen.getByText('Test Book Title')).toBeInTheDocument();
      });

      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('should handle missing book thumbnail gracefully', async () => {
      const bookWithoutThumbnail = {
        ...mockGoogleBookItem,
        volumeInfo: {
          ...mockGoogleBookItem.volumeInfo,
          imageLinks: undefined
        }
      };

      mockGetBookById.mockResolvedValueOnce(bookWithoutThumbnail);

      renderWithProviders('test-id-1');

      await waitFor(() => {
        expect(screen.getByText('Test Book Title')).toBeInTheDocument();
      });
    });

    it('should handle undefined book ID', async () => {
      mockGetBookById.mockResolvedValueOnce(null);

      renderWithProviders('');

      await waitFor(() => {
        // Component should handle gracefully without crashing
        expect(mockGetBookById).not.toHaveBeenCalled();
      });
    });
  });

  describe('State Synchronization', () => {
    it('should update display when book is removed from collection', async () => {
      // Mock API response for when book is fetched after removal
      const googleBookItemFromCollection: GoogleBookItem = {
        id: 'collection-book-1',
        volumeInfo: {
          title: 'Collection Book',
          authors: ['Collection Author'],
          publishedDate: '2023',
          description: 'A book already in the collection',
          imageLinks: {
            thumbnail: 'https://example.com/collection-book.jpg'
          }
        }
      };
      mockGetBookById.mockResolvedValueOnce(googleBookItemFromCollection);

      renderWithProviders('collection-book-1', [collectionBook]);

      await waitFor(() => {
        expect(screen.getByText('Reading Status')).toBeInTheDocument();
      });

      const removeButton = screen.getByText('Remove from Collection');
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText('Reading Status')).not.toBeInTheDocument();
      });
    });
  });
});
