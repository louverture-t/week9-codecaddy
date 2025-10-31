import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CollectionPage from '../CollectionPage';
import { BookCollectionProvider } from '../../contexts/BookCollectionContext';
import type { Book } from '../../shared/types';

// Mock books data for testing
const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    publishedDate: '1925',
    description: 'A classic American novel',
    thumbnail: 'https://example.com/gatsby.jpg',
    status: 'currently-reading'
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    publishedDate: '1960',
    description: 'A novel about racial injustice',
    thumbnail: 'https://example.com/mockingbird.jpg',
    status: 'want-to-read'
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    publishedDate: '1949',
    description: 'A dystopian social science fiction novel',
    thumbnail: 'https://example.com/1984.jpg',
    status: 'have-read'
  },
  {
    id: '4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    publishedDate: '1813',
    description: 'A romantic novel of manners',
    thumbnail: 'https://example.com/pride.jpg',
    status: 'have-read'
  }
];

// Helper function to render with providers
const renderWithProviders = (ui: React.ReactElement, initialBooks: Book[] = []) => {
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
    <BrowserRouter>
      <BookCollectionProvider>
        {ui}
      </BookCollectionProvider>
    </BrowserRouter>
  );
};

describe('CollectionPage', () => {
  describe('Empty State', () => {
    it('should display empty state message when collection is empty', () => {
      renderWithProviders(<CollectionPage />, []);

      expect(screen.getByText('Your collection is empty.')).toBeInTheDocument();
      expect(screen.getByText('Search for Books')).toBeInTheDocument();
    });

    it('should have a link to search page in empty state', () => {
      renderWithProviders(<CollectionPage />, []);

      const searchLink = screen.getByRole('link', { name: /search for books/i });
      expect(searchLink).toHaveAttribute('href', '/search');
    });
  });

  describe('Collection Display', () => {
    it('should display all books when "All" filter is selected', () => {
      renderWithProviders(<CollectionPage />, mockBooks);

      // Check if all books are displayed
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument();
      expect(screen.getByText('1984')).toBeInTheDocument();
      expect(screen.getByText('Pride and Prejudice')).toBeInTheDocument();
    });

    it('should display book count in filter tabs', () => {
      renderWithProviders(<CollectionPage />, mockBooks);

      expect(screen.getByText(/All \(4\)/)).toBeInTheDocument();
      expect(screen.getByText(/Reading \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Want to Read \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Have Read \(2\)/)).toBeInTheDocument();
    });

    it('should display book details correctly', () => {
      renderWithProviders(<CollectionPage />, mockBooks);

      const book = mockBooks[0];
      expect(screen.getByText(book.title)).toBeInTheDocument();
      expect(screen.getByText(`by ${book.author}`)).toBeInTheDocument();

      const bookImage = screen.getByAltText(book.title);
      expect(bookImage).toHaveAttribute('src', book.thumbnail);
    });
  });

  describe('Filtering', () => {
    it('should filter books by "Currently Reading" status', () => {
      renderWithProviders(<CollectionPage />, mockBooks);

      const readingButton = screen.getByText(/Reading \(1\)/);
      fireEvent.click(readingButton);

      // Should show only the currently reading book
      expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
      expect(screen.queryByText('To Kill a Mockingbird')).not.toBeInTheDocument();
      expect(screen.queryByText('1984')).not.toBeInTheDocument();
    });

    it('should filter books by "Want to Read" status', () => {
      renderWithProviders(<CollectionPage />, mockBooks);

      const wantToReadButton = screen.getByText(/Want to Read \(1\)/);
      fireEvent.click(wantToReadButton);

      // Should show only the want to read book
      expect(screen.getByText('To Kill a Mockingbird')).toBeInTheDocument();
      expect(screen.queryByText('The Great Gatsby')).not.toBeInTheDocument();
      expect(screen.queryByText('1984')).not.toBeInTheDocument();
    });

    it('should filter books by "Have Read" status', () => {
      renderWithProviders(<CollectionPage />, mockBooks);

      const haveReadButton = screen.getByText(/Have Read \(2\)/);
      fireEvent.click(haveReadButton);

      // Should show only the have read books
      expect(screen.getByText('1984')).toBeInTheDocument();
      expect(screen.getByText('Pride and Prejudice')).toBeInTheDocument();
      expect(screen.queryByText('The Great Gatsby')).not.toBeInTheDocument();
      expect(screen.queryByText('To Kill a Mockingbird')).not.toBeInTheDocument();
    });

    it('should show empty state for filter with no books', () => {
      const singleBook: Book[] = [{
        id: '1',
        title: 'Test Book',
        author: 'Test Author',
        publishedDate: '2024',
        description: 'Test description',
        thumbnail: 'https://example.com/test.jpg',
        status: 'currently-reading'
      }];

      renderWithProviders(<CollectionPage />, singleBook);

      // Click on "Want to Read" which has no books
      const wantToReadButton = screen.getByText(/Want to Read \(0\)/);
      fireEvent.click(wantToReadButton);

      expect(screen.getByText('No books in this category yet.')).toBeInTheDocument();
    });

    it('should highlight active filter button', () => {
      renderWithProviders(<CollectionPage />, mockBooks);

      const allButton = screen.getByText(/All \(4\)/);
      expect(allButton).toHaveClass('bg-blue-500', 'text-white');

      const readingButton = screen.getByText(/Reading \(1\)/);
      fireEvent.click(readingButton);

      expect(readingButton).toHaveClass('bg-blue-500', 'text-white');
      expect(allButton).not.toHaveClass('bg-blue-500', 'text-white');
    });
  });

  describe('Book Status Management', () => {
    it('should allow changing book status', () => {
      renderWithProviders(<CollectionPage />, mockBooks);

      // Find the status dropdown for the first book
      const statusSelects = screen.getAllByLabelText(/Change Status:/);
      const firstSelect = statusSelects[0];

      // Change status
      fireEvent.change(firstSelect, { target: { value: 'have-read' } });

      // The status should be updated (we can verify by checking if the value changed)
      expect(firstSelect).toHaveValue('have-read');
    });

    it('should display correct status badge', () => {
      renderWithProviders(<CollectionPage />, mockBooks);

      // Check for status badges - use getAllByText since these appear in multiple places (badges + dropdowns)
      const currentlyReadingElements = screen.getAllByText('Currently Reading');
      expect(currentlyReadingElements.length).toBeGreaterThan(0);

      const wantToReadElements = screen.getAllByText('Want to Read');
      expect(wantToReadElements.length).toBeGreaterThan(0);

      const haveReadElements = screen.getAllByText('Have Read');
      expect(haveReadElements.length).toBeGreaterThan(0);
    });
  });

  describe('Book Removal', () => {
    it('should have remove button for each book', () => {
      renderWithProviders(<CollectionPage />, mockBooks);

      const removeButtons = screen.getAllByText('Remove from Collection');
      expect(removeButtons).toHaveLength(mockBooks.length);
    });

    it('should remove book from collection when remove button is clicked', () => {
      renderWithProviders(<CollectionPage />, mockBooks);

      // Get all remove buttons and click the first one
      const removeButtons = screen.getAllByText('Remove from Collection');
      fireEvent.click(removeButtons[0]);

      // The book should be removed (we verify by checking the count decreased)
      // Note: This will trigger a re-render with updated counts
      expect(screen.queryByText('The Great Gatsby')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should have "Add Books" button linking to search page', () => {
      renderWithProviders(<CollectionPage />, mockBooks);

      const addBooksLink = screen.getByRole('link', { name: /add books/i });
      expect(addBooksLink).toHaveAttribute('href', '/search');
    });

    it('should have links to book details page', () => {
      renderWithProviders(<CollectionPage />, mockBooks);

      const bookLinks = screen.getAllByRole('link');
      const detailsLinks = bookLinks.filter(link =>
        link.getAttribute('href')?.startsWith('/book/')
      );

      expect(detailsLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should render filter tabs with overflow handling', () => {
      renderWithProviders(<CollectionPage />, mockBooks);

      const filterContainer = screen.getByText(/All \(4\)/).parentElement;
      expect(filterContainer).toHaveClass('overflow-x-auto');
    });

    it('should use responsive grid for books', () => {
      renderWithProviders(<CollectionPage />, mockBooks);

      // Find the grid container
      const gridContainer = screen.getByText('The Great Gatsby')
        .closest('.grid');

      expect(gridContainer).toHaveClass('md:grid-cols-2', 'lg:grid-cols-3');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders(<CollectionPage />, mockBooks);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('My Collection');
    });

    it('should have accessible labels for status selects', () => {
      renderWithProviders(<CollectionPage />, mockBooks);

      mockBooks.forEach(book => {
        const label = screen.getByLabelText(`Change Status:`, {
          selector: `#status-${book.id}`
        });
        expect(label).toBeInTheDocument();
      });
    });

    it('should have descriptive alt text for images', () => {
      renderWithProviders(<CollectionPage />, mockBooks);

      mockBooks.forEach(book => {
        const image = screen.getByAltText(book.title);
        expect(image).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty author gracefully', () => {
      const bookWithoutAuthor: Book[] = [{
        id: '1',
        title: 'Test Book',
        author: '',
        publishedDate: '2024',
        description: 'Test description',
        thumbnail: 'https://example.com/test.jpg',
        status: 'want-to-read'
      }];

      renderWithProviders(<CollectionPage />, bookWithoutAuthor);

      expect(screen.getByText('Test Book')).toBeInTheDocument();
      expect(screen.getByText('by')).toBeInTheDocument();
    });

    it('should handle missing thumbnail gracefully', () => {
      const bookWithoutThumbnail: Book[] = [{
        id: '1',
        title: 'Test Book',
        author: 'Test Author',
        publishedDate: '2024',
        description: 'Test description',
        thumbnail: '',
        status: 'want-to-read'
      }];

      renderWithProviders(<CollectionPage />, bookWithoutThumbnail);

      const image = screen.getByAltText('Test Book');
      // Image should exist and display even with empty thumbnail
      expect(image).toBeInTheDocument();
    });

    it('should handle long book titles', () => {
      const bookWithLongTitle: Book[] = [{
        id: '1',
        title: 'This is a Very Long Book Title That Should Be Truncated or Handled Properly in the UI',
        author: 'Test Author',
        publishedDate: '2024',
        description: 'Test description',
        thumbnail: 'https://example.com/test.jpg',
        status: 'want-to-read'
      }];

      renderWithProviders(<CollectionPage />, bookWithLongTitle);

      expect(screen.getByText(/This is a Very Long Book Title/)).toBeInTheDocument();
    });
  });
});
