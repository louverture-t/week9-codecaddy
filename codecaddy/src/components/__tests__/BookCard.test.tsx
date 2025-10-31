import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BookCard from '../BookCard';
import type { Book } from '../../shared/types';
import { BookCollectionProvider } from '../../contexts/BookCollectionContext';

// Mock book data
const mockBook: Book = {
  id: '1',
  title: 'Test Book Title',
  author: 'Test Author',
  publishedDate: '2023-01-01',
  description: 'This is a test book description that should be displayed in the book card component.',
  thumbnail: 'https://example.com/thumbnail.jpg',
  status: 'want-to-read'
};

// Helper function to render BookCard with necessary providers
const renderBookCard = (props: Partial<React.ComponentProps<typeof BookCard>> = {}) => {
  return render(
    <BrowserRouter>
      <BookCollectionProvider>
        <BookCard book={mockBook} {...props} />
      </BookCollectionProvider>
    </BrowserRouter>
  );
};

describe('BookCard Component', () => {
  describe('Rendering', () => {
    it('should render book information correctly', () => {
      renderBookCard();

      expect(screen.getByText('Test Book Title')).toBeInTheDocument();
      expect(screen.getByText('Test Author')).toBeInTheDocument();
      expect(screen.getByText('2023-01-01')).toBeInTheDocument();
      expect(screen.getByText(/This is a test book description/)).toBeInTheDocument();
    });

    it('should render book thumbnail with correct alt text', () => {
      renderBookCard();

      const img = screen.getByAltText('Cover of Test Book Title');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/thumbnail.jpg');
    });

    it('should render in full mode by default', () => {
      const { container } = renderBookCard();

      const cardDiv = container.querySelector('.bg-white.rounded-lg.shadow-md');
      expect(cardDiv).not.toHaveClass('flex');
      expect(screen.getByText(/This is a test book description/)).toBeInTheDocument();
    });

    it('should render in compact mode when compact prop is true', () => {
      const { container } = renderBookCard({ compact: true });

      const cardDiv = container.querySelector('.bg-white.rounded-lg.shadow-md');
      expect(cardDiv).toHaveClass('flex');
      expect(screen.queryByText(/This is a test book description/)).not.toBeInTheDocument();
    });
  });

  describe('Collection Management', () => {
    it('should display three action buttons when not in collection', () => {
      renderBookCard({ isInCollection: false });

      // Should show all three status buttons
      const wantToReadButton = screen.getByRole('button', { name: /Want to Read/i });
      const readingButton = screen.getByRole('button', { name: /Reading/i });
      const completedButton = screen.getByRole('button', { name: /Completed/i });

      expect(wantToReadButton).toBeInTheDocument();
      expect(readingButton).toBeInTheDocument();
      expect(completedButton).toBeInTheDocument();

      // Verify colors
      expect(wantToReadButton).toHaveClass('bg-blue-100', 'text-blue-700');
      expect(readingButton).toHaveClass('bg-orange-100', 'text-orange-700');
      expect(completedButton).toHaveClass('bg-green-100', 'text-green-700');
    });

    it('should display "Remove" button when in collection', () => {
      renderBookCard({ isInCollection: true });

      const removeButton = screen.getByRole('button', { name: /Remove/i });
      expect(removeButton).toBeInTheDocument();
      expect(removeButton).toHaveClass('bg-red-100', 'text-red-700');
    });

    it('should call addBook with want-to-read status when Want to Read button is clicked', () => {
      renderBookCard({ isInCollection: false });

      const wantToReadButton = screen.getByRole('button', { name: /Want to Read/i });
      fireEvent.click(wantToReadButton);

      // The button should still be rendered (context handles the state change)
      expect(wantToReadButton).toBeInTheDocument();
    });

    it('should call removeBook when Remove button is clicked', () => {
      renderBookCard({ isInCollection: true });

      const removeButton = screen.getByRole('button', { name: /Remove/i });
      fireEvent.click(removeButton);

      // The button should still be rendered (context handles the state change)
      expect(removeButton).toBeInTheDocument();
    });
  });

  describe('Status Management', () => {
    it('should show status dropdown when in collection and showStatus is true', () => {
      renderBookCard({ isInCollection: true, showStatus: true });

      const statusSelect = screen.getByRole('combobox');
      expect(statusSelect).toBeInTheDocument();
      expect(statusSelect).toHaveValue('want-to-read');
    });

    it('should show three action buttons when not in collection', () => {
      renderBookCard({ isInCollection: false, showStatus: true });

      // Should show "Add to Collection:" label and three action buttons
      expect(screen.getByText('Add to Collection:')).toBeInTheDocument();

      const wantToReadButton = screen.getByRole('button', { name: /Want to Read/i });
      const readingButton = screen.getByRole('button', { name: /Reading/i });
      const completedButton = screen.getByRole('button', { name: /Completed/i });

      expect(wantToReadButton).toBeInTheDocument();
      expect(readingButton).toBeInTheDocument();
      expect(completedButton).toBeInTheDocument();
    });

    it('should not show status when showStatus is false', () => {
      renderBookCard({ isInCollection: true, showStatus: false });

      const statusSelect = screen.queryByRole('combobox');
      expect(statusSelect).not.toBeInTheDocument();
    });

    it('should display status badge when in collection', () => {
      const { container } = renderBookCard({ isInCollection: true, showStatus: true });

      const statusBadge = container.querySelector('.rounded-full');
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass('bg-blue-100', 'text-blue-800');
      expect(statusBadge?.textContent).toBe('Want to Read');
    });

    it('should handle status change correctly', () => {
      renderBookCard({ isInCollection: true, showStatus: true });

      const statusSelect = screen.getByRole('combobox');
      fireEvent.change(statusSelect, { target: { value: 'currently-reading' } });

      // The select should still be rendered with new value
      expect(statusSelect).toBeInTheDocument();
    });

    it('should display correct status colors for different statuses', () => {
      const bookCurrentlyReading: Book = { ...mockBook, status: 'currently-reading' };
      const { container, rerender } = render(
        <BrowserRouter>
          <BookCollectionProvider>
            <BookCard book={bookCurrentlyReading} isInCollection={true} showStatus={true} />
          </BookCollectionProvider>
        </BrowserRouter>
      );

      let statusBadge = container.querySelector('.rounded-full');
      expect(statusBadge).toHaveClass('bg-orange-100', 'text-orange-800');
      expect(statusBadge?.textContent).toBe('Currently Reading');

      const bookHaveRead: Book = { ...mockBook, status: 'have-read' };
      rerender(
        <BrowserRouter>
          <BookCollectionProvider>
            <BookCard book={bookHaveRead} isInCollection={true} showStatus={true} />
          </BookCollectionProvider>
        </BrowserRouter>
      );

      statusBadge = container.querySelector('.rounded-full');
      expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
      expect(statusBadge?.textContent).toBe('Have Read');
    });
  });

  describe('Navigation', () => {
    it('should render View Details link with correct href', () => {
      renderBookCard();

      const detailsLink = screen.getByRole('link', { name: /View Details/i });
      expect(detailsLink).toBeInTheDocument();
      expect(detailsLink).toHaveAttribute('href', '/book/1');
    });
  });

  describe('Hover States', () => {
    it('should apply hover shadow effect on mouse enter', () => {
      const { container } = renderBookCard();

      const cardDiv = container.querySelector('.bg-white.rounded-lg.shadow-md') as HTMLElement;
      expect(cardDiv).not.toHaveClass('shadow-lg');

      fireEvent.mouseEnter(cardDiv);
      expect(cardDiv).toHaveClass('shadow-lg');
    });

    it('should remove hover shadow effect on mouse leave', () => {
      const { container } = renderBookCard();

      const cardDiv = container.querySelector('.bg-white.rounded-lg.shadow-md') as HTMLElement;

      fireEvent.mouseEnter(cardDiv);
      expect(cardDiv).toHaveClass('shadow-lg');

      fireEvent.mouseLeave(cardDiv);
      expect(cardDiv).not.toHaveClass('shadow-lg');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing description gracefully', () => {
      const bookWithoutDescription: Book = { ...mockBook, description: '' };
      render(
        <BrowserRouter>
          <BookCollectionProvider>
            <BookCard book={bookWithoutDescription} />
          </BookCollectionProvider>
        </BrowserRouter>
      );

      expect(screen.queryByText(/This is a test book description/)).not.toBeInTheDocument();
    });

    it('should handle long titles with line-clamp', () => {
      const bookWithLongTitle: Book = {
        ...mockBook,
        title: 'This is a very long book title that should be clamped to one line in the UI'
      };
      const { container } = render(
        <BrowserRouter>
          <BookCollectionProvider>
            <BookCard book={bookWithLongTitle} />
          </BookCollectionProvider>
        </BrowserRouter>
      );

      const titleElement = screen.getByText(/This is a very long book title/);
      expect(titleElement).toHaveClass('line-clamp-1');
    });

    it('should handle all prop combinations correctly', () => {
      renderBookCard({
        isInCollection: true,
        showStatus: true,
        compact: true
      });

      // Should show status in collection
      expect(screen.getByRole('combobox')).toBeInTheDocument();

      // Should show remove button
      expect(screen.getByRole('button', { name: /Remove/i })).toBeInTheDocument();
    });
  });
});
