import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../HomePage';
import type { Book } from '../../shared/types';
import { BookCollectionProvider } from '../../contexts/BookCollectionContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper function to render HomePage with necessary providers
const renderHomePage = () => {
  return render(
    <BrowserRouter>
      <BookCollectionProvider>
        <HomePage />
      </BookCollectionProvider>
    </BrowserRouter>
  );
};

// Helper to add books to localStorage before rendering
const setupLocalStorageWithBooks = (books: Book[]) => {
  localStorage.setItem('codecaddy_book_collection', JSON.stringify(books));
};

// Mock books for testing
const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Book 1',
    author: 'Author 1',
    publishedDate: '2023-01-01',
    description: 'Description 1',
    thumbnail: 'https://example.com/1.jpg',
    status: 'currently-reading'
  },
  {
    id: '2',
    title: 'Book 2',
    author: 'Author 2',
    publishedDate: '2023-02-01',
    description: 'Description 2',
    thumbnail: 'https://example.com/2.jpg',
    status: 'have-read'
  },
  {
    id: '3',
    title: 'Book 3',
    author: 'Author 3',
    publishedDate: '2023-03-01',
    description: 'Description 3',
    thumbnail: 'https://example.com/3.jpg',
    status: 'have-read'
  },
  {
    id: '4',
    title: 'Book 4',
    author: 'Author 4',
    publishedDate: '2023-04-01',
    description: 'Description 4',
    thumbnail: 'https://example.com/4.jpg',
    status: 'want-to-read'
  }
];

describe('HomePage Component', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
  });

  describe('Rendering', () => {
    it('should render the main heading', () => {
      renderHomePage();
      expect(screen.getByText('Your Reading Dashboard')).toBeInTheDocument();
    });

    it('should render all three stat cards', () => {
      renderHomePage();
      expect(screen.getByText('Total Books')).toBeInTheDocument();
      expect(screen.getByText('Currently Reading')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should render the progress bar section', () => {
      renderHomePage();
      expect(screen.getByText('Reading Progress')).toBeInTheDocument();
    });

    it('should render quick action buttons', () => {
      renderHomePage();
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Start Searching/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /View Collection/i })).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('should display zero for all stats when collection is empty', () => {
      renderHomePage();

      // Total Books
      const totalBooksCard = screen.getByText('Total Books').closest('div');
      expect(totalBooksCard).toHaveTextContent('0');

      // Currently Reading
      const currentlyReadingCard = screen.getByText('Currently Reading').closest('div');
      expect(currentlyReadingCard).toHaveTextContent('0');

      // Completed
      const completedCard = screen.getByText('Completed').closest('div');
      expect(completedCard).toHaveTextContent('0');
    });

    it('should correctly calculate and display statistics with books', () => {
      setupLocalStorageWithBooks(mockBooks);
      renderHomePage();

      // Total Books: 4
      const totalBooksCard = screen.getByText('Total Books').closest('div');
      expect(totalBooksCard).toHaveTextContent('4');

      // Currently Reading: 1
      const currentlyReadingCard = screen.getByText('Currently Reading').closest('div');
      expect(currentlyReadingCard).toHaveTextContent('1');

      // Completed (Have Read): 2
      const completedCard = screen.getByText('Completed').closest('div');
      expect(completedCard).toHaveTextContent('2');
    });

    it('should display correct descriptive text for each stat', () => {
      renderHomePage();

      expect(screen.getByText('Books in your collection')).toBeInTheDocument();
      expect(screen.getByText('Books in progress')).toBeInTheDocument();
      expect(screen.getByText('Books finished')).toBeInTheDocument();
    });

    it('should apply correct color classes to stat numbers', () => {
      setupLocalStorageWithBooks(mockBooks);
      const { container } = renderHomePage();

      const totalBooksNumber = container.querySelector('.text-blue-500.text-4xl.font-bold');
      expect(totalBooksNumber).toBeInTheDocument();

      const currentlyReadingNumber = container.querySelector('.text-orange-500.text-4xl.font-bold');
      expect(currentlyReadingNumber).toBeInTheDocument();

      const completedNumber = container.querySelector('.text-green-500.text-4xl.font-bold');
      expect(completedNumber).toBeInTheDocument();
    });
  });

  describe('Reading Progress Bar', () => {
    it('should display 0% progress when no books are read', () => {
      renderHomePage();
      expect(screen.getByText('0% of your collection completed')).toBeInTheDocument();
    });

    it('should calculate and display correct progress percentage', () => {
      setupLocalStorageWithBooks(mockBooks);
      renderHomePage();

      // 2 out of 4 books are read = 50%
      expect(screen.getByText('50% of your collection completed')).toBeInTheDocument();
    });

    it('should set correct width style on progress bar', () => {
      setupLocalStorageWithBooks(mockBooks);
      const { container } = renderHomePage();

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveStyle({ width: '50%' });
    });

    it('should have correct ARIA attributes on progress bar', () => {
      setupLocalStorageWithBooks(mockBooks);
      const { container } = renderHomePage();

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should display 100% when all books are read', () => {
      const allReadBooks: Book[] = mockBooks.map(book => ({ ...book, status: 'have-read' }));
      setupLocalStorageWithBooks(allReadBooks);
      renderHomePage();

      expect(screen.getByText('100% of your collection completed')).toBeInTheDocument();
    });

    it('should round percentage to nearest integer', () => {
      // 1 out of 3 books = 33.33% should round to 33%
      const threeBooks = mockBooks.slice(0, 3).map((book, index) => ({
        ...book,
        status: index === 0 ? 'have-read' : 'want-to-read'
      })) as Book[];
      setupLocalStorageWithBooks(threeBooks);
      renderHomePage();

      expect(screen.getByText('33% of your collection completed')).toBeInTheDocument();
    });
  });

  describe('Quick Actions Navigation', () => {
    it('should navigate to /search when Start Searching button is clicked', () => {
      renderHomePage();

      const searchButton = screen.getByRole('button', { name: /Start Searching/i });
      fireEvent.click(searchButton);

      expect(mockNavigate).toHaveBeenCalledWith('/search');
    });

    it('should navigate to /collection when View Collection button is clicked', () => {
      renderHomePage();

      const collectionButton = screen.getByRole('button', { name: /View Collection/i });
      fireEvent.click(collectionButton);

      expect(mockNavigate).toHaveBeenCalledWith('/collection');
    });

    it('should display correct button text and descriptions', () => {
      renderHomePage();

      expect(screen.getByText('Start Searching')).toBeInTheDocument();
      expect(screen.getByText('Discover new books to add to your collection')).toBeInTheDocument();

      expect(screen.getByText('View Collection')).toBeInTheDocument();
      expect(screen.getByText('Browse and manage your book collection')).toBeInTheDocument();
    });

    it('should apply correct color classes to action buttons', () => {
      const { container } = renderHomePage();

      const searchButton = screen.getByRole('button', { name: /Start Searching/i });
      expect(searchButton).toHaveClass('bg-blue-500', 'hover:bg-blue-600');

      const collectionButton = screen.getByRole('button', { name: /View Collection/i });
      expect(collectionButton).toHaveClass('bg-orange-500', 'hover:bg-orange-600');
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive grid classes on stats section', () => {
      const { container } = renderHomePage();

      const statsGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
      expect(statsGrid).toBeInTheDocument();
    });

    it('should have responsive grid classes on quick actions section', () => {
      const { container } = renderHomePage();

      const quickActionsGrid = container.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2');
      expect(quickActionsGrid.length).toBeGreaterThan(0);
    });
  });

  describe('Dynamic Updates', () => {
    it('should update statistics when collection changes', () => {
      // Start with empty collection
      const { container, unmount } = renderHomePage();
      const totalBooksCard = container.querySelector('.text-blue-500.text-4xl.font-bold');
      expect(totalBooksCard).toHaveTextContent('0');

      // Unmount the component
      unmount();

      // Add books to localStorage
      setupLocalStorageWithBooks(mockBooks);

      // Re-render with new data
      const { container: newContainer } = renderHomePage();

      // Stats should reflect the new books
      const newTotalBooksCard = newContainer.querySelector('.text-blue-500.text-4xl.font-bold');
      expect(newTotalBooksCard).toHaveTextContent('4');
    });
  });

  describe('Edge Cases', () => {
    it('should handle collection with only want-to-read books', () => {
      const wantToReadBooks: Book[] = mockBooks.map(book => ({ ...book, status: 'want-to-read' }));
      setupLocalStorageWithBooks(wantToReadBooks);
      renderHomePage();

      expect(screen.getByText('Total Books').closest('div')).toHaveTextContent('4');
      expect(screen.getByText('Currently Reading').closest('div')).toHaveTextContent('0');
      expect(screen.getByText('Completed').closest('div')).toHaveTextContent('0');
      expect(screen.getByText('0% of your collection completed')).toBeInTheDocument();
    });

    it('should handle collection with only currently-reading books', () => {
      const currentlyReadingBooks: Book[] = mockBooks.map(book => ({ ...book, status: 'currently-reading' }));
      setupLocalStorageWithBooks(currentlyReadingBooks);
      renderHomePage();

      expect(screen.getByText('Total Books').closest('div')).toHaveTextContent('4');
      expect(screen.getByText('Currently Reading').closest('div')).toHaveTextContent('4');
      expect(screen.getByText('Completed').closest('div')).toHaveTextContent('0');
      expect(screen.getByText('0% of your collection completed')).toBeInTheDocument();
    });
  });
});
